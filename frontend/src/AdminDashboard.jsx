import React, { useState, useEffect } from 'react';

export default function AdminDashboard({ setCurrentPage }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const jwt = localStorage.getItem('jwt');

  const fetchUsers = () => {
    fetch('http://localhost:8082/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${jwt}`
      }
    })
    .then(res => res.json())
    .then(data => {
      setUsers(data);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    if (!jwt) {
      setCurrentPage('signin');
      return;
    }
    fetchUsers();
  }, [jwt, setCurrentPage]);

  const handleApprove = (userId, role) => {
    fetch(`http://localhost:8082/api/admin/users/${userId}/approve`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ role: role })
    })
    .then(res => {
      if (res.ok) {
        alert('User approved and notified via email');
        fetchUsers();
      } else {
        alert('Failed to approve user');
      }
    });
  };

  const handleReject = (userId) => {
    if (window.confirm("Are you sure you want to reject and remove this user?")) {
      fetch(`http://localhost:8082/api/admin/users/${userId}/reject`, {
        method: 'PUT',
        headers: {
           'Authorization': `Bearer ${jwt}`
        }
      })
      .then(res => {
        if (res.ok) {
          alert('User rejected and notified via email');
          fetchUsers();
        } else {
          alert('Failed to reject user');
        }
      });
    }
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f3f4f6', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', color: '#1f2937', fontWeight: 'bold' }}>Admin Dashboard</h1>
        <button 
          onClick={() => {
            localStorage.removeItem('jwt');
            localStorage.removeItem('user');
            setCurrentPage('signin');
          }}
          style={{ padding: '10px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>
      
      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px', color: '#374151' }}>User Registrations</h2>
        
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
                <th style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>Name</th>
                <th style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>Email</th>
                <th style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>Role</th>
                <th style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>Status</th>
                <th style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px' }}>{user.fullName || user.username}</td>
                  <td style={{ padding: '12px' }}>{user.email}</td>
                  <td style={{ padding: '12px' }}>{user.role}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px', borderRadius: '9999px', fontSize: '12px', fontWeight: 'bold',
                      background: user.status === 'PENDING' ? '#fef3c7' : user.status === 'ACTIVE' ? '#d1fae5' : '#fee2e2',
                      color: user.status === 'PENDING' ? '#d97706' : user.status === 'ACTIVE' ? '#059669' : '#dc2626'
                    }}>
                      {user.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', display: 'flex', gap: '8px' }}>
                    {user.status === 'PENDING' && (
                      <>
                        <button onClick={() => handleApprove(user.id, user.role)} style={{ background: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Approve</button>
                        <button onClick={() => handleReject(user.id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
