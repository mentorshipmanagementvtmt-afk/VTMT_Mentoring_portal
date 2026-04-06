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
            content = content.replace(/bordered=\{false\}/g, 'variant="borderless"');
            content = content.replace(/ bordered\b/g, ' variant="outlined"');
            content = content.replace(/bordered=\{true\}/g, 'variant="outlined"');
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
