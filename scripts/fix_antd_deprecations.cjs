const fs = require('fs');
const path = require('path');

const folders = ['admin/src', 'hod/src', 'mentor/src'];

function traverse(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
        if (file.isDirectory() && file.name !== 'node_modules') {
            traverse(path.join(dir, file.name));
        } else if (file.isFile() && file.name.endsWith('.js')) {
            const filePath = path.join(dir, file.name);
            let content = fs.readFileSync(filePath, 'utf8');
            let updated = content;

            // Replace bordered={false} with variant="borderless"
            updated = updated.replace(/bordered=\{false\}/g, 'variant="borderless"');

            // Replace bodyStyle={{ padding: 0 }} with styles={{ body: { padding: 0 } }}
            updated = updated.replace(/bodyStyle=\{\{\s*padding:\s*0\s*\}\}/g, 'styles={{ body: { padding: 0 } }}');

            if (content !== updated) {
                fs.writeFileSync(filePath, updated, 'utf8');
                console.log(`Updated: ${filePath}`);
            }
        }
    }
}

folders.forEach(f => {
    const p = path.join(process.cwd(), f);
    if (fs.existsSync(p)) {
        traverse(p);
    }
});
