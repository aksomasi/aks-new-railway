
-- Insert sample categories
INSERT IGNORE INTO categories (name, description, available) VALUES
('Hot Dogs', 'Classic hot dogs with various toppings', TRUE),
('Burgers', 'Juicy burgers made fresh', TRUE),
('Sides', 'Delicious side dishes', TRUE),
('Drinks', 'Refreshing beverages', TRUE);

-- Insert sample addons
INSERT IGNORE INTO addons (name, price, available) VALUES
('Extra Cheese', 0.50, TRUE),
('Bacon', 1.00, TRUE),
('Chili', 0.75, FALSE),
('Onions', 0.25, TRUE),
('Mustard', 0.00, TRUE),
('Ketchup', 0.00, TRUE);

-- Insert sample menu items
INSERT IGNORE INTO menu_items (name, description, price, category_id, available) VALUES
('Classic Hot Dog', 'All-beef hot dog with your choice of toppings', 4.99, 1, TRUE),
('Chili Cheese Dog', 'Hot dog topped with chili and cheese', 6.49, 1, TRUE),
('Hamburger', 'Classic beef burger with lettuce and tomato', 7.99, 2, TRUE),
('Cheeseburger', 'Hamburger with melted cheese', 8.49, 2, TRUE),
('French Fries', 'Crispy golden fries', 3.49, 3, TRUE),
('Soft Drink', 'Choice of cola, sprite, or orange', 2.49, 4, TRUE);

-- Link some addons to menu items
INSERT IGNORE INTO menu_item_addons (menu_item_id, addon_id) VALUES
(1, 1), (1, 2), (1, 4), (1, 5), (1, 6),  -- Classic Hot Dog
(2, 1), (2, 4), (2, 5), (2, 6),          -- Chili Cheese Dog
(3, 1), (3, 2), (3, 4), (3, 5), (3, 6),  -- Hamburger
(4, 2), (4, 4), (4, 5), (4, 6);          -- Cheeseburger

-- Insert sample orders
INSERT IGNORE INTO orders (order_number, full_name, plate, car_details, subtotal, tax, total) VALUES
('123456', 'John Doe', '1234', 'Honda Civic', 15.99, 1.99, 17.98),
('789012', 'Jane Smith', '5678', 'Toyota Camry', 19.99, 2.99, 22.98);