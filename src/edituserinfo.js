import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import config from './config';

// Point frontend → EC2 backend (HTTPS behind Nginx/Certbot)
const API_BASE = config.apiUrl;

function EditUserInfo() {
  const [calendarToken, setCalendarToken] = useState('');
  const [password, setPassword] = useState('');
  const [botDefinition, setBotDefinition] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '70%',
    maxWidth: '600px',
    minHeight: '70%',
  };

  const bubbleStyle = {
    backgroundColor: 'white',
    width: '100%',
    flex: 1,
    borderRadius: '15px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '30px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    marginTop: '5px',
    marginBottom: '15px',
    fontSize: '16px',
  };

  const labelStyle = { fontSize: '16px', fontWeight: 'bold', color: '#333' };

  const buttonStyle = {
    backgroundColor: '#3f51b5',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    marginTop: '20px',
  };

  // Fetch user info on mount using the token from cookie "testtoken"
  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = Cookies.get('testtoken');
      if (!token) {
        setErrorMessage('User token not found.');
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/get-user-info?usertoken=${encodeURIComponent(token)}`);
        if (!res.ok) throw new Error('Failed to fetch user info');
        const data = await res.json();
        const userData = Array.isArray(data) ? data[0] : data;

        setCalendarToken(userData?.calendertoken || '');
        setPassword(userData?.password || '');
        setBotDefinition(userData?.botDefinition || '');
      } catch (err) {
        console.error(err);
        setErrorMessage('Failed to fetch user information.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleSave = async () => {
    const token = Cookies.get('testtoken');
    if (!token) {
      setErrorMessage('User token not found.');
      return;
    }

    const payload = { calendartoken: calendarToken, password, botDefinition };

    try {
      const res = await fetch(`${API_BASE}/edit?usertoken=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
      setSuccessMessage('User info updated successfully.');
        setErrorMessage('');
      } else {
        setSuccessMessage('');
      setErrorMessage('Failed to update user info.');
      }
    } catch (err) {
      console.error(err);
      setSuccessMessage('');
      setErrorMessage('Error updating user info.');
    }
  };

  if (loading) {
    return (
      <div
        style={{
          background: 'linear-gradient(135deg, #3f51b5, #283593)',
          minHeight: '100vh',
          width: '100vw',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          fontSize: '18px',
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #3f51b5, #283593)',
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
      }}
    >
      <div style={containerStyle}>
        <div style={bubbleStyle}>
          <h2 style={{ marginBottom: '20px' }}>Edit Your User Information</h2>
          {errorMessage && <p style={{ color: 'red', marginBottom: '10px' }}>{errorMessage}</p>}
          {successMessage && <p style={{ color: 'green', marginBottom: '10px' }}>{successMessage}</p>}

          <div style={{ marginBottom: '15px', width: '100%' }}>
            <label style={labelStyle}>Calendar Token:</label>
                  <input
                    type="text"
              placeholder="Calendar Token"
              style={inputStyle}
                    value={calendarToken}
                    onChange={(e) => setCalendarToken(e.target.value)}
                  />
                </div>

          <div style={{ marginBottom: '15px', width: '100%' }}>
            <label style={labelStyle}>Password:</label>
                  <input
                    type="password"
              placeholder="Password"
              style={inputStyle}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>

          <div style={{ marginBottom: '15px', width: '100%' }}>
            <label style={labelStyle}>Bot Definition:</label>
                  <textarea
              placeholder="Enter bot definition..."
              style={{ ...inputStyle, height: '150px', resize: 'vertical' }}
                    value={botDefinition}
                    onChange={(e) => setBotDefinition(e.target.value)}
                  />
                </div>

          <button onClick={handleSave} style={buttonStyle}>
            Save
                  </button>
                </div>
              </div>
    </div>
  );
}

export default EditUserInfo;
