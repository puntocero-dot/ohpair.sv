const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const os = require('os');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// Local File Fallbacks
const originalDbPath = path.join(process.cwd(), 'db.json');
const tmpDir = process.env.VERCEL ? '/tmp' : os.tmpdir();
const tmpDbPath = path.join(tmpDir, 'db.json');

function getLocalDb() {
  if (!fs.existsSync(tmpDbPath)) {
    try {
      const data = fs.readFileSync(originalDbPath, 'utf8');
      fs.writeFileSync(tmpDbPath, data, 'utf8');
    } catch (e) {
      console.error('Error copying db.json to tmp:', e);
      return JSON.parse(fs.readFileSync(originalDbPath, 'utf8'));
    }
  }
  try {
    const data = fs.readFileSync(tmpDbPath, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return JSON.parse(fs.readFileSync(originalDbPath, 'utf8'));
  }
}

function saveLocalDb(db) {
  try {
    fs.writeFileSync(tmpDbPath, JSON.stringify(db, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing db.json to tmp:', e);
  }
}

// Async Database API
async function getProducts() {
  if (supabase) {
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
      console.error('Supabase getProducts error:', error);
      throw error;
    }
    return data;
  }
  const db = getLocalDb();
  return db.products || [];
}

async function getProductById(id) {
  if (supabase) {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
    if (error) {
      console.error('Supabase getProductById error:', error);
      return null;
    }
    return data;
  }
  const db = getLocalDb();
  return (db.products || []).find(p => p.id === id) || null;
}

async function saveProduct(product) {
  if (supabase) {
    const { data, error } = await supabase.from('products').upsert(product).select().maybeSingle();
    if (error) {
      console.error('Supabase saveProduct error:', error);
      throw error;
    }
    return data;
  }
  const db = getLocalDb();
  db.products = db.products || [];
  const idx = db.products.findIndex(p => p.id === product.id);
  if (idx > -1) {
    db.products[idx] = { ...db.products[idx], ...product };
  } else {
    db.products.push(product);
  }
  saveLocalDb(db);
  return product;
}

async function updateProduct(id, updatedFields) {
  if (supabase) {
    const { data, error } = await supabase.from('products').update(updatedFields).eq('id', id).select().maybeSingle();
    if (error) {
      console.error('Supabase updateProduct error:', error);
      throw error;
    }
    return data;
  }
  const db = getLocalDb();
  db.products = db.products || [];
  const idx = db.products.findIndex(p => p.id === id);
  if (idx > -1) {
    db.products[idx] = { ...db.products[idx], ...updatedFields };
    saveLocalDb(db);
    return db.products[idx];
  }
  return null;
}

async function getOrders(sortField, sortOrder) {
  if (supabase) {
    let query = supabase.from('orders').select('*');
    if (sortField) {
      query = query.order(sortField, { ascending: sortOrder !== 'desc' });
    }
    const { data, error } = await query;
    if (error) {
      console.error('Supabase getOrders error:', error);
      throw error;
    }
    return data;
  }
  const db = getLocalDb();
  let orders = db.orders || [];
  if (sortField) {
    orders = [...orders].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'string') {
        return sortOrder === 'desc' ? valB.localeCompare(valA) : valA.localeCompare(valB);
      }
      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });
  }
  return orders;
}

async function saveOrder(order) {
  if (supabase) {
    const { data, error } = await supabase.from('orders').insert(order).select().maybeSingle();
    if (error) {
      console.error('Supabase saveOrder error:', error);
      throw error;
    }
    return data;
  }
  const db = getLocalDb();
  db.orders = db.orders || [];
  db.orders.push(order);
  saveLocalDb(db);
  return order;
}

module.exports = {
  getProducts,
  getProductById,
  saveProduct,
  updateProduct,
  getOrders,
  saveOrder
};