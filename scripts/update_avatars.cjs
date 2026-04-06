const fs = require('fs');
const path = require('path');

const menteeDocs = [
  'admin/src/pages/MenteeDetailsPage.js',
  'hod/src/pages/MenteeDetailsPage.js',
  'mentor/src/pages/MenteeDetailsPage.js'
];

menteeDocs.forEach(file => {
  const filepath = path.join(__dirname, file);
  if (!fs.existsSync(filepath)) return;
  let code = fs.readFileSync(filepath, 'utf8');

  // Replace Title with the avatar container
  code = code.replace(
    /<Title level=\{2\} style=\{\{ marginTop: 0, marginBottom: 16, color: '#0f172a' \}\}>\{student\.profile\.name\}<\/Title>/,
    `<div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 24 }}>
              {student.profile.profileImage?.url ? (
                <img src={student.profile.profileImage.url} alt="Profile" style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: '4px solid #fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
              ) : (
                <div style={{ width: 120, height: 120, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 700, color: '#94a3b8', border: '4px solid #fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                  {student.profile.name.charAt(0)}
                </div>
              )}
              <Title level={2} style={{ margin: 0, color: '#0f172a' }}>{student.profile.name}</Title>
            </div>`
  );

  fs.writeFileSync(filepath, code);
  console.log('Updated ' + file);
});

// Admin HOD Details Page
const hodDetailsPath = path.join(__dirname, 'admin/src/pages/HodDetailsPage.js');
if (fs.existsSync(hodDetailsPath)) {
    let code = fs.readFileSync(hodDetailsPath, 'utf8');
     code = code.replace(
    /<Title level=\{2\} style=\{\{ margin: 0, color: '#0f172a' \}\}>\{hod\.name\}<\/Title>/,
    `
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
              {hod.profileImage?.url ? (
                <img src={hod.profileImage.url} alt="Profile" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '4px solid #fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} />
              ) : (
                <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, color: '#94a3b8', border: '4px solid #fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                  {hod.name.charAt(0)}
                </div>
              )}
              <Title level={2} style={{ margin: 0, color: '#0f172a' }}>{hod.name}</Title>
          </div>
    `
  );
  fs.writeFileSync(hodDetailsPath, code);
  console.log('Updated admin/src/pages/HodDetailsPage.js');
}
