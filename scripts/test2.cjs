const mongoose = require('mongoose');

const uri = "mongodb+srv://mentorshipmanagementvtmt_db_user:6JmdswO66xn0zA2I@veltech-mentoring-porta.h2zkuhq.mongodb.net/?appName=veltech-mentoring-portal";

mongoose.connect(uri).then(async () => {
    try {
        const User = require('./backend/models/user.model.js');
        const mentors = await User.find({ role: 'mentor' }).select('name department email mtsNumber profileImage');
        const r = mentors.find(m => m.name === 'Ranjith');
        console.log("Ranjith via User.find:", r.profileImage);
    } catch(e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
}).catch(console.error);
