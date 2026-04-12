/**
 * Script to fix ALL back-button navigation in all portal pages.
 * Handles both string-literal links and template-literal links.
 */
const fs = require('fs');
const path = require('path');

const portals = ['admin', 'hod', 'mentor'];
const baseDir = path.join(__dirname, '..');

let filesModified = 0;

for (const portal of portals) {
  const pagesDir = path.join(baseDir, portal, 'src', 'pages');
  if (!fs.existsSync(pagesDir)) continue;

  const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.js'));

  for (const file of files) {
    const filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Pattern: Any <Link to=... that contains ArrowLeftOutlined and "Back" text
    // Match both single-line and multi-line patterns  
    const patterns = [
      // Single-line: <Link to={...} style={...}><ArrowLeftOutlined /> Back ...</Link>
      /<Link\s+to=[^>]+style=\{\{[^}]*\}\}[^>]*>\s*(?:<ArrowLeftOutlined\s*\/>)?\s*Back[^<]*<\/Link>/g,
      // Multi-line: <Link ...>\n  <ArrowLeftOutlined /> Back...\n</Link>
      /<Link\s+to=[^>]+style=\{\{[^}]*\}\}[^>]*>\s*\n\s*(?:<ArrowLeftOutlined\s*\/>)?\s*Back[^<]*\n\s*<\/Link>/g,
    ];

    for (const pattern of patterns) {
      if (pattern.test(content)) {
        content = content.replace(pattern,
          `<Button type="link" onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 16, color: '#0ea5e9', fontWeight: 500, padding: 0 }}>\n          <ArrowLeftOutlined /> Back\n        </Button>`
        );
        modified = true;
        // Reset lastIndex since we reuse the regex
        pattern.lastIndex = 0;
      }
    }

    if (modified) {
      // Ensure useNavigate is imported
      if (!content.includes('useNavigate')) {
        if (content.includes("from 'react-router-dom'")) {
          content = content.replace(
            /import\s*\{([^}]*)\}\s*from\s*'react-router-dom'/,
            (match, imports) => `import {${imports}, useNavigate } from 'react-router-dom'`
          );
        }
      }

      // Ensure navigate is declared
      if (!content.includes('const navigate = useNavigate()')) {
        // Try inserting after the first useState/useParams/useAuth
        if (content.match(/const\s+\[?\{?\s*\w+/)) {
          content = content.replace(
            /(function \w+\([^)]*\)\s*\{[\s\S]*?)(const\s+)/,
            (match, before, constKeyword) => {
              if (before.includes('const navigate = useNavigate()')) return match;
              return `${before}const navigate = useNavigate();\n  ${constKeyword}`;
            }
          );
        }
      }

      // Import Button from antd if not already present
      if (content.includes("from 'antd'") && !content.match(/\bButton\b[^P]/)) {
        content = content.replace(
          /import\s*\{([^}]*)\}\s*from\s*'antd'/,
          (match, imports) => `import {${imports}, Button } from 'antd'`
        );
      }

      fs.writeFileSync(filePath, content, 'utf8');
      filesModified++;
      console.log(`  ✅ Fixed: ${portal}/src/pages/${file}`);
    }
  }
}

console.log(`\n🎉 Done! Modified ${filesModified} files across all portals.`);
