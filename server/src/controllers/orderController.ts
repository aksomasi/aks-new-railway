import { Request, Response } from 'express';
import { db } from '../database/mysql';
import { emitNewOrder, emitOrderUpdate } from '../websocket/events';

export class OrderController {
  async getAll(req: Request, res: Response) {
    try {
      const [orders] = await db.execute(`
        SELECT * FROM orders ORDER BY created_at DESC
      `);
      
      // Get order items for each order
      for (const order of orders as any[]) {
        const [items] = await db.execute(`
          SELECT oi.*, m.name as menu_item_name
          FROM order_items oi
          JOIN menu_items m ON oi.menu_item_id = m.id
          WHERE oi.order_id = ?
        `, [order.id]);
        order.items = items;
      }
      
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const [orders] = await db.execute(`
        SELECT * FROM orders WHERE id = ?
      `, [id]);
      
      if ((orders as any[]).length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      const order = (orders as any[])[0];
      
      // Get order items
      const [items] = await db.execute(`
        SELECT oi.*, m.name as menu_item_name
        FROM order_items oi
        JOIN menu_items m ON oi.menu_item_id = m.id
        WHERE oi.order_id = ?
      `, [id]);
      
      order.items = items;
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch order' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { customer, items, total } = req.body;
      
      // Generate order number
      const orderNumber = `ORD${Date.now()}`;
      
      // Calculate subtotal and tax
      const subtotal = total / 1.08; // Assuming 8% tax
      const tax = total - subtotal;
      
      // Create order with customer data directly
      const [orderResult] = await db.execute(
        'INSERT INTO orders (order_number, full_name, plate, car_details, subtotal, tax, total, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [orderNumber, customer.name, customer.plate || '', customer.carDetails || '', subtotal, tax, total, 'new']
      );
      const orderId = (orderResult as any).insertId;
      
      // Create order items
      for (const item of items) {
        const customPrice = item.addons ? item.addons.reduce((sum: number, addon: any) => sum + (addon.price || 0), 0) : 0;
        const totalPrice = (item.price + customPrice) * item.quantity;
        
        await db.execute(
          'INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, customizations, custom_price, total_price) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [orderId, item.menu_item_id, item.quantity, item.price, JSON.stringify(item.addons || []), customPrice, totalPrice]
        );
      }
      
      const newOrder = { id: orderId, order_number: orderNumber, full_name: customer.name, plate: customer.plate, car_details: customer.carDetails, total, status: 'new', items };
      
      // Emit new order to dashboard
      emitNewOrder(newOrder);
      
      res.status(201).json({ id: orderId, orderNumber });
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      await db.execute(
        'UPDATE orders SET status = ? WHERE id = ?',
        [status, id]
      );
      
      // Emit order update to dashboard
      emitOrderUpdate({ id, status });
      
      res.json({ message: 'Order status updated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update order status' });
    }
  }
}