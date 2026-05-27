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

  const { id } = req.query;
  const db = getDb();

  if (req.method === 'PUT') {
    const updatedProduct = req.body;
    db.products = db.products || [];
    const index = db.products.findIndex(p => p.id === id);

    if (index > -1) {
      db.products[index] = { ...db.products[index], ...updatedProduct };
      saveDb(db);
      res.status(200).json(db.products[index]);
    } else {
      res.status(404).json({ error: `Product with ID ${id} not found` });
    }
  } else if (req.method === 'GET') {
    db.products = db.products || [];
    const product = db.products.find(p => p.id === id);
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ error: `Product with ID ${id} not found` });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};