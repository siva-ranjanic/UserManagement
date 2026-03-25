const mongoose = require('mongoose');
const DATABASE_URI = 'mongodb://localhost:27017/user_management';

async function checkCollections() {
  try {
    await mongoose.connect(DATABASE_URI);
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in DB:', collections.map(c => c.name));
    process.exit(0);
  } catch (err) {
    console.error('Failed:', err);
    process.exit(1);
  }
}
checkCollections();
