# Wienerschnitzel API Server

Node.js TypeScript REST API for Wienerschnitzel restaurant management system.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create database and seed data:
```bash
npm run migrate
```

3. Start development server:
```bash
npm run dev
```

## API Endpoints

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Menu Items
- `GET /api/menu` - Get all menu items
- `POST /api/menu` - Create menu item
- `PUT /api/menu/:id` - Update menu item
- `DELETE /api/menu/:id` - Delete menu item

### Add-ons
- `GET /api/addons` - Get all add-ons
- `POST /api/addons` - Create add-on
- `PUT /api/addons/:id` - Update add-on
- `DELETE /api/addons/:id` - Delete add-on

### Orders
- `GET /api/orders` - Get active orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status
- `GET /api/orders/history` - Get completed orders

## Database Schema

- **categories**: Menu categories (Hot Dogs, Burgers, etc.)
- **menu_items**: Individual menu items with pricing
- **addons**: Customization options (Extra Cheese, etc.)
- **menu_item_addons**: Junction table for item-addon relationships
- **customers**: Customer information and vehicle details
- **orders**: Order records with status tracking
- **order_items**: Individual items within orders