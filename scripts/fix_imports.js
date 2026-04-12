/**
 * Fix missing Button and navigate imports across all portals.
 * Uses simple string matching instead of regex for reliability.
 */
const fs = require('fs');
const path = require('path');

const portals = ['admin', 'hod', 'mentor'];
const baseDir = __dirname;
let fixed = 0;

for (const portal of portals) {
  const pagesDir = path.join(baseDir, portal, 'src', 'pages');
  if (!fs.existsSync(pagesDir)) continue;

  const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.js'));

  for (const file of files) {
    const filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    const usesButton = content.includes('<Button');

    // Check if Button is already in an antd import
    const lines = content.split('\n');
    let hasButtonInAntd = false;
    let antdImportLineIdx = -1;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("from 'antd'") || lines[i].includes('from "antd"')) {
        antdImportLineIdx = i;
        if (lines[i].includes('Button')) {
          hasButtonInAntd = true;
        }
        break;
      }
    }

    if (usesButton && !hasButtonInAntd) {
      if (antdImportLineIdx >= 0) {
        // Add Button to existing antd import
        lines[antdImportLineIdx] = lines[antdImportLineIdx].replace(
          /import\s*\{/,
          'import { Button,'
        );
        content = lines.join('\n');
        modified = true;
        console.log(`  ✅ [${portal}] ${file}: Added Button to antd import`);
      } else {
        // No antd import — add one after the last import
        let lastImportLine = 0;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].trimStart().startsWith('import ')) lastImportLine = i;
        }
        lines.splice(lastImportLine + 1, 0, "import { Button } from 'antd';");
        content = lines.join('\n');
        modified = true;
        console.log(`  ✅ [${portal}] ${file}: Added new Button import`);
      }
    }

    // Fix navigate
    const usesNavigate = content.includes('navigate(-1)');
    const hasUseNavigate = content.includes('useNavigate');
    
    if (usesNavigate && !hasUseNavigate) {
      const lns = content.split('\n');
      for (let i = 0; i < lns.length; i++) {
        if (lns[i].includes("from 'react-router-dom'") || lns[i].includes('from "react-router-dom"')) {
          lns[i] = lns[i].replace(/import\s*\{/, 'import { useNavigate,');
          break;
        }
      }
      content = lns.join('\n');
      modified = true;
      console.log(`  ✅ [${portal}] ${file}: Added useNavigate import`);
    }

    // Ensure navigate is declared
    if (usesNavigate && !content.includes('const navigate = useNavigate()')) {
      content = content.replace(
        /(function\s+\w+\s*\([^)]*\)\s*\{)\s*\n/,
        '$1\n  const navigate = useNavigate();\n'
      );
      modified = true;
      console.log(`  ✅ [${portal}] ${file}: Added navigate declaration`);
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      fixed++;
    }
  }
}

console.log(`\n🎉 Fixed ${fixed} files total.`);
