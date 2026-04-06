const fs = require('fs');
const path = require('path');

const studentFiles = [
  'admin/src/pages/EditStudentPage.js',
  'hod/src/pages/EditStudentPage.js',
  'mentor/src/pages/EditStudentPage.js'
];

const mentorFiles = [
  'admin/src/pages/EditMentorPage.js',
  'hod/src/pages/EditMentorPage.js'
];

studentFiles.forEach(file => {
  const filepath = path.join(__dirname, file);
  if (!fs.existsSync(filepath)) return;
  let code = fs.readFileSync(filepath, 'utf8');

  // Insert profileImage state
  code = code.replace(
    /const \[saving, setSaving\] = useState\(false\);/g,
    "const [saving, setSaving] = useState(false);\n  const [profileImage, setProfileImage] = useState(null);\n  const [removeImage, setRemoveImage] = useState(false);"
  );

  // Re-write onFinish logic
  code = code.replace(
    /const body = \{[\s\S]*?achievements: \{[\s\S]*?\}[\s\S]*?\};[\s\S]*?await api\.put\(\`\/students\/\$\{studentId\}\`, body\);/,
    `const formData = new FormData();
      if (values.name) formData.append('name', values.name.trim());
      if (values.registerNumber) formData.append('registerNumber', values.registerNumber.trim());
      if (values.vmNumber) formData.append('vmNumber', values.vmNumber.trim());
      if (values.batch) formData.append('batch', values.batch.trim());
      if (values.section) formData.append('section', values.section.trim());
      if (values.semester) formData.append('semester', values.semester.trim());

      const personal = {
        dateOfBirth: values.dateOfBirth ? new Date(values.dateOfBirth) : null,
        placeOfBirth: values.placeOfBirth?.trim(),
        motherTongue: values.motherTongue?.trim()
      };
      formData.append('personal', JSON.stringify(personal));

      const parents = {
        fatherName: values.fatherName?.trim(),
        fatherQualification: values.fatherQualification?.trim(),
        fatherOccupation: values.fatherOccupation?.trim(),
        motherName: values.motherName?.trim(),
        motherQualification: values.motherQualification?.trim(),
        motherOccupation: values.motherOccupation?.trim()
      };
      formData.append('parents', JSON.stringify(parents));

      const addresses = {
        permanent: {
          doorNo: values.permanentDoorNo?.trim(),
          street: values.permanentStreet?.trim(),
          townOrVillage: values.permanentTownOrVillage?.trim(),
          taluk: values.permanentTaluk?.trim(),
          state: values.permanentState?.trim()
        },
        local: {
          doorNo: values.localDoorNo?.trim(),
          street: values.localStreet?.trim(),
          townOrVillage: values.localTownOrVillage?.trim(),
          taluk: values.localTaluk?.trim(),
          state: values.localState?.trim()
        }
      };
      formData.append('addresses', JSON.stringify(addresses));

      const contact = {
        contactNumber: values.contactNumber?.trim(),
        landline: values.landline?.trim(),
        email: values.email?.trim()
      };
      formData.append('contact', JSON.stringify(contact));

      const academics = {
        tenth: {
          board: values.tenthBoard?.trim(),
          yearOfPassing: values.tenthYearOfPassing?.trim(),
          english: { secured: Number(values.tenthEnglishSecured) || undefined, max: Number(values.tenthEnglishMax) || undefined },
          mathematics: { secured: Number(values.tenthMathSecured) || undefined, max: Number(values.tenthMathMax) || undefined },
          physics: { secured: Number(values.tenthPhysicsSecured) || undefined, max: Number(values.tenthPhysicsMax) || undefined },
          chemistry: { secured: Number(values.tenthChemistrySecured) || undefined, max: Number(values.tenthChemistryMax) || undefined },
          totalSecured: Number(values.tenthTotalSecured) || undefined,
          totalMax: Number(values.tenthTotalMax) || undefined
        },
        twelfth: {
          board: values.twelfthBoard?.trim(),
          yearOfPassing: values.twelfthYearOfPassing?.trim(),
          english: { secured: Number(values.twelfthEnglishSecured) || undefined, max: Number(values.twelfthEnglishMax) || undefined },
          mathematics: { secured: Number(values.twelfthMathSecured) || undefined, max: Number(values.twelfthMathMax) || undefined },
          physics: { secured: Number(values.twelfthPhysicsSecured) || undefined, max: Number(values.twelfthPhysicsMax) || undefined },
          chemistry: { secured: Number(values.twelfthChemistrySecured) || undefined, max: Number(values.twelfthChemistryMax) || undefined },
          totalSecured: Number(values.twelfthTotalSecured) || undefined,
          totalMax: Number(values.twelfthTotalMax) || undefined
        }
      };
      formData.append('academics', JSON.stringify(academics));

      const health = {
        generalHealth: values.generalHealth?.trim(),
        eyeSight: values.eyeSight?.trim(),
        bloodGroup: values.bloodGroup?.trim(),
        otherDeficiency: values.otherDeficiency?.trim(),
        illnessLastThreeYears: values.illnessLastThreeYears?.trim()
      };
      formData.append('health', JSON.stringify(health));

      const achievements = {
        past: values.achievementsPast?.trim(),
        present: values.achievementsPresent?.trim(),
        features: values.achievementsFeatures?.trim()
      };
      formData.append('achievements', JSON.stringify(achievements));

      if (profileImage) {
        formData.append('profileImage', profileImage);
      }
      if (removeImage) {
        formData.append('removeImage', 'true');
      }

      await api.put(\`/students/\${studentId}\`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });`
  );

  // Add the UI elements for file input
  code = code.replace(
    /<Col xs=\{24\} sm=\{12\}><Form.Item label=\{<span style=\{\{ fontWeight: 600 \}\}>Semester<\/span>\} name="semester"><Input \/><\/Form.Item><\/Col>\n\s*<\/Row>/,
    `<Col xs={24} sm={12}><Form.Item label={<span style={{ fontWeight: 600 }}>Semester</span>} name="semester"><Input /></Form.Item></Col>
                <Col xs={24} sm={12}>
                  <Form.Item label={<span style={{ fontWeight: 600 }}>Profile Image</span>}>
                    <Input type="file" accept="image/*" onChange={(e) => setProfileImage(e.target.files[0])} style={{ padding: '4px' }} />
                    <div style={{ marginTop: 8 }}>
                      <label>
                        <input type="checkbox" onChange={(e) => setRemoveImage(e.target.checked)} />
                        &nbsp;Remove existing image
                      </label>
                    </div>
                  </Form.Item>
                </Col>
              </Row>`
  );

  fs.writeFileSync(filepath, code);
  console.log('Updated ' + file);
});


mentorFiles.forEach(file => {
  const filepath = path.join(__dirname, file);
  if (!fs.existsSync(filepath)) return;
  let code = fs.readFileSync(filepath, 'utf8');

  code = code.replace(
    /const \[saving, setSaving\] = useState\(false\);/,
    "const [saving, setSaving] = useState(false);\n  const [profileImage, setProfileImage] = useState(null);\n  const [removeImage, setRemoveImage] = useState(false);"
  );

  code = code.replace(
    /const response = await api\.put\(\`\/users\/mentor\/\$\{mentorId\}\`, values\);/,
    `const formData = new FormData();
      Object.keys(values).forEach(key => {
        if (values[key]) {
          formData.append(key, values[key]);
        }
      });
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }
      if (removeImage) {
        formData.append('removeImage', 'true');
      }

      const response = await api.put(\`/users/mentor/\${mentorId}\`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });`
  );

  if (code.includes('Department')) {
    code = code.replace(
      /<Col xs=\{24\} sm=\{24\}>\n\s*<Form\.Item label=\{<span style=\{\{ fontWeight: 600, color: '#334155' \}\}>Department<\/span>\} name="department" rules=\{\[\{ required: true, message: 'Required!' \}\]\}>\n\s*<Input \/>\n\s*<\/Form\.Item>\n\s*<\/Col>/,
      `<Col xs={24} sm={12}>
                  <Form.Item label={<span style={{ fontWeight: 600, color: '#334155' }}>Department</span>} name="department" rules={[{ required: true, message: 'Required!' }]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label={<span style={{ fontWeight: 600, color: '#334155' }}>Profile Image</span>}>
                    <Input type="file" accept="image/*" onChange={(e) => setProfileImage(e.target.files[0])} style={{ padding: '4px' }} />
                    <div style={{ marginTop: 8 }}>
                      <label>
                        <input type="checkbox" onChange={(e) => setRemoveImage(e.target.checked)} />
                        &nbsp;Remove existing image
                      </label>
                    </div>
                  </Form.Item>
                </Col>`
    );
  } else {
    // If no department column, just insert it inside the row
      code = code.replace(
      /<\/Row>/,
      `  <Col xs={24} sm={24}>
                  <Form.Item label={<span style={{ fontWeight: 600, color: '#334155' }}>Profile Image</span>}>
                    <Input type="file" accept="image/*" onChange={(e) => setProfileImage(e.target.files[0])} style={{ padding: '4px' }} />
                    <div style={{ marginTop: 8 }}>
                      <label>
                        <input type="checkbox" onChange={(e) => setRemoveImage(e.target.checked)} />
                        &nbsp;Remove existing image
                      </label>
                    </div>
                  </Form.Item>
                </Col>
              </Row>`
    );
  }

  fs.writeFileSync(filepath, code);
  console.log('Updated ' + file);
});
