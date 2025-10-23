import { Request, Response } from 'express';
import { db } from '../database/mysql';
import { Category } from '../models/interfaces';

export class CategoryController {
  async getAll(req: Request, res: Response) {
    try {
      const [categories] = await db.execute(`
        SELECT c.*, COUNT(m.id) as itemCount 
        FROM categories c 
        LEFT JOIN menu_items m ON c.id = m.category_id 
        GROUP BY c.id 
        ORDER BY c.id ASC
      `);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { name, description } = req.body;
      
      // Check for duplicate name
      const [existing] = await db.execute(
        'SELECT id FROM categories WHERE LOWER(name) = LOWER(?)',
        [name]
      );
      
      if ((existing as any[]).length > 0) {
        return res.status(409).json({ error: 'A category with this name already exists' });
      }
      
      const [result] = await db.execute(
        'INSERT INTO categories (name, description, available) VALUES (?, ?, ?)',
        [name, description || null, 1]
      );
      const insertId = (result as any).insertId;
      res.status(201).json({ id: insertId, name, description });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create category' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, available } = req.body;
      
      // Check for duplicate name (excluding current category)
      const [existing] = await db.execute(
        'SELECT id FROM categories WHERE LOWER(name) = LOWER(?) AND id != ?',
        [name, id]
      );
      
      if ((existing as any[]).length > 0) {
        return res.status(409).json({ error: 'A category with this name already exists' });
      }
      
      // Update only name and description for now
      await db.execute(
        'UPDATE categories SET name = ?, description = ?, available = ? WHERE id = ?',
        [name, description, available !== undefined ? (available ? 1 : 0) : 1, id]
      );
      
      // If category is being made unavailable, make all menu items in this category unavailable
      if (available === false) {
        await db.execute(
          'UPDATE menu_items SET available = false WHERE category_id = ?',
          [id]
        );
      }
      
      res.json({ message: 'Category updated successfully' });
    } catch (error) {
      console.error('Category update error:', error);
      res.status(500).json({ error: 'Failed to update category' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const [itemCount] = await db.execute('SELECT COUNT(*) as count FROM menu_items WHERE category_id = ?', [id]);
      
      if ((itemCount as any)[0].count > 0) {
        return res.status(400).json({ error: 'Cannot delete category with existing menu items' });
      }

      await db.execute('DELETE FROM categories WHERE id = ?', [id]);
      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete category' });
    }
  }
}