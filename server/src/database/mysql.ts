// Mock in-memory database - starts empty
const mockData = {
  categories: [],
  addons: [],
  menu_items: [],
  menu_item_addons: [],
  orders: [],
  order_items: []
};

let nextId = { categories: 1, addons: 1, menu_items: 1, menu_item_addons: 1, orders: 1, order_items: 1 };

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
  
  if (sql.includes('from menu_items m join categories c')) {
    const result = mockData.menu_items.map(item => {
      const category = mockData.categories.find(c => c.id === item.category_id);
      return { ...item, category_name: category?.name };
    });
    return [result];
  }
  
  if (sql.includes('from menu_item_addons mia join addons a')) {
    const menuItemId = params[0];
    const result = mockData.menu_item_addons
      .filter(mia => mia.menu_item_id === menuItemId)
      .map(mia => mockData.addons.find(a => a.id === mia.addon_id))
      .filter(Boolean);
    return [result];
  }
  
  if (sql.includes('from menu_item_addons where menu_item_id')) {
    const menuItemId = params[0];
    const result = mockData.menu_item_addons
      .filter(mia => mia.menu_item_id === menuItemId)
      .map(mia => ({ addon_id: mia.addon_id }));
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
    const newItem = { id, name: params[0], description: params[1], available: params[2] ?? true };
    mockData.categories.push(newItem);
    return [{ insertId: id }];
  }
  
  if (sql.includes('into addons')) {
    const id = nextId.addons++;
    const newItem = { id, name: params[0], price: params[1], available: params[2] ?? true };
    mockData.addons.push(newItem);
    return [{ insertId: id }];
  }
  
  if (sql.includes('into menu_items')) {
    const id = nextId.menu_items++;
    const newItem = { id, name: params[0], description: params[1], price: params[2], category_id: params[3], image_url: params[4], available: params[5] ?? true };
    mockData.menu_items.push(newItem);
    return [{ insertId: id }];
  }
  
  if (sql.includes('into menu_item_addons')) {
    const id = nextId.menu_item_addons++;
    const newItem = { id, menu_item_id: params[0], addon_id: params[1] };
    mockData.menu_item_addons.push(newItem);
    return [{ insertId: id }];
  }
  
  if (sql.includes('into orders')) {
    const id = nextId.orders++;
    const newItem = { id, order_number: params[0], full_name: params[1], plate: params[2], car_details: params[3], subtotal: params[4], tax: params[5], total: params[6], status: 'new', estimated_time: 15 };
    mockData.orders.push(newItem);
    return [{ insertId: id }];
  }
  
  return [{ insertId: 1 }];
}

function handleUpdate(query: string, params: any[]) {
  const sql = query.toLowerCase();
  const id = params[params.length - 1];
  
  if (sql.includes('categories')) {
    const item = mockData.categories.find(c => c.id === id);
    if (item && params.length >= 2) {
      if (sql.includes('name')) item.name = params[0];
      if (sql.includes('description')) item.description = params[1];
      if (sql.includes('available')) item.available = params[params.length - 2];
    }
  }
  
  if (sql.includes('menu_items')) {
    const item = mockData.menu_items.find(m => m.id === id);
    if (item) {
      const fields = query.match(/SET (.+) WHERE/i)?.[1]?.split(',') || [];
      let paramIndex = 0;
      fields.forEach(field => {
        const fieldName = field.trim().split('=')[0].trim();
        if (fieldName === 'name') item.name = params[paramIndex];
        if (fieldName === 'description') item.description = params[paramIndex];
        if (fieldName === 'price') item.price = params[paramIndex];
        if (fieldName === 'category_id') item.category_id = params[paramIndex];
        if (fieldName === 'available') item.available = params[paramIndex];
        if (fieldName === 'image_url') item.image_url = params[paramIndex];
        paramIndex++;
      });
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