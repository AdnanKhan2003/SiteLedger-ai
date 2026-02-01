const mongoose = require('mongoose');

async function linkUsersAndWorkers() {
    try {
        await mongoose.connect('mongodb://localhost:27017/SideLedgerDB');
        console.log('Connected to database...\n');

        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        const Worker = mongoose.model('Worker', new mongoose.Schema({}, { strict: false }));

        // Get all users and workers
        const users = await User.find({ role: 'worker' });
        const workers = await Worker.find({});

        console.log(`Found ${users.length} worker users`);
        console.log(`Found ${workers.length} workers\n`);

        // Link by matching names
        let linked = 0;
        for (const user of users) {
            // Find matching worker by name
            const worker = workers.find(w =>
                w.name.toLowerCase().trim() === user.name.toLowerCase().trim()
            );

            if (worker) {
                // Update User with workerId
                await User.findByIdAndUpdate(user._id, { workerId: worker._id });

                // Update Worker with userId
                await Worker.findByIdAndUpdate(worker._id, { userId: user._id });

                console.log(`✅ Linked: ${user.name}`);
                console.log(`   User ID: ${user._id}`);
                console.log(`   Worker ID: ${worker._id}\n`);
                linked++;
            } else {
                console.log(`⚠️  No worker found for user: ${user.name}\n`);
            }
        }

        console.log(`\n✅ Successfully linked ${linked} users with workers`);

        // Show final state
        console.log('\n=== FINAL STATE ===');
        const updatedUsers = await User.find({ role: 'worker' });
        updatedUsers.forEach(u => {
            console.log(`User: ${u.name} - workerId: ${u.workerId || 'NONE'}`);
        });

        await mongoose.connection.close();
        console.log('\nDone!');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

linkUsersAndWorkers();
