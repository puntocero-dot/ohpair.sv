const { getProductById, updateProduct } = require('../_db');

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

  const { id } = req.query;

  try {
    if (req.method === 'PUT') {
      const updatedFields = req.body;
      const updated = await updateProduct(id, updatedFields);
      if (updated) {
        res.status(200).json(updated);
      } else {
        res.status(404).json({ error: `Product with ID ${id} not found` });
      }
    } else if (req.method === 'GET') {
      const product = await getProductById(id);
      if (product) {
        res.status(200).json(product);
      } else {
        res.status(404).json({ error: `Product with ID ${id} not found` });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};