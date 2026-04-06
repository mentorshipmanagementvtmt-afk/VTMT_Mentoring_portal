const fs = require('fs');
const path = require('path');

const code = `import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Modal, Form, Input, Button,  Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const { Text } = Typography;

function MyProfileModal({ visible, onClose }) {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [removeImage, setRemoveImage] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      if (removeImage && !file) {
        await api.delete('/users/profile/image');
        toast.success('Profile image removed!');
        const updatedUser = { ...user, profileImage: { url: '', publicId: '' } };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else if (file) {
        const formData = new FormData();
        formData.append('profileImage', file);
        const res = await api.put('/users/profile/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Profile image updated!');
        const updatedUser = { ...user, profileImage: res.data.profileImage };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        toast.info('No changes made');
        onClose();
        return;
      }
      onClose();
      window.location.reload();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update profile image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="My Profile"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>Cancel</Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleUpdate}>Save Changes</Button>
      ]}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24, marginTop: 16 }}>
        {user?.profileImage?.url ? (
          <img src={user.profileImage.url} alt="Profile" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', marginBottom: 16, border: '4px solid #fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
        ) : (
          <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, border: '4px solid #fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : <UserOutlined style={{ fontSize: 40, color: '#94a3b8' }} />}
          </div>
        )}
        <Text strong style={{ fontSize: 18 }}>{user?.name}</Text>
        <Text type="secondary">{user?.email}</Text>
        <Text type="secondary" keyboard>{user?.role?.toUpperCase()}</Text>
      </div>

      <Form layout="vertical">
        <Form.Item label="Update Profile Picture">
          <Input type="file" accept="image/*" onChange={(e) => { setFile(e.target.files[0]); setRemoveImage(false); }} />
        </Form.Item>
        {user?.profileImage?.url && (
          <div style={{ marginTop: 8 }}>
            <label>
              <input type="checkbox" checked={removeImage} onChange={(e) => setRemoveImage(e.target.checked)} />
              &nbsp;Remove existing image
            </label>
          </div>
        )}
      </Form>
    </Modal>
  );
}

export default MyProfileModal;
`;

const targets = [
  'hod/src/components/MyProfileModal.js',
  'mentor/src/components/MyProfileModal.js'
];

targets.forEach(t => {
  fs.writeFileSync(path.join(__dirname, t), code);
});
console.log('Created MyProfileModal.js in hod and mentor');

const dashboardTargets = [
    'hod/src/pages/DashboardPage.js',
    'mentor/src/pages/DashboardPage.js'
]

dashboardTargets.forEach(t => {
    const file = path.join(__dirname, t);
    let ds = fs.readFileSync(file, 'utf8');
    ds = ds.replace(/import \{ LogoutOutlined \} from '@ant-design\/icons'/, "import { LogoutOutlined, UserOutlined } from '@ant-design/icons'\nimport MyProfileModal from '../components/MyProfileModal'");
    
    // Add the state
    ds = ds.replace(/const navigate = useNavigate\(\)/, "const navigate = useNavigate()\n  const [profileModalVisible, setProfileModalVisible] = useState(false)");
    
    // Add state import
    if (!ds.includes('useState')) {
        ds = ds.replace(/import React from 'react'/, "import React, { useState } from 'react'");
    }

    // Add Profile Button
    ds = ds.replace(/<Button type="default" icon=\{<LogoutOutlined \/>\} onClick=\{handleLogout\} className="flex items-center">\n\s*Logout\n\s*<\/Button>/,
    `<Button type="default" icon={<UserOutlined />} onClick={() => setProfileModalVisible(true)} className="flex items-center">
            My Profile
          </Button>
          <Button type="default" icon={<LogoutOutlined />} onClick={handleLogout} className="flex items-center">
            Logout
          </Button>`);

    // Add Modal to JSX
    ds = ds.replace(/<\/Content>/, `  <MyProfileModal visible={profileModalVisible} onClose={() => setProfileModalVisible(false)} />\n        </Content>`);

    fs.writeFileSync(file, ds);
})

console.log('Updated DashboardPages')
