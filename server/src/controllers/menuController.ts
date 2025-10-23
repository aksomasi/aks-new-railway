import { Request, Response } from 'express';
import { db } from '../database/mysql';

export class MenuController {
    async getAll(req: Request, res: Response) {
    try {
      const { category } = req.query;
      let query = `
        SELECT m.*, c.name as category_name 
        FROM menu_items m 
        JOIN categories c ON m.category_id = c.id
      `;
      let whereAdded = false;
      const params: any[] = [];
      
      if (category) {
        query += ' WHERE m.category_id = ?';
        params.push(category);
        whereAdded = true;
      }
      
      query += ' ORDER BY c.name, m.name';
      
      const [menuItems] = await db.execute(query, params);
      
      // Get addons for each menu item
      for (const item of menuItems as any[]) {
        const [addons] = await db.execute(`
          SELECT a.id, a.name, a.price, a.available 
          FROM menu_item_addons mia 
          JOIN addons a ON mia.addon_id = a.id 
          WHERE mia.menu_item_id = ?
        `, [item.id]);
        item.addons = (addons as any[]).map(addon => ({
          ...addon,
          available: addon.available !== undefined ? Boolean(addon.available) : true
        }));
      }
      
      res.json(menuItems);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch menu items' });
    }
  }

    async create(req: Request, res: Response) {
    try {
      const { name, description, price, category_id, available } = req.body;
      const file = req.file;
      
      // Check for duplicate name
      const [existing] = await db.execute(
        'SELECT id FROM menu_items WHERE LOWER(name) = LOWER(?)',
        [name]
      );
      
      if ((existing as any[]).length > 0) {
        return res.status(409).json({ error: 'A menu item with this name already exists' });
      }
      
      let image_url = null;
      if (file) {
        image_url = `uploads/${file.filename}`;
      }
      
      // Parse addons from FormData
      let addons = [];
      if (req.body.addons) {
        try {
          addons = JSON.parse(req.body.addons);
        } catch (e) {
          addons = [];
        }
      }
      
      const [result] = await db.execute(
        'INSERT INTO menu_items (name, description, price, category_id, image_url, available) VALUES (?, ?, ?, ?, ?, ?)',
        [name, description, price, category_id, image_url, available !== false]
      );
      const insertId = (result as any).insertId;
      
      // Insert addon associations
      if (addons && Array.isArray(addons)) {
        for (const addonId of addons) {
          await db.execute(
            'INSERT INTO menu_item_addons (menu_item_id, addon_id) VALUES (?, ?)',
            [insertId, addonId]
          );
        }
      }
      
      res.status(201).json({ id: insertId, name, description, price, category_id, image_url, available, addons });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create menu item' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, price, category_id, available } = req.body;
      const file = req.file;
      
      // Get existing menu item
      const [existingItems] = await db.execute('SELECT * FROM menu_items WHERE id = ?', [id]);
      const existingItem = (existingItems as any[])[0];
      
      if (!existingItem) {
        return res.status(404).json({ error: 'Menu item not found' });
      }
      
      // Check for duplicate name if name is being updated
      if (name && name !== existingItem.name) {
        const [duplicateCheck] = await db.execute(
          'SELECT id FROM menu_items WHERE LOWER(name) = LOWER(?) AND id != ?',
          [name, id]
        );
        
        if ((duplicateCheck as any[]).length > 0) {
          return res.status(409).json({ error: 'A menu item with this name already exists' });
        }
      }
      
      // Build dynamic update query
      const updateFields = [];
      const updateValues = [];
      
      if (name && name !== existingItem.name) {
        updateFields.push('name = ?');
        updateValues.push(name);
      }
      
      if (description !== undefined && description !== existingItem.description) {
        updateFields.push('description = ?');
        updateValues.push(description || '');
      }
      
      if (price && parseFloat(price) !== existingItem.price) {
        updateFields.push('price = ?');
        updateValues.push(parseFloat(price));
      }
      
      if (category_id && parseInt(category_id) !== existingItem.category_id) {
        updateFields.push('category_id = ?');
        updateValues.push(parseInt(category_id));
      }
      
      if (available !== undefined) {
        const availableBool = available === 'true' || available === true;
        if (availableBool !== existingItem.available) {
          updateFields.push('available = ?');
          updateValues.push(availableBool);
        }
      }
      
      // Handle image upload
      if (file) {
        const image_url = `uploads/${file.filename}`;
        updateFields.push('image_url = ?');
        updateValues.push(image_url);
      }
      
      // Update menu item if there are changes
      if (updateFields.length > 0) {
        updateValues.push(parseInt(id));
        const updateQuery = `UPDATE menu_items SET ${updateFields.join(', ')} WHERE id = ?`;
        await db.execute(updateQuery, updateValues);
      }              

              
      // Handle addons with precise comparison
      if (req.body.addons !== undefined) {
        // First get current menu item with its addons
        const [menuAddons] = await db.execute(
          'SELECT addon_id FROM menu_item_addons WHERE menu_item_id = ?',
          [id]
        );
        const currentAddonIds = (menuAddons as any[]).map(row => row.addon_id);
        
        // Parse payload addons
        let payloadAddons = [];
        if (typeof req.body.addons === 'string') {
          try {
            payloadAddons = JSON.parse(req.body.addons);
          } catch (e) {
            payloadAddons = [];
          }
        } else if (Array.isArray(req.body.addons)) {
          payloadAddons = req.body.addons;
        }
        
        const payloadAddonIds = payloadAddons.map((id: any) => parseInt(id)).filter((id: number) => !isNaN(id));
        
        
        
        // Find addons to add (in payload but not in current data)
        const addonsToAdd = payloadAddonIds.filter((addonId: number) => !currentAddonIds.includes(addonId));
        
        // Find addons to remove (in current data but not in payload)
        const addonsToRemove = currentAddonIds.filter((addonId: number) => !payloadAddonIds.includes(addonId));
        
       
        
        // Add new addons
        for (const addonId of addonsToAdd) {
          await db.execute(
            'INSERT INTO menu_item_addons (menu_item_id, addon_id) VALUES (?, ?)',
            [id, addonId]
          );
        }
        
        // Remove addons that are no longer selected
        for (const addonId of addonsToRemove) {
          await db.execute(
            'DELETE FROM menu_item_addons WHERE menu_item_id = ? AND addon_id = ?',
            [id, addonId]
          );
        }
      }
      
      res.json({ message: 'Menu item updated successfully' });
    } catch (error) {
      console.error('Update error:', error);
      res.status(500).json({ error: 'Failed to update menu item' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      // Delete addon relationships first
      await db.execute('DELETE FROM menu_item_addons WHERE menu_item_id = ?', [id]);
      // Delete menu item
      await db.execute('DELETE FROM menu_items WHERE id = ?', [id]);
      res.json({ message: 'Menu item deleted successfully' });
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({ error: 'Failed to delete menu item' });
    }
  }
}