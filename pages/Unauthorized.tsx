import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/auth.css';

const Unauthorized: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="auth-wrapper">
            <div className="auth-container" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚫</div>
                <h2>Access Denied</h2>
                <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                    You don't have permission to access this page.
                </p>
                <button onClick={() => navigate('/')}>
                    Go to Home
                </button>
            </div>
        </div>
    );
};

export default Unauthorized;
