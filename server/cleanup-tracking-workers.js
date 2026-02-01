const mongoose = require('mongoose');

async function cleanupTrackingWorkers() {
    try {
        await mongoose.connect('mongodb://localhost:27017/SideLedgerDB');
        console.log('Connected to database...\n');

        const Worker = mongoose.model('Worker', new mongoose.Schema({}, { strict: false }));

        // Find tracking-only workers
        const trackingWorkers = await Worker.find({
            $or: [
                { userId: { $exists: false } },
                { userId: null }
            ]
        });

        console.log(`Found ${trackingWorkers.length} tracking-only workers:\n`);
        trackingWorkers.forEach(w => {
            console.log(`- ${w.name} (${w.role})`);
        });

        if (trackingWorkers.length > 0) {
            console.log('\nDeleting...');
            const result = await Worker.deleteMany({
                $or: [
                    { userId: { $exists: false } },
                    { userId: null }
                ]
            });
            console.log(`✅ Deleted ${result.deletedCount} workers\n`);
        } else {
            console.log('\n✅ No tracking-only workers found!\n');
        }

        // Show remaining
        const remaining = await Worker.find({});
        console.log(`Remaining workers: ${remaining.length}`);
        remaining.forEach(w => {
            console.log(`- ${w.name} (has login: ${w.userId ? 'Yes' : 'No'})`);
        });

        await mongoose.connection.close();
        console.log('\nDone!');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

cleanupTrackingWorkers();
