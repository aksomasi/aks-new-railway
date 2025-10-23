// Mock in-memory database - starts empty
interface Category {
  id: number;
  name: string;
  description: string;
  available?: boolean;
}

interface Addon {
  id: number;
  name: string;
  price: number;
  available?: boolean;
}

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  image_url: string;
  available?: boolean;
}

interface MenuItemAddon {
  id: number;
  menu_item_id: number;
  addon_id: number;
}

interface Order {
  id: number;
  order_number: string;
  full_name: string;
  plate: string;
  car_details: string;
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  estimated_time: number;
}

// Initialize with sample data
const mockData = {
  categories: [
    { id: 1, name: 'Hot Dogs', description: 'Classic hot dogs and sausages', available: true },
    { id: 2, name: 'Burgers', description: 'Juicy burgers and sandwiches', available: true },
    { id: 3, name: 'Sides', description: 'Fries, onion rings, and more', available: true },
    { id: 4, name: 'Beverages', description: 'Drinks and shakes', available: true }
  ] as Category[],
  addons: [
    { id: 1, name: 'Extra Cheese', price: 0.75, available: true },
    { id: 2, name: 'Bacon', price: 1.25, available: true },
    { id: 3, name: 'Chili', price: 0.50, available: true },
    { id: 4, name: 'Onions', price: 0.25, available: true }
  ] as Addon[],
  menu_items: [
    { id: 1, name: 'Original Wiener', description: 'Classic all-beef hot dog', price: 4.99, category_id: 1, image_url: '', available: true },
    { id: 2, name: 'Chili Dog', description: 'Hot dog with chili', price: 6.49, category_id: 1, image_url: '', available: true },
    { id: 3, name: 'Classic Burger', description: 'Quarter pound beef patty', price: 8.99, category_id: 2, image_url: '', available: true },
    { id: 4, name: 'French Fries', description: 'Crispy golden fries', price: 3.49, category_id: 3, image_url: '', available: true }
  ] as MenuItem[],
  menu_item_addons: [] as MenuItemAddon[],
  orders: [] as Order[],
  order_items: [] as any[]
};

let nextId = { categories: 5, addons: 5, menu_items: 5, menu_item_addons: 1, orders: 1, order_items: 1 };

// Mock MySQL interface
export const db = {
  async execute(query: string, params: any[] = []) {
    const sql = query.toLowerCase().trim();
    
    if (sql.startsWith('select')) {
      return handleSelect(query, params);
    } else if (sql.startsWith('insert')) {
      return handleInsert(query, params);
    } else if (sql.startsWith('update')) {
      return handleUpdate(query, params);
    } else if (sql.startsWith('delete')) {
      return handleDelete(query, params);
    }
    
    return [[]];
  },
  async end() {
    // Mock end method for compatibility
    console.log('Mock database connection closed');
  }
};

function handleSelect(query: string, params: any[]) {
  const sql = query.toLowerCase();
  
  if (sql.includes('from categories')) {
    return [mockData.categories];
  }
  
  if (sql.includes('from addons')) {
    return [mockData.addons];
  }
  
  if (sql.includes('from menu_items m join categories c') || sql.includes('from menu_items') && sql.includes('join categories')) {
    const result = mockData.menu_items.map(item => {
      const category = mockData.categories.find(c => c.id === item.category_id);
      return { ...item, category_name: category?.name || 'Unknown' };
    });
    return [result];
  }
  
  if (sql.includes('from menu_item_addons mia join addons a') || (sql.includes('from menu_item_addons') && sql.includes('join addons'))) {
    const menuItemId = params[0];
    const result = mockData.menu_item_addons
      .filter(mia => mia.menu_item_id === menuItemId)
      .map(mia => mockData.addons.find(a => a.id === mia.addon_id))
      .filter(Boolean);
    return [result];
  }
  
  if (sql.includes('from menu_item_addons where menu_item_id') || sql.includes('from menu_item_addons') && sql.includes('where')) {
    const menuItemId = params[0];
    const result = mockData.menu_item_addons
      .filter(mia => mia.menu_item_id === menuItemId)
      .map(mia => ({ addon_id: mia.addon_id }));
    return [result];
  }
  
  if (sql.includes('select id from menu_items where')) {
    const name = params[0];
    const result = mockData.menu_items.filter(item => 
      item.name.toLowerCase() === name.toLowerCase()
    );
    return [result];
  }
  
  if (sql.includes('select id from addons where')) {
    const name = params[0];
    const result = mockData.addons.filter(addon => 
      addon.name.toLowerCase() === name.toLowerCase()
    );
    return [result];
  }
  
  if (sql.includes('select * from menu_items where id')) {
    const id = params[0];
    const result = mockData.menu_items.filter(item => item.id === parseInt(id));
    return [result];
  }
  
  if (sql.includes('from orders')) {
    return [mockData.orders];
  }
  
  return [[]];
}

function handleInsert(query: string, params: any[]) {
  const sql = query.toLowerCase();
  
  if (sql.includes('into categories')) {
    const id = nextId.categories++;
    const newItem: Category = { 
      id, 
      name: params[0], 
      description: params[1] || '', 
      available: params[2] !== undefined ? Boolean(params[2]) : true 
    };
    mockData.categories.push(newItem);
    return [{ insertId: id }];
  }
  
  if (sql.includes('into addons')) {
    const id = nextId.addons++;
    const newItem: Addon = { 
      id, 
      name: params[0], 
      price: parseFloat(params[1]) || 0, 
      available: params[2] !== undefined ? Boolean(params[2]) : true 
    };
    mockData.addons.push(newItem);
    return [{ insertId: id }];
  }
  
  if (sql.includes('into menu_items')) {
    const id = nextId.menu_items++;
    const newItem: MenuItem = { 
      id, 
      name: params[0], 
      description: params[1] || '', 
      price: parseFloat(params[2]) || 0, 
      category_id: parseInt(params[3]), 
      image_url: params[4] || '', 
      available: params[5] !== undefined ? Boolean(params[5]) : true 
    };
    mockData.menu_items.push(newItem);
    return [{ insertId: id }];
  }
  
  if (sql.includes('into menu_item_addons')) {
    const id = nextId.menu_item_addons++;
    const newItem: MenuItemAddon = { 
      id, 
      menu_item_id: parseInt(params[0]), 
      addon_id: parseInt(params[1]) 
    };
    mockData.menu_item_addons.push(newItem);
    return [{ insertId: id }];
  }
  
  if (sql.includes('into orders')) {
    const id = nextId.orders++;
    const newItem: Order = { 
      id, 
      order_number: params[0], 
      full_name: params[1], 
      plate: params[2], 
      car_details: params[3], 
      subtotal: parseFloat(params[4]) || 0, 
      tax: parseFloat(params[5]) || 0, 
      total: parseFloat(params[6]) || 0, 
      status: 'new', 
      estimated_time: 15 
    };
    mockData.orders.push(newItem);
    return [{ insertId: id }];
  }
  
  return [{ insertId: 1 }];
}

function handleUpdate(query: string, params: any[]) {
  const sql = query.toLowerCase();
  const id = parseInt(params[params.length - 1]);
  
  if (sql.includes('categories')) {
    const item = mockData.categories.find(c => c.id === id);
    if (item) {
      // Standard 3-param update: name, description, available, id
      if (params.length >= 4) {
        item.name = params[0];
        item.description = params[1] || '';
        item.available = Boolean(params[2]);
      }
    }
  }
  
  if (sql.includes('addons')) {
    const item = mockData.addons.find(a => a.id === id);
    if (item) {
      // Handle addon updates
      if (params.length >= 4) {
        // name, price, available, id
        item.name = params[0];
        item.price = parseFloat(params[1]);
        item.available = Boolean(params[2]);
      } else if (params.length >= 3) {
        // name, price, id
        item.name = params[0];
        item.price = parseFloat(params[1]);
      }
    }
  }
  
  if (sql.includes('menu_items')) {
    const item = mockData.menu_items.find(m => m.id === id);
    if (item) {
      // Parse SET clause to handle dynamic updates
      const setClause = query.match(/SET (.+) WHERE/i)?.[1];
      if (setClause) {
        const fields = setClause.split(',').map(f => f.trim());
        let paramIndex = 0;
        
        fields.forEach(field => {
          const fieldName = field.split('=')[0].trim();
          const value = params[paramIndex];
          
          switch (fieldName) {
            case 'name':
              item.name = value;
              break;
            case 'description':
              item.description = value || '';
              break;
            case 'price':
              item.price = parseFloat(value);
              break;
            case 'category_id':
              item.category_id = parseInt(value);
              break;
            case 'available':
              item.available = Boolean(value);
              break;
            case 'image_url':
              item.image_url = value || '';
              break;
          }
          paramIndex++;
        });
      }
    }
  }
  
  return [{ affectedRows: 1 }];
}

function handleDelete(query: string, params: any[]) {
  const sql = query.toLowerCase();
  const id = params[0];
  
  if (sql.includes('from categories')) {
    const index = mockData.categories.findIndex(c => c.id === id);
    if (index > -1) mockData.categories.splice(index, 1);
  }
  
  if (sql.includes('from menu_items')) {
    const index = mockData.menu_items.findIndex(m => m.id === id);
    if (index > -1) mockData.menu_items.splice(index, 1);
  }
  
  if (sql.includes('from menu_item_addons')) {
    if (params.length === 1) {
      mockData.menu_item_addons = mockData.menu_item_addons.filter(mia => mia.menu_item_id !== id);
    } else {
      mockData.menu_item_addons = mockData.menu_item_addons.filter(mia => !(mia.menu_item_id === id && mia.addon_id === params[1]));
    }
  }
  
  return [{ affectedRows: 1 }];
}

console.log('✅ Mock in-memory database initialized');
export default db;