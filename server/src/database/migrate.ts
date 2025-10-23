import { db } from './mysql';

const migrate = async () => {
  try {
   
    
    // Create database if not exists
    await db.execute('CREATE DATABASE IF NOT EXISTS dive_in');
    await db.execute('USE dive_in');
    
    // Drop tables if they exist
    await db.execute('DROP TABLE IF EXISTS order_items');
    await db.execute('DROP TABLE IF EXISTS orders');
    await db.execute('DROP TABLE IF EXISTS customers');
    await db.execute('DROP TABLE IF EXISTS menu_item_addons');
    await db.execute('DROP TABLE IF EXISTS addons');
    await db.execute('DROP TABLE IF EXISTS menu_items');
    await db.execute('DROP TABLE IF EXISTS categories');

    // Create Categories table
    await db.execute(`
      CREATE TABLE categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Menu Items table
    await db.execute(`
      CREATE TABLE menu_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category_id INT NOT NULL,
        image_url TEXT,
        available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      )
    `);

    // Create Add-ons table
    await db.execute(`
      CREATE TABLE addons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Menu Item Add-ons junction table
    await db.execute(`
      CREATE TABLE menu_item_addons (
        menu_item_id INT,
        addon_id INT,
        PRIMARY KEY (menu_item_id, addon_id),
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id),
        FOREIGN KEY (addon_id) REFERENCES addons(id)
      )
    `);

    // Create Customers table
    await db.execute(`
      CREATE TABLE customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Orders table
    await db.execute(`
      CREATE TABLE orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      )
    `);

    // Create Order Items table
    await db.execute(`
      CREATE TABLE order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        menu_item_id INT NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        addons JSON,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
      )
    `);

    
    
    // Insert Categories
    const categories = [
      ['Hot Dogs', 'Classic hot dogs and sausages'],
      ['Burgers', 'Juicy burgers and sandwiches'],
      ['Sides', 'Fries, onion rings, and more'],
      ['Beverages', 'Drinks and shakes'],
      ['Desserts', 'Sweet treats and ice cream']
    ];

    for (const [name, description] of categories) {
      await db.execute('INSERT INTO categories (name, description) VALUES (?, ?)', [name, description]);
    }

    // Insert Add-ons
    const addons = [
      ['Extra Cheese', 0.75],
      ['Bacon', 1.25],
      ['Chili', 0.50],
      ['Onions', 0.25],
      ['Mustard', 0.00],
      ['Ketchup', 0.00],
      ['Relish', 0.25],
      ['Jalapeños', 0.50],
      ['Avocado', 1.00],
      ['Extra Meat', 2.00]
    ];

    for (const [name, price] of addons) {
      await db.execute('INSERT INTO addons (name, price) VALUES (?, ?)', [name, price]);
    }

    // Insert Menu Items
    const menuItems = [
      ['Original Wiener', 'Classic all-beef hot dog with mustard', 4.99, 1, 'https://images.unsplash.com/photo-1612392062798-2dd8b83e8d8e?w=400', 1],
      ['Chili Dog', 'Hot dog topped with our signature chili', 6.49, 1, 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400', 1],
      ['Chicago Dog', 'All-beef hot dog with yellow mustard, onions, bright green relish', 7.99, 1, 'https://images.unsplash.com/photo-1612392062798-2dd8b83e8d8e?w=400', 1],
      ['Corn Dog', 'Classic corn dog on a stick', 5.49, 1, 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400', 1],
      ['Classic Burger', 'Quarter pound beef patty with lettuce, tomato, onion', 8.99, 2, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', 1],
      ['Cheeseburger', 'Classic burger with American cheese', 9.49, 2, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', 1],
      ['Bacon Burger', 'Classic burger with crispy bacon', 10.99, 2, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', 1],
      ['Double Burger', 'Two quarter pound patties with all the fixings', 12.99, 2, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', 1],
      ['French Fries', 'Crispy golden fries', 3.49, 3, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400', 1],
      ['Onion Rings', 'Beer-battered onion rings', 4.49, 3, 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400', 1],
      ['Chili Fries', 'Fries topped with chili and cheese', 5.99, 3, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400', 1],
      ['Loaded Fries', 'Fries with bacon, cheese, and sour cream', 6.99, 3, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400', 1],
      ['Coca-Cola', 'Classic Coke', 2.49, 4, 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400', 1],
      ['Sprite', 'Lemon-lime soda', 2.49, 4, 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400', 1],
      ['Orange Juice', 'Fresh squeezed orange juice', 3.49, 4, 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400', 1],
      ['Chocolate Shake', 'Rich chocolate milkshake', 4.99, 4, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400', 1],
      ['Apple Pie', 'Classic apple pie slice', 3.99, 5, 'https://images.unsplash.com/photo-1535920527002-b35e96722da9?w=400', 1],
      ['Ice Cream Sundae', 'Vanilla ice cream with chocolate sauce', 4.49, 5, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400', 1],
      ['Chocolate Chip Cookie', 'Fresh baked cookie', 2.49, 5, 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400', 1]
    ];

    for (const [name, description, price, category_id, image_url, available] of menuItems) {
      await db.execute('INSERT INTO menu_items (name, description, price, category_id, image_url, available) VALUES (?, ?, ?, ?, ?, ?)', 
        [name, description, price, category_id, image_url, available]);
    }

    // Insert sample customers
    const customers = [
      ['John Doe', '555-0123', 'john.doe@email.com'],
      ['Jane Smith', '555-0456', 'jane.smith@email.com'],
      ['Mike Johnson', '555-0789', 'mike.johnson@email.com']
    ];

    for (const [name, phone, email] of customers) {
      await db.execute('INSERT INTO customers (name, phone, email) VALUES (?, ?, ?)', [name, phone, email]);
    }

    // Insert sample orders
    const orders = [
      [1, 15.48, 'completed'],
      [2, 22.97, 'preparing'],
      [3, 8.99, 'pending']
    ];

    for (const [customer_id, total, status] of orders) {
      await db.execute('INSERT INTO orders (customer_id, total, status) VALUES (?, ?, ?)', [customer_id, total, status]);
    }

    // Insert sample order items
    const orderItems = [
      [1, 1, 2, 4.99, '[1,5]'],
      [1, 9, 1, 3.49, '[]'],
      [1, 13, 1, 2.49, '[]'],
      [2, 5, 1, 8.99, '[2,4]'],
      [2, 6, 1, 9.49, '[1]'],
      [2, 12, 1, 4.49, '[]'],
      [3, 5, 1, 8.99, '[]']
    ];

    for (const [order_id, menu_item_id, quantity, price, addons] of orderItems) {
      await db.execute('INSERT INTO order_items (order_id, menu_item_id, quantity, price, addons) VALUES (?, ?, ?, ?, ?)', 
        [order_id, menu_item_id, quantity, price, addons]);
    }
    
   
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await db.end();
  }
};

if (require.main === module) {
  migrate();
}

export default migrate;