import React, { useState } from "react";
import './registrationPopup.css';

const RegistrationPopup = ({onSubmit}) => {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");

    const onFormSubmit = (e) => {
      e.preventDefault();
      onSubmit({
        login,
        password
      })
    }

    return (
      <div className="popup-wrapper">
        <form className="popup" onSubmit={e => onFormSubmit(e)} autoComplete="on">
        <label>Login</label>
        <input className="formField" value={login} onChange={e => setLogin(e.target.value)}/>
        <label>Password</label>
        <input className="formField" value={password} onChange={e => setPassword(e.target.value)}/>
        <button type="submit">sign up</button>
      </form>
      </div>
    )
  }

  export default RegistrationPopup;