const fs = require('fs');
const path = require('path');

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    let p = path.join(dir, f);
    if(fs.statSync(p).isDirectory()) {
      if(f !== 'node_modules' && f !== '.git') walk(p);
    } else if(p.endsWith('.js') || p.endsWith('.jsx')) {
      let c = fs.readFileSync(p, 'utf8');
      if(c.includes('<Space ') && c.includes('direction=')) {
        let fixed = c.replace(/<Space([^>]*?)direction=/g, '<Space$1orientation=');
        if (fixed !== c) {
          fs.writeFileSync(p, fixed, 'utf8');
          console.log('Fixed:', p);
        }
      }
    }
  });
}

const root = __dirname;
walk(path.join(root, 'admin', 'src'));
walk(path.join(root, 'hod', 'src'));
walk(path.join(root, 'mentor', 'src'));
