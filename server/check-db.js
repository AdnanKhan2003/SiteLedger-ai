const mongoose = require('mongoose');
const fs = require('fs');

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    role: String,
    status: String
});
const User = mongoose.model('User', UserSchema);

mongoose.connect('mongodb://localhost:27017/SideLedgerDB')
    .then(async () => {
        let output = 'Connected to DB\n';

        try {
            const allUsers = await User.find({});
            output += `Total Users: ${allUsers.length}\n`;

            const workers = await User.find({ role: 'worker' });
            output += `Users with role='worker': ${workers.length}\n`;
            workers.forEach(w => {
                output += ` - ID: ${w._id}, Name: ${w.name}, Status: ${w.status || 'UNDEFINED'}\n`;
            });

            const activeWorkers = await User.find({ role: 'worker', status: 'active' });
            output += `Active Workers (role='worker' && status='active'): ${activeWorkers.length}\n`;

        } catch (e) {
            output += `Error: ${e.message}\n`;
        } finally {
            fs.writeFileSync('check-db-result.txt', output);
            mongoose.connection.close();
            process.exit(0);
        }
    })
    .catch(err => {
        fs.writeFileSync('check-db-result.txt', `Connection Error: ${err.message}`);
        process.exit(1);
    });
