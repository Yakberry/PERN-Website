import React, { useState } from "react";
import './uploadPopup.css';
//import App from "App.js"

const UploadPopup = () => {

  const [uploadedFile, setUploadedFile] = useState(null);

  const onFormSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData()
    formData.append('file', uploadedFile)

    fetch('/upload-file', {
      body: formData,
      method: 'POST'
    })
  }

    return (
      <div className="popup-wrapper">
      <form className="popup" method="POST" onSubmit={e => onFormSubmit(e)} encType="multipart/form-data">
        <input className="formField" type="file"  onChange={e => setUploadedFile(e.target.files[0])}/>
        <button className="formField" type="submit">sign up</button>
      </form>
      </div>
    )
  }

  export default UploadPopup;