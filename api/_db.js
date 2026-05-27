const fs = require('fs');
const path = require('path');
const os = require('os');

const originalDbPath = path.join(process.cwd(), 'db.json');
const tmpDir = process.env.VERCEL ? '/tmp' : os.tmpdir();
const tmpDbPath = path.join(tmpDir, 'db.json');

function getDb() {
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
    console.error('Error reading db.json from tmp:', e);
    return JSON.parse(fs.readFileSync(originalDbPath, 'utf8'));
  }
}

function saveDb(db) {
  try {
    fs.writeFileSync(tmpDbPath, JSON.stringify(db, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing db.json to tmp:', e);
  }
}

module.exports = { getDb, saveDb };