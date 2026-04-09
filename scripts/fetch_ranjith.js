const mongoose = require('mongoose');
const User = require('./backend/models/user.model.js');
const fs = require('fs');

const env = fs.readFileSync('./backend/.env', 'utf8');
const match = env.match(/DATABASE_URL=\"([^\"]+)\"/);
if (!match) {
    console.log("No URL found");
    process.exit(1);
}
const url = match[1];

mongoose.connect(url).then(async () => {
    const user = await User.findOne({name: 'Ranjith'});
    console.log(JSON.stringify(user, null, 2));
    mongoose.disconnect();
}).catch(console.error);
