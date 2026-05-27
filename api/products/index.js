const { getProducts, saveProduct } = require('../_db');

module.exports = async (req, res) => {
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

  try {
    if (req.method === 'GET') {
      const products = await getProducts();
      res.status(200).json(products);
    } else if (req.method === 'POST') {
      const newProduct = req.body;
      if (!newProduct.id) {
        newProduct.id = 'sku-' + Math.random().toString(36).substr(2, 9);
      }
      const saved = await saveProduct(newProduct);
      res.status(201).json(saved || newProduct);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};