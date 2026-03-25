const mongoose = require('mongoose');

const DATABASE_URI = 'mongodb://localhost:27017/user_management';

async function diagnose() {
  try {
    await mongoose.connect(DATABASE_URI);
    console.log('--- DATABASE DIAGNOSIS ---');
    
    // Check Roles
    const Role = mongoose.model('Role', new mongoose.Schema({ name: String }, { strict: false }));
    const roles = await Role.find().exec();
    console.log('Roles in DB:', JSON.stringify(roles, null, 2));

    // Check last 3 users
    const User = mongoose.model('User', new mongoose.Schema({ email: String, roles: Array }, { strict: false }));
    const users = await User.find().sort({ createdAt: -1 }).limit(3).exec();
    console.log('Last 3 Users in DB:', JSON.stringify(users, null, 2));

    process.exit(0);
  } catch (err) {
    console.error('Diagnosis failed:', err);
    process.exit(1);
  }
}

diagnose();
