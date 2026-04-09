const mongoose = require('mongoose');

const uri = "mongodb+srv://mentorshipmanagementvtmt_db_user:6JmdswO66xn0zA2I@veltech-mentoring-porta.h2zkuhq.mongodb.net/?appName=veltech-mentoring-portal";

mongoose.connect(uri).then(async () => {
    try {
        const User = mongoose.model('User', new mongoose.Schema({
            name: String,
            role: String,
            department: String,
            profileImage: mongoose.Schema.Types.Mixed
        }, { collection: 'users' }));

        const user = await User.findOne({ name: 'Ranjith' });
        console.log("Ranjith user:");
        console.log(JSON.stringify(user, null, 2));
    } catch(e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
}).catch(console.error);
