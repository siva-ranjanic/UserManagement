const mongoose = require('mongoose');
const DATABASE_URI = 'mongodb://localhost:27017/user_management';

async function repair() {
  try {
    await mongoose.connect(DATABASE_URI);
    const db = mongoose.connection.db;
    console.log('--- DATABASE REPAIR ---');

    // 1. Repair Permissions
    const permissions = await db.collection('permissions').find({}).toArray();
    for (const p of permissions) {
      if (typeof p._id !== 'string') {
        const stringId = p._id.toString();
        console.log(`Converting Permission: ${p.name} (${p._id} -> ${stringId})`);
        // Delete original first to avoid unique index conflict on 'name'
        await db.collection('permissions').deleteOne({ _id: p._id });
        await db.collection('permissions').insertOne({ ...p, _id: stringId });
      }
    }

    // 2. Repair Roles
    const roles = await db.collection('roles').find({}).toArray();
    for (const r of roles) {
      // Convert Permissions array in role if they are ObjectIds
      const newPerms = (r.permissions || []).map(p => typeof p === 'object' ? p.toString() : p);
      
      if (typeof r._id !== 'string') {
        const stringId = r._id.toString();
        console.log(`Converting Role: ${r.name} (${r._id} -> ${stringId})`);
        // Delete original first to avoid unique index conflict on 'name'
        await db.collection('roles').deleteOne({ _id: r._id });
        await db.collection('roles').insertOne({ ...r, _id: stringId, permissions: newPerms });
      } else {
        // If _id already string, just update permissions array
        await db.collection('roles').updateOne({ _id: r._id }, { $set: { permissions: newPerms } });
      }
    }

    console.log('Database repair completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Repair failed:', err);
    process.exit(1);
  }
}
repair();
