const mongoose = require('mongoose');

/**
 * Migration Script: Merge Workers into Users
 * 
 * This script:
 * 1. Finds all workers from the workers collection
 * 2. For each worker, finds matching user by name
 * 3. Merges worker fields into user document
 * 4. Updates all project references
 * 5. Updates all attendance references
 * 6. Deletes the workers collection
 */

async function migrateToSingleUserModel() {
    try {
        await mongoose.connect('mongodb://localhost:27017/SideLedgerDB');
        console.log('✅ Connected to database\n');

        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        const Worker = mongoose.model('Worker', new mongoose.Schema({}, { strict: false }));
        const Project = mongoose.model('Project', new mongoose.Schema({}, { strict: false }));
        const Attendance = mongoose.model('Attendance', new mongoose.Schema({}, { strict: false }));

        // Step 1: Get all workers
        const workers = await Worker.find({});
        console.log(`Found ${workers.length} workers to migrate\n`);

        let merged = 0;
        let skipped = 0;

        for (const worker of workers) {
            // Find matching user by name
            const user = await User.findOne({
                name: { $regex: new RegExp(`^${worker.name}$`, 'i') },
                role: 'worker'
            });

            if (user) {
                console.log(`Merging worker: ${worker.name}`);

                // Merge worker fields into user
                await User.findByIdAndUpdate(user._id, {
                    phone: worker.phone,
                    workerRole: worker.role,
                    specialty: worker.specialty,
                    dailyRate: worker.dailyRate,
                    photoUrl: worker.photoUrl,
                    status: worker.status || 'active'
                });

                // Update project references (worker._id -> user._id)
                const projectsUpdated = await Project.updateMany(
                    { workers: worker._id },
                    { $set: { 'workers.$[elem]': user._id } },
                    { arrayFilters: [{ elem: worker._id }] }
                );

                // Update attendance references (worker._id -> user._id)
                const attendanceUpdated = await Attendance.updateMany(
                    { worker: worker._id },
                    { $set: { worker: user._id } }
                );

                console.log(`  ✅ Merged into user ${user._id}`);
                console.log(`  📊 Updated ${projectsUpdated.modifiedCount} projects`);
                console.log(`  📊 Updated ${attendanceUpdated.modifiedCount} attendance records\n`);

                merged++;
            } else {
                console.log(`⚠️  No matching user found for worker: ${worker.name} (skipping)\n`);
                skipped++;
            }
        }

        console.log('\n=== Migration Summary ===');
        console.log(`✅ Merged: ${merged} workers`);
        console.log(`⚠️  Skipped: ${skipped} workers (no matching user)`);

        // Step 2: Drop workers collection
        console.log('\n🗑️  Dropping workers collection...');
        await mongoose.connection.db.dropCollection('workers');
        console.log('✅ Workers collection dropped');

        // Step 3: Verify final state
        console.log('\n=== Final State ===');
        const allUsers = await User.find({ role: 'worker' });
        console.log(`Total worker users: ${allUsers.length}`);

        allUsers.forEach(u => {
            console.log(`  - ${u.name} (${u.workerRole || 'no role'}) - Phone: ${u.phone || 'none'}`);
        });

        await mongoose.connection.close();
        console.log('\n✅ Migration complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

migrateToSingleUserModel();
