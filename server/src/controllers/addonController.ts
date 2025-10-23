import { Request, Response } from 'express';
import { db } from '../database/mysql';

export class AddonController {
  async getAll(req: Request, res: Response) {
    try {
      const [addons] = await db.execute('SELECT * FROM addons ORDER BY name');
      // Convert available from 0/1 to false/true
      const addonsWithAvailable = (addons as any[]).map(addon => ({
        ...addon,
        available: addon.available !== undefined ? Boolean(addon.available) : true
      }));
      res.json(addonsWithAvailable);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch addons' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { name, price } = req.body;
      
      // Check for duplicate name
      const [existing] = await db.execute(
        'SELECT id FROM addons WHERE LOWER(name) = LOWER(?)',
        [name]
      );
      
      if ((existing as any[]).length > 0) {
        return res.status(409).json({ error: 'An addon with this name already exists' });
      }
      
      // Try to insert with available field, fallback without it
      let result;
      try {
        [result] = await db.execute(
          'INSERT INTO addons (name, price, available) VALUES (?, ?, ?)',
          [name, price || 0, 1]
        );
      } catch (columnError) {
        // If available column doesn't exist, insert without it
        [result] = await db.execute(
          'INSERT INTO addons (name, price) VALUES (?, ?)',
          [name, price || 0]
        );
      }
      const insertId = (result as any).insertId;
      res.status(201).json({ id: insertId, name, price });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create addon' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, price, available } = req.body;
      
      // Check for duplicate name (excluding current addon)
      const [existing] = await db.execute(
        'SELECT id FROM addons WHERE LOWER(name) = LOWER(?) AND id != ?',
        [name, id]
      );
      
      if ((existing as any[]).length > 0) {
        return res.status(409).json({ error: 'An addon with this name already exists' });
      }
      
      // Try to update with available field, fallback without it
      try {
        await db.execute(
          'UPDATE addons SET name = ?, price = ?, available = ? WHERE id = ?',
          [name, price, available !== undefined ? (available ? 1 : 0) : 1, id]
        );
      } catch (columnError) {
        // If available column doesn't exist, update without it
        await db.execute(
          'UPDATE addons SET name = ?, price = ? WHERE id = ?',
          [name, price, id]
        );
      }
      res.json({ message: 'Addon updated successfully' });
    } catch (error) {
      console.error('Addon update error:', error);
      res.status(500).json({ error: 'Failed to update addon' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      // Delete addon relationships first
      await db.execute('DELETE FROM menu_item_addons WHERE addon_id = ?', [id]);
      // Delete addon
      await db.execute('DELETE FROM addons WHERE id = ?', [id]);
      res.json({ message: 'Addon deleted successfully' });
    } catch (error) {
      console.error('Delete addon error:', error);
      res.status(500).json({ error: 'Failed to delete addon' });
    }
  }
}