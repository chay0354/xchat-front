import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import logo from './logo.png';

// Validate environment variable and set fallback
const API_BASE = process.env.REACT_APP_API_URL || 'https://xchatback123.xyz';
if (!process.env.REACT_APP_API_URL) {
  console.warn('REACT_APP_API_URL is not set! Using fallback: https://xchatback123.xyz');
  console.warn('Please check your .env file and restart the React app.');
}

const adminStyles = `
.admin-root {
  min-height: 100vh;
  background: radial-gradient(1200px 900px at -10% -20%, #1b2232 0%, var(--bg) 50%), var(--bg);
  color: var(--text);
  padding: 20px;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 24px 28px;
  background: linear-gradient(180deg, rgba(15,20,32,0.9), rgba(15,20,32,0.8));
  border-radius: 18px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  backdrop-filter: blur(10px);
}

.admin-title {
  font-size: 28px;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, var(--brand), var(--brand-2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

  .admin-nav {
    display: flex;
    gap: 15px;
    align-items: center;
    flex-wrap: wrap;
  }
  
  .admin-logo {
    height: 30px;
    width: auto;
    object-fit: contain;
    flex-shrink: 0;
  }

.admin-welcome {
  font-size: 14px;
  color: #ffffff;
  font-weight: 500;
}

.btn {
  padding: 12px 20px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--panel);
  color: var(--text);
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;
  font-size: 14px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

.btn:hover {
  background: var(--panel-strong);
  border-color: var(--brand);
  transform: translateY(-1px);
}

.btn--primary {
  background: linear-gradient(135deg, var(--brand), var(--brand-2));
  border-color: var(--brand);
  color: white;
  box-shadow: 0 4px 15px rgba(110, 168, 254, 0.3);
}

.btn--danger {
  background: linear-gradient(135deg, var(--warn), #dc2626);
  border-color: var(--warn);
  color: white;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
}

.admin-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 24px;
  height: calc(100vh - 140px);
}

.users-panel {
  background: linear-gradient(180deg, rgba(15,20,32,0.9), rgba(15,20,32,0.8));
  border-radius: 18px;
  border: 1px solid var(--border);
  padding: 24px;
  overflow-y: auto;
  box-shadow: var(--shadow);
  backdrop-filter: blur(10px);
}

.users-title {
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 24px;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 10px;
}

.users-count {
  background: var(--brand);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-item {
  padding: 18px 20px;
  background: linear-gradient(180deg, rgba(27,34,50,0.8), rgba(15,20,32,0.6));
  border-radius: 12px;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.user-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--brand), var(--brand-2));
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.user-item:hover {
  border-color: var(--brand);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(110, 168, 254, 0.15);
}

.user-item:hover::before {
  transform: scaleX(1);
}

.user-item.active {
  border-color: var(--brand);
  background: linear-gradient(135deg, rgba(110, 168, 254, 0.1), rgba(138, 125, 255, 0.05));
  box-shadow: 0 8px 25px rgba(110, 168, 254, 0.2);
}

.user-item.active::before {
  transform: scaleX(1);
}

.user-name {
  font-weight: 700;
  margin-bottom: 6px;
  font-size: 16px;
  color: #ffffff;
}

.user-date {
  font-size: 13px;
  color: #b8c5d1;
  font-weight: 500;
}

.details-panel {
  background: linear-gradient(180deg, rgba(15,20,32,0.9), rgba(15,20,32,0.8));
  border-radius: 18px;
  border: 1px solid var(--border);
  padding: 24px;
  overflow-y: auto;
  box-shadow: var(--shadow);
  backdrop-filter: blur(10px);
}

.details-title {
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 24px;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-info {
  background: linear-gradient(180deg, rgba(27,34,50,0.8), rgba(15,20,32,0.6));
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  border: 1px solid var(--border);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.user-actions {
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.info-row:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.info-label {
  font-weight: 700;
  color: #b8c5d1;
  font-size: 14px;
}

.info-value {
  color: #ffffff;
  font-weight: 600;
  font-size: 14px;
}

.conversations-title {
  font-size: 18px;
  font-weight: 800;
  margin-bottom: 20px;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 10px;
}

.conversations-count {
  background: var(--ok);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}

.conversation-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.conversation-item {
  background: linear-gradient(180deg, rgba(27,34,50,0.8), rgba(15,20,32,0.6));
  border-radius: 12px;
  padding: 20px;
  border: 1px solid var(--border);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.conversation-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.conversation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.conversation-idx {
  font-weight: 800;
  color: var(--brand);
  font-size: 16px;
  background: rgba(110, 168, 254, 0.1);
  padding: 6px 12px;
  border-radius: 20px;
}

.conversation-date {
  font-size: 13px;
  color: #b8c5d1;
  font-weight: 500;
}

.conversation-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-pair {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: rgba(0,0,0,0.1);
  border-radius: 8px;
  border-left: 3px solid var(--brand);
}

.question, .answer {
  padding: 16px;
  border-radius: 10px;
  font-size: 14px;
  line-height: 1.6;
  font-weight: 500;
  color: #ffffff;
}

.question {
  background: linear-gradient(135deg, rgba(110, 168, 254, 0.1), rgba(110, 168, 254, 0.05));
  border-left: 4px solid var(--brand);
  border: 1px solid rgba(110, 168, 254, 0.2);
}

.answer {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05));
  border-left: 4px solid var(--ok);
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.loading {
  text-align: center;
  padding: 40px 20px;
  color: #b8c5d1;
  font-size: 16px;
  font-weight: 600;
}

.error {
  color: var(--warn);
  text-align: center;
  padding: 20px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(239, 68, 68, 0.3);
  font-weight: 600;
}

.no-data {
  text-align: center;
  color: #b8c5d1;
  padding: 60px 20px;
  font-style: italic;
  font-size: 16px;
  font-weight: 500;
}

.bot-definition {
  background: linear-gradient(180deg, rgba(27,34,50,0.8), rgba(15,20,32,0.6));
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
  border: 1px solid var(--border);
  max-height: 250px;
  overflow-y: auto;
  font-size: 13px;
  line-height: 1.6;
  color: #b8c5d1;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.bot-definition-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #ffffff;
}

/* Scrollbar styling */
.users-panel::-webkit-scrollbar,
.details-panel::-webkit-scrollbar,
.bot-definition::-webkit-scrollbar {
  width: 6px;
}

.users-panel::-webkit-scrollbar-track,
.details-panel::-webkit-scrollbar-track,
.bot-definition::-webkit-scrollbar-track {
  background: var(--panel);
  border-radius: 3px;
}

.users-panel::-webkit-scrollbar-thumb,
.details-panel::-webkit-scrollbar-thumb,
.bot-definition::-webkit-scrollbar-thumb {
  background: var(--brand);
  border-radius: 3px;
}

.users-panel::-webkit-scrollbar-thumb:hover,
.details-panel::-webkit-scrollbar-thumb:hover,
.bot-definition::-webkit-scrollbar-thumb:hover {
  background: var(--brand-2);
}

/* Mobile Responsive Design */
@media (max-width: 1200px) {
  .admin-content {
    grid-template-columns: 1fr;
    gap: 20px;
    height: auto;
  }
  
  .users-panel,
  .details-panel {
    height: 50vh;
    min-height: 400px;
  }
}

@media (max-width: 768px) {
  .admin-root {
    padding: 12px;
  }
  
  .admin-header {
    padding: 16px 20px;
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .admin-title {
    font-size: 24px;
  }
  
  .admin-nav {
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
  }
  
  .admin-logo {
    height: 24px;
    order: 1;
  }
  
  .admin-welcome {
    font-size: 13px;
    order: 2;
    flex: 1;
    text-align: center;
    margin: 0 8px;
  }
  
  .btn {
    padding: 10px 16px;
    font-size: 13px;
    order: 3;
  }
  
  .admin-content {
    gap: 16px;
  }
  
  .users-panel,
  .details-panel {
    height: 45vh;
    min-height: 350px;
    padding: 16px;
  }
  
  .users-title,
  .details-title {
    font-size: 18px;
    margin-bottom: 16px;
  }
  
  .user-item {
    padding: 14px 16px;
  }
  
  .user-name {
    font-size: 14px;
  }
  
  .user-date {
    font-size: 12px;
  }
  
  .conversation-item {
    padding: 16px;
  }
  
  .conversation-header {
    margin-bottom: 12px;
    padding-bottom: 8px;
  }
  
  .conversation-idx {
    font-size: 14px;
    padding: 4px 8px;
  }
  
  .conversation-date {
    font-size: 11px;
  }
  
  .question, .answer {
    padding: 12px;
    font-size: 13px;
  }
  
  .bot-definition {
    font-size: 12px;
    padding: 16px;
    max-height: 200px;
  }
}

@media (max-width: 480px) {
  .admin-root {
    padding: 8px;
  }
  
  .admin-header {
    padding: 12px 16px;
  }
  
  .admin-title {
    font-size: 20px;
  }
  
  .admin-nav {
    flex-direction: row;
    align-items: center;
    gap: 8px;
    justify-content: space-between;
  }
  
  .admin-logo {
    height: 20px;
    order: 1;
  }
  
  .admin-welcome {
    font-size: 11px;
    order: 2;
    flex: 1;
    text-align: center;
    margin: 0 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .btn {
    padding: 8px 12px;
    font-size: 12px;
    order: 3;
    white-space: nowrap;
  }
  
  .users-panel,
  .details-panel {
    height: 40vh;
    min-height: 300px;
    padding: 12px;
  }
  
  .users-title,
  .details-title {
    font-size: 16px;
    margin-bottom: 12px;
  }
  
  .user-item {
    padding: 12px 14px;
  }
  
  .user-name {
    font-size: 13px;
  }
  
  .user-date {
    font-size: 11px;
  }
  
  .conversation-item {
    padding: 12px;
  }
  
  .conversation-header {
    margin-bottom: 10px;
    padding-bottom: 6px;
  }
  
  .conversation-idx {
    font-size: 12px;
    padding: 3px 6px;
  }
  
  .conversation-date {
    font-size: 10px;
  }
  
  .question, .answer {
    padding: 10px;
    font-size: 12px;
  }
  
  .bot-definition {
    font-size: 11px;
    padding: 12px;
    max-height: 150px;
  }
  
  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .info-label {
    font-size: 12px;
  }
  
  .info-value {
    font-size: 13px;
  }
}
`;

function Admin() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [userTokens, setUserTokens] = useState({}); // Store tokens by user ID
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const email = Cookies.get('email');

  useEffect(() => {
    if (email !== 'flowchat.admin@gmail.com') {
      navigate('/login');
      return;
    }
    fetchUsers();
  }, [email, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usertoken = Cookies.get('testtoken') || Cookies.get('usertoken');
      
      if (!usertoken) {
        setError('No authentication token found. Please log in again.');
        setLoading(false);
        return;
      }
      
      const response = await fetch(
        `${API_BASE}/admin/users?usertoken=${encodeURIComponent(usertoken)}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data.users);
      
      // Extract tokens from users array - backend returns [id, username, created_at, token]
      const tokensMap = {};
      console.log('Users list from backend:', data.users); // Debug log
      data.users.forEach((user) => {
        const userId = user[0];
        // Backend returns token at index 3: [id, username, created_at, token]
        let token = null;
        if (user[3] && user[3] !== '' && user[3] !== null) {
          token = user[3];
        }
        // Also check other possible locations for compatibility
        if (!token && user[4] && user[4] !== '' && user[4] !== null) {
          token = user[4];
        }
        // Check if user is an object with token property
        if (!token && user.token && user.token !== '' && user.token !== null) {
          token = user.token;
        }
        if (!token && user.usertoken && user.usertoken !== '' && user.usertoken !== null) {
          token = user.usertoken;
        }
        
        if (token && userId) {
          tokensMap[userId] = token;
        }
      });
      if (Object.keys(tokensMap).length > 0) {
        setUserTokens(tokensMap);
        console.log('Stored user tokens:', tokensMap); // Debug log
      } else {
        console.warn('No tokens found in users list!'); // Debug log
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      setLoading(true);
      const usertoken = Cookies.get('testtoken') || Cookies.get('usertoken');
      const response = await fetch(
        `${API_BASE}/admin/user/${userId}?usertoken=${encodeURIComponent(usertoken)}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }
      
      const data = await response.json();
      console.log('User details response:', JSON.stringify(data, null, 2)); // Debug: log the full response
      
      // Ensure token is always present in userDetails
      const userDetailsId = data.user?.id;
      if (userDetailsId) {
        // Get token from response (check all possible field names)
        let tokenValue = data.user?.usertoken || 
                        data.user?.token || 
                        data.user?.userToken ||
                        data.user?.token;
        
        // If token is missing or empty, try to get it from stored tokens
        if ((!tokenValue || tokenValue === '') && userTokens[userDetailsId]) {
          tokenValue = userTokens[userDetailsId];
          data.user.token = tokenValue;
          data.user.usertoken = tokenValue;
          data.user.userToken = tokenValue;
        }
        
        // If still no token, try to get from users list
        if ((!tokenValue || tokenValue === '') && users.length > 0) {
          const userFromList = users.find(u => u[0] === userDetailsId);
          if (userFromList && userFromList[3]) {
            tokenValue = userFromList[3];
            data.user.token = tokenValue;
            data.user.usertoken = tokenValue;
            data.user.userToken = tokenValue;
          }
        }
        
        // Store the token for future use (even if empty, so we know we tried)
        if (tokenValue) {
          setUserTokens(prev => ({ ...prev, [userDetailsId]: tokenValue }));
        }
        
        console.log('Token found for user:', userDetailsId, 'token:', tokenValue ? tokenValue.substring(0, 10) + '...' : 'NOT FOUND'); // Debug log
      }
      
      console.log('User details after processing:', JSON.stringify(data.user, null, 2)); // Debug log
      setUserDetails(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    console.log('Selected user array:', user); // Debug: log the user array structure
    fetchUserDetails(user[0]); // user[0] is the id
  };

  const handleLogout = () => {
    Cookies.remove('email');
    Cookies.remove('testtoken');
    navigate('/login');
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק את המשתמש הזה? פעולה זו לא ניתנת לביטול.')) {
      return;
    }

    try {
      setDeleting(true);
      const usertoken = Cookies.get('testtoken') || Cookies.get('usertoken');
      const response = await fetch(
        `${API_BASE}/admin/user/${userId}?usertoken=${encodeURIComponent(usertoken)}`,
        { method: 'DELETE' }
      );
      
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      
      // Refresh users list
      await fetchUsers();
      setSelectedUser(null);
      setUserDetails(null);
    } catch (err) {
      setError('שגיאה במחיקת המשתמש: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  if (loading && users.length === 0) {
    return (
      <div className="admin-root">
        <style>{adminStyles}</style>
        <div className="loading">טוען לוח בקרה...</div>
      </div>
    );
  }

  return (
    <div className="admin-root">
      <style>{adminStyles}</style>
      
      <div className="admin-header">
        <div className="admin-title">לוח בקרה</div>
        <div className="admin-nav">
          <img src={logo} alt="Logo" className="admin-logo" />
          <span className="admin-welcome">ברוך הבא, {email}</span>
          <button className="btn btn--danger" onClick={handleLogout}>
            התנתק
          </button>
        </div>
      </div>

      <div className="admin-content">
        <div className="users-panel">
          <div className="users-title">
            משתמשים
            <span className="users-count">{users.length}</span>
          </div>
          {error && <div className="error">{error}</div>}
          {users.length === 0 ? (
            <div className="no-data">לא נמצאו משתמשים</div>
          ) : (
            <div className="user-list">
              {users.map((user) => (
                <div
                  key={user[0]}
                  className={`user-item ${selectedUser?.[0] === user[0] ? 'active' : ''}`}
                  onClick={() => handleUserSelect(user)}
                >
                  <div className="user-name">{user[1]}</div>
                  <div className="user-date">הצטרף: {formatDate(user[2])}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="details-panel">
          {!selectedUser ? (
            <div className="no-data">בחר משתמש כדי לראות פרטים</div>
          ) : loading ? (
            <div className="loading">טוען פרטי משתמש...</div>
          ) : userDetails ? (
            <>
              <div className="details-title">פרטי משתמש</div>
              
              <div className="user-info">
                <div className="info-row">
                  <span className="info-label">מזהה משתמש:</span>
                  <span className="info-value">{userDetails.user.id}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">אימייל:</span>
                  <span className="info-value">{userDetails.user.email}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">User Token:</span>
                  <span className="info-value" style={{ 
                    fontFamily: 'monospace', 
                    fontSize: '12px',
                    wordBreak: 'break-all',
                    cursor: 'pointer',
                    userSelect: 'all',
                    color: '#6ea8fe'
                  }} 
                  onClick={(e) => {
                    // Check all possible locations for the token - prioritize userDetails
                    const userId = userDetails.user?.id;
                    let token = userDetails.user?.usertoken || 
                                userDetails.user?.token || 
                                userDetails.user?.userToken ||
                                userDetails?.usertoken ||
                                userDetails?.token;
                    
                    // Fallback to stored tokens or selectedUser
                    if (!token || token === '') {
                      token = userTokens[userId] || 
                              selectedUser?.[3] || 
                              selectedUser?.[4] ||
                              selectedUser?.token || 
                              selectedUser?.usertoken;
                    }
                    
                    // Final fallback: try to get from users list if we have userId
                    if ((!token || token === '') && userId && users.length > 0) {
                      const userFromList = users.find(u => u[0] === userId);
                      if (userFromList && userFromList[3]) {
                        token = userFromList[3];
                      }
                    }
                    
                    token = token || 'לא זמין';
                    if (token !== 'לא זמין') {
                      navigator.clipboard.writeText(token).then(() => {
                        alert('User Token הועתק ללוח');
                      }).catch(() => {
                        // Fallback for older browsers
                        const textArea = document.createElement('textarea');
                        textArea.value = token;
                        document.body.appendChild(textArea);
                        textArea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textArea);
                        alert('User Token הועתק ללוח');
                      });
                    }
                  }}
                  title="לחץ להעתקה">
                    {(() => {
                      // Try to get token from all possible locations - prioritize userDetails
                      const userId = userDetails.user?.id;
                      
                      // Check userDetails first (most reliable)
                      let token = userDetails.user?.usertoken || 
                                  userDetails.user?.token || 
                                  userDetails.user?.userToken ||
                                  userDetails?.usertoken ||
                                  userDetails?.token;
                      
                      // Remove empty strings
                      if (token === '' || token === null || token === undefined) {
                        token = null;
                      }
                      
                      // Fallback to stored tokens
                      if (!token && userId) {
                        token = userTokens[userId];
                      }
                      
                      // Fallback to selectedUser array
                      if (!token) {
                        token = selectedUser?.[3] || 
                                selectedUser?.[4] ||
                                selectedUser?.token || 
                                selectedUser?.usertoken;
                      }
                      
                      // Final fallback: try to get from users list if we have userId
                      if (!token && userId && users.length > 0) {
                        const userFromList = users.find(u => u[0] === userId);
                        if (userFromList && userFromList[3]) {
                          token = userFromList[3];
                        }
                      }
                      
                      // Debug log in production
                      if (!token) {
                        console.warn('Token not found for user:', userId, {
                          userDetails: userDetails.user,
                          userTokens: userTokens[userId],
                          selectedUser: selectedUser,
                          usersList: users.find(u => u[0] === userId)
                        });
                      }
                      
                      return token || 'לא זמין';
                    })()}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">שם מלא:</span>
                  <span className="info-value">{userDetails.user.fullname || 'לא צוין'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">טלפון:</span>
                  <span className="info-value">{userDetails.user.phone || 'לא צוין'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">נוצר:</span>
                  <span className="info-value">{formatDate(userDetails.user.created_at)}</span>
                </div>
              </div>

              <div className="user-actions">
                <button 
                  className="btn btn--danger" 
                  onClick={() => handleDeleteUser(userDetails.user.id)}
                  disabled={deleting}
                >
                  {deleting ? 'מוחק...' : 'מחק משתמש'}
                </button>
              </div>

              {userDetails.user.botDefinition && (
                <div>
                  <div className="bot-definition-title">הגדרת בוט</div>
                  <div className="bot-definition">
                    {userDetails.user.botDefinition}
                  </div>
                </div>
              )}

              <div className="conversations-title">
                שיחות
                <span className="conversations-count">{userDetails.conversations.length}</span>
              </div>
              
              {userDetails.conversations.length === 0 ? (
                <div className="no-data">לא נמצאו שיחות</div>
              ) : (
                <div className="conversation-list">
                  {(() => {
                    // Group conversations by convtoken
                    const groupedConversations = {};
                    userDetails.conversations.forEach(conv => {
                      const convToken = conv[1]; // conv[1] is convtoken
                      if (!groupedConversations[convToken]) {
                        groupedConversations[convToken] = [];
                      }
                      groupedConversations[convToken].push(conv);
                    });

                    // Sort conversation tokens by the first message's date
                    const sortedTokens = Object.keys(groupedConversations).sort((a, b) => {
                      const dateA = new Date(groupedConversations[a][0][5]); // conv[5] is created_at
                      const dateB = new Date(groupedConversations[b][0][5]);
                      return dateB - dateA; // Most recent first
                    });

                    return sortedTokens.map((convToken, index) => {
                      const convMessages = groupedConversations[convToken];
                      const firstMessage = convMessages[0];
                      // const lastMessage = convMessages[convMessages.length - 1];
                      
                      return (
                        <div key={convToken} className="conversation-item">
                          <div className="conversation-header">
                            <span className="conversation-idx">שיחה #{index + 1}</span>
                            <span className="conversation-date">{formatDate(firstMessage[5])}</span>
                          </div>
                          <div className="conversation-content">
                            {convMessages.map((msg, msgIndex) => (
                              <div key={msg[0]} className="message-pair">
                                {msg[3] && (
                                  <div className="question">
                                    <strong>שאלה {msgIndex + 1}:</strong> {msg[3]}
                                  </div>
                                )}
                                {msg[4] && (
                                  <div className="answer">
                                    <strong>תשובה {msgIndex + 1}:</strong> {msg[4]}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </>
          ) : (
            <div className="error">נכשל בטעינת פרטי המשתמש</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Admin;
