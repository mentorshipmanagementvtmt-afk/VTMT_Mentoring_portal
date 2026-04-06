const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // 1. Replace message.success/error/warning/info with toast.*
  const msgRegex = /message\.(success|error|warning|info)\s*\(/g;
  if (msgRegex.test(content)) {
    content = content.replace(msgRegex, 'toast.$1(');
    changed = true;
  }

  // Also catch 'message.warn' which some people use
  const warnRegex = /message\.warn\s*\(/g;
  if (warnRegex.test(content)) {
    content = content.replace(warnRegex, 'toast.warn(');
    changed = true;
  }

  if (changed) {
    // 2. Remove 'message' from antd imports
    // Examples: import { message } from 'antd'; import { Card, message, Button } from 'antd';
    content = content.replace(/\{\s*message\s*\}\s*from\s*['"]antd['"]/g, '{} from "antd"');
    content = content.replace(/,\s*message\s*,/g, ', ');
    content = content.replace(/\{\s*message\s*,/g, '{ ');
    content = content.replace(/,\s*message\s*\}/g, ' }');

    // Clean up empty antd imports if any
    content = content.replace(/import\s*\{\s*\}\s*from\s*['"]antd['"];?\n?/g, '');

    // 3. Add import { toast } from 'react-toastify'
    // Find the last import line to append it after, or just put it at the very top
    if (!content.includes("from 'react-toastify'") && !content.includes('from "react-toastify"')) {
      const match = content.match(/import\s+.*?from\s+['"].*?['"];?\n/);
      if (match) {
        content = content.replace(match[0], match[0] + "import { toast } from 'react-toastify';\n");
      } else {
        content = "import { toast } from 'react-toastify';\n" + content;
      }
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Migrated:', filePath);
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    let p = path.join(dir, f);
    if(fs.statSync(p).isDirectory()) {
      if(f !== 'node_modules' && f !== '.git') walk(p);
    } else if(p.endsWith('.js') || p.endsWith('.jsx') || p.endsWith('.cjs')) {
       // Skip this script itself
       if (!p.endsWith('migrate_to_toastify.cjs')) {
           processFile(p);
       }
    }
  });
}

const root = __dirname;
walk(path.join(root, 'admin', 'src'));
walk(path.join(root, 'hod', 'src'));
walk(path.join(root, 'mentor', 'src'));
// Also process root scripts that generate files
fs.readdirSync(root).forEach(f => {
    let p = path.join(root, f);
    if (!fs.statSync(p).isDirectory() && p.endsWith('.cjs') && f !== 'migrate_to_toastify.cjs') {
         processFile(p);
    }
});
