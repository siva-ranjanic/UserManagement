const mongoose = require('mongoose');
const DATABASE_URI = 'mongodb://localhost:27017/user_management';

async function checkType() {
  try {
    await mongoose.connect(DATABASE_URI);
    const db = mongoose.connection.db;
    const role = await db.collection('roles').findOne({});
    console.log('Role _id:', role._id, 'Type:', typeof role._id);
    console.log('Is ObjectId:', role._id instanceof mongoose.Types.ObjectId);
    
    const user = await db.collection('users').findOne({ email: 'mvp.bose52@gmail.com' });
    if (user) {
      console.log('User roles entry:', user.roles[0], 'Type:', typeof user.roles[0]);
      console.log('Is ObjectId:', user.roles[0] instanceof mongoose.Types.ObjectId);
    }
    process.exit(0);
  } catch (err) {
    console.error('Failed:', err);
    process.exit(1);
  }
}
checkType();
