import React from 'react';

export default function PendingApproval({ setCurrentPage }) {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#6a0dad',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '48px',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '450px',
        width: '100%'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          backgroundColor: '#f59e0b',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          <span style={{ color: 'white', fontSize: '30px' }}>⏳</span>
        </div>
        <h2 style={{ color: '#1f2937', fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
          Account Pending Approval
        </h2>
        <p style={{ color: '#4b5563', fontSize: '16px', lineHeight: '1.5', marginBottom: '32px' }}>
          Your account is currently waiting for admin approval. 
          Please check back later or contact your administrator for more information.
        </p>
        <button
          onClick={() => window.location.href = '/'}
          style={{
            width: '100%',
            padding: '12px 24px',
            fontSize: '16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#6a0dad',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
