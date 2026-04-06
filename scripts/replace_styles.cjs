const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            replaceInDir(fullPath);
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let original = content;
            
            // Replacing headStyle={{...}} with styles={{ header: {...} }}
            content = content.replace(/headStyle=\{\{(.*?)\}\}/g, 'styles={{ header: {$1} }}');
            
            // Replacing bodyStyle={{...}} with styles={{ body: {...} }}
            content = content.replace(/bodyStyle=\{\{(.*?)\}\}/g, 'styles={{ body: {$1} }}');
            
            if (original !== content) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

replaceInDir('./admin/src');
replaceInDir('./hod/src');
replaceInDir('./mentor/src');