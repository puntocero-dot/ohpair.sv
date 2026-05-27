const { getDb, saveDb } = require('../_db');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const db = getDb();

  if (req.method === 'GET') {
    res.status(200).json(db.products || []);
  } else if (req.method === 'POST') {
    const newProduct = req.body;
    if (!newProduct.id) {
      newProduct.id = 'sku-' + Math.random().toString(36).substr(2, 9);
    }
    db.products = db.products || [];
    db.products.push(newProduct);
    saveDb(db);
    res.status(201).json(newProduct);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};