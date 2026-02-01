const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/SideLedgerDB')
    .then(async () => {
        console.log('\n=== AUTH USERS (Can Login) ===');
        const users = await mongoose.connection.db.collection('users').find({}).toArray();
        users.forEach(u => {
            console.log(`- Name: ${u.name}, Email: ${u.email}, Role: ${u.role}, WorkerId: ${u.workerId || 'None'}`);
        });

        console.log('\n=== WORKERS (Tracking Only) ===');
        const workers = await mongoose.connection.db.collection('workers').find({}).toArray();
        workers.forEach(w => {
            console.log(`- Name: ${w.name}, Phone: ${w.phone}, Role: ${w.role}, UserId: ${w.userId || 'None (tracking only)'}`);
        });

        mongoose.connection.close();
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
