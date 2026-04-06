import React, { useState, useEffect } from 'react';
import { Upload } from 'antd';
import ImgCrop from 'antd-img-crop';
import { PlusOutlined } from '@ant-design/icons';

const ProfileImageUpload = ({ onChange, defaultImage }) => {
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    if (defaultImage && fileList.length === 0) {
      setFileList([{ uid: '-1', name: 'current-profile', status: 'done', url: defaultImage }]);
    }
  }, [defaultImage, fileList.length]);

  const onChangeHandler = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    if (newFileList.length > 0 && newFileList[0].originFileObj) {
      // Pass the cropped File/Blob object up to parent
      onChange(newFileList[0].originFileObj);
    } else if (newFileList.length === 0) {
      // Handle the case where the user deletes the image
      onChange(null);
    }
  };

  const dummyRequest = ({ file, onSuccess }) => {
    setTimeout(() => {
      onSuccess("ok");
    }, 0);
  };

  return (
    <ImgCrop rotationSlider aspect={1} shape="round" quality={0.8} fillColor="transparent">
      <Upload
        accept="image/jpeg, image/png, image/webp"
        listType="picture-card"
        fileList={fileList}
        onChange={onChangeHandler}
        customRequest={dummyRequest}
        maxCount={1}
        showUploadList={{ showPreviewIcon: false }}
      >
        {fileList.length < 1 && (
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload Photo</div>
          </div>
        )}
      </Upload>
    </ImgCrop>
  );
};

export default ProfileImageUpload;
