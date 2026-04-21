import React, { useEffect, useState } from 'react';

export default function OAuth2Callback({ setCurrentPage }) {
  const [showRoleSelect, setShowRoleSelect] = useState(false);
  const [pendingToken, setPendingToken] = useState(null);
  const [error, setError] = useState(null);

  // Step 1: Token URL එකෙන් ආවාම - directly JWT save කරලා /me ගන්නවා
  // (Backend already Google verify කරලා JWT issue කරලා)
  const handleJwtFromUrl = (jwt) => {
    localStorage.setItem('jwt', jwt);

    fetch('http://localhost:8082/api/auth/me', {
      headers: { 'Authorization': `Bearer ${jwt}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to get user');
        return res.json();
      })
      .then(user => {
        localStorage.setItem('user', JSON.stringify(user));

        const role = (user.role || user.Role || '').toUpperCase();
        const status = (user.status || user.Status || '').toUpperCase();

        if (status === 'PENDING') {
          setCurrentPage('pending');
        } else if (role === 'ADMIN') {
          setCurrentPage('admin');
        } else if (role === 'STUDENT') {
          setCurrentPage('student');
        } else if (role === 'LECTURER') {
          setCurrentPage('lecturer');
        } else if (role === 'TECHNICIAN') {
          setCurrentPage('technician');
        } else {
          // Role නැහැ නම් - නව user, role select කරන්න
          setPendingToken(jwt);
          setShowRoleSelect(true);
        }
      })
      .catch(() => {
        // /me endpoint fail - role select show කරනවා
        setPendingToken(jwt);
        setShowRoleSelect(true);
      });
  };

  // Step 2: Role select කරලා submit කරනවිට
  const handleRoleSubmit = (selectedRole) => {
    if (!pendingToken) return;

    fetch('http://localhost:8082/api/auth/google/role', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${pendingToken}`
      },
      body: JSON.stringify({ role: selectedRole })
    })
      .then(res => res.json())
      .then(data => {
        const jwt = data.token || data.jwt || pendingToken;
        const role = (data.user?.role || data.role || selectedRole).toUpperCase();
        const status = (data.user?.status || data.status || '').toUpperCase();

        localStorage.setItem('jwt', jwt);
        if (data.user) localStorage.setItem('user', JSON.stringify(data.user));

        if (status === 'PENDING') {
          alert('Registration successful! Please wait for admin approval. You will be notified via email.');
          setCurrentPage('home');
        } else if (role === 'STUDENT') {
          setCurrentPage('student');
        } else if (role === 'LECTURER') {
          setCurrentPage('lecturer');
        } else if (role === 'TECHNICIAN') {
          setCurrentPage('technician');
        } else {
          setCurrentPage('home');
        }
      })
      .catch(() => {
        // Fallback: /role endpoint නැතිනම් පහළ endpoint try කරනවා
        fetch('http://localhost:8082/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: pendingToken, role: selectedRole })
        })
          .then(res => res.json())
          .then(data => {
            const jwt = data.token || data.jwt;
            const role = (data.user?.role || data.role || '').toUpperCase();
            const status = (data.user?.status || data.status || '').toUpperCase();

            if (jwt) localStorage.setItem('jwt', jwt);
            if (data.user) localStorage.setItem('user', JSON.stringify(data.user));

            if (status === 'PENDING') {
              alert('Registration successful! Please wait for admin approval.');
              setCurrentPage('home');
            } else if (role === 'STUDENT') {
              setCurrentPage('student');
            } else if (role === 'LECTURER') {
              setCurrentPage('lecturer');
            } else if (role === 'TECHNICIAN') {
              setCurrentPage('technician');
            } else {
              setCurrentPage('home');
            }
          })
          .catch(() => {
            setError('Registration failed. Please try again.');
          });
      });
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const errorParam = urlParams.get('error');

    if (errorParam) {
      setError('Google login failed: ' + errorParam);
      setTimeout(() => setCurrentPage('signin'), 3000);
      return;
    }

    if (token) {
      // ✅ Backend JWT directly handle කරනවා - නැවත Google API call කරන්නේ නෑ
      handleJwtFromUrl(token);
    } else {
      setCurrentPage('signin');
    }
  }, []);

  // Role selection screen
  if (showRoleSelect) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#6a0dad',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '48px',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center'
        }}>
          <div style={{
            width: '60px', height: '60px',
            backgroundColor: '#6a0dad',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '24px' }}>SC</span>
          </div>

          <h2 style={{ color: '#1f2937', fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
            Select Your Role
          </h2>
          <p style={{ color: '#6b7280', fontSize: '15px', marginBottom: '32px' }}>
            Google account verified! Choose your campus role to continue.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Student */}
            <button
              onClick={() => handleRoleSubmit('STUDENT')}
              style={{
                padding: '16px 20px',
                borderRadius: '10px',
                border: '2px solid #e5e7eb',
                backgroundColor: 'white',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                transition: 'all 0.2s'
              }}
              onMouseOver={e => { e.currentTarget.style.borderColor = '#6a0dad'; e.currentTarget.style.backgroundColor = '#faf5ff'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.backgroundColor = 'white'; }}
            >
              <div style={{
                width: '44px', height: '44px', borderRadius: '10px',
                backgroundColor: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '22px', flexShrink: 0
              }}>🎓</div>
              <div>
                <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '15px' }}>Student</div>
                <div style={{ color: '#6b7280', fontSize: '13px', marginTop: '2px' }}>Instant access to campus facilities</div>
              </div>
              <div style={{
                marginLeft: 'auto', backgroundColor: '#dcfce7', color: '#15803d',
                fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px'
              }}>INSTANT</div>
            </button>

            {/* Lecturer */}
            <button
              onClick={() => handleRoleSubmit('LECTURER')}
              style={{
                padding: '16px 20px',
                borderRadius: '10px',
                border: '2px solid #e5e7eb',
                backgroundColor: 'white',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                transition: 'all 0.2s'
              }}
              onMouseOver={e => { e.currentTarget.style.borderColor = '#6a0dad'; e.currentTarget.style.backgroundColor = '#faf5ff'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.backgroundColor = 'white'; }}
            >
              <div style={{
                width: '44px', height: '44px', borderRadius: '10px',
                backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '22px', flexShrink: 0
              }}>👨‍🏫</div>
              <div>
                <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '15px' }}>Lecturer</div>
                <div style={{ color: '#6b7280', fontSize: '13px', marginTop: '2px' }}>Manage courses & facility bookings</div>
              </div>
              <div style={{
                marginLeft: 'auto', backgroundColor: '#fef9c3', color: '#854d0e',
                fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px'
              }}>APPROVAL</div>
            </button>

            {/* Technician */}
            <button
              onClick={() => handleRoleSubmit('TECHNICIAN')}
              style={{
                padding: '16px 20px',
                borderRadius: '10px',
                border: '2px solid #e5e7eb',
                backgroundColor: 'white',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                transition: 'all 0.2s'
              }}
              onMouseOver={e => { e.currentTarget.style.borderColor = '#6a0dad'; e.currentTarget.style.backgroundColor = '#faf5ff'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.backgroundColor = 'white'; }}
            >
              <div style={{
                width: '44px', height: '44px', borderRadius: '10px',
                backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '22px', flexShrink: 0
              }}>🔧</div>
              <div>
                <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '15px' }}>Technician</div>
                <div style={{ color: '#6b7280', fontSize: '13px', marginTop: '2px' }}>Handle maintenance & technical support</div>
              </div>
              <div style={{
                marginLeft: 'auto', backgroundColor: '#fef9c3', color: '#854d0e',
                fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px'
              }}>APPROVAL</div>
            </button>
          </div>

          <p style={{ color: '#9ca3af', fontSize: '12px', marginTop: '20px' }}>
            Lecturer & Technician accounts require admin approval before access is granted.
          </p>
        </div>
      </div>
    );
  }

  // Error screen
  if (error) {
    return (
      <div style={{
        minHeight: '100vh', backgroundColor: '#6a0dad',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontFamily: 'Arial, sans-serif', flexDirection: 'column', gap: '16px'
      }}>
        <div style={{ fontSize: '48px' }}>⚠️</div>
        <h2>{error}</h2>
        <p style={{ opacity: 0.8 }}>Redirecting to sign in...</p>
      </div>
    );
  }

  // Loading screen
  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#6a0dad',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontFamily: 'Arial, sans-serif', flexDirection: 'column', gap: '16px'
    }}>
      <div style={{
        width: '50px', height: '50px',
        border: '4px solid rgba(255,255,255,0.3)',
        borderTop: '4px solid white',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <h2 style={{ margin: 0 }}>Authenticating with Google...</h2>
      <p style={{ opacity: 0.7, margin: 0, fontSize: '14px' }}>Please wait</p>
    </div>
  );
}
