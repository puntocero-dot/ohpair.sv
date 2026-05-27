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
    let orders = db.orders || [];
    const { _sort, _order } = req.query;
    if (_sort) {
      orders = [...orders].sort((a, b) => {
        const valA = a[_sort];
        const valB = b[_sort];
        if (typeof valA === 'string') {
          return _order === 'desc' ? valB.localeCompare(valA) : valA.localeCompare(valB);
        }
        return _order === 'desc' ? valB - valA : valA - valB;
      });
    }
    res.status(200).json(orders);
  } else if (req.method === 'POST') {
    const newOrder = req.body;
    db.orders = db.orders || [];
    db.orders.push(newOrder);
    saveDb(db);
    res.status(201).json(newOrder);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};