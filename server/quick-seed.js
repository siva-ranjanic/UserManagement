const mongoose = require('mongoose');

const DATABASE_URI = 'mongodb://localhost:27017/user_management';

async function seed() {
  try {
    await mongoose.connect(DATABASE_URI);
    console.log('Connected to MongoDB');

    const RoleSchema = new mongoose.Schema({
      _id: String,
      name: String,
      permissions: [String]
    });

    const Role = mongoose.model('Role', RoleSchema);

    const roles = ['Admin', 'User'];
    
    for (const name of roles) {
      const existing = await Role.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
      if (!existing) {
        const id = require('crypto').randomUUID();
        await new Role({ _id: id, name, permissions: [] }).save();
        console.log(`Created role: ${name} with ID: ${id}`);
      } else {
        console.log(`Role already exists: ${name}`);
      }
    }

    console.log('Seeding finished successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
