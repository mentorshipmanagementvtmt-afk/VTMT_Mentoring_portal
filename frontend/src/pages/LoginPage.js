import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api'; // Import the API instance

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Make the API call directly
      console.log('Attempting login with:', email);
      const response = await api.post('/users/login', { email, password });

      // 2. Check response
      console.log('Login success:', response.data);

      // 3. Update Context
      login(response.data);

      // 4. Navigate
      navigate('/dashboard');

    } catch (err) {
      console.error('Login Error:', err);

      let errorMessage = 'Failed to login.';
      if (err.response) {
        errorMessage = err.response.data?.message || `Server Error: ${err.response.status}`;
      } else if (err.request) {
        errorMessage = 'No response from server. Is the backend running?';
      } else {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-tertiary)'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 className="title" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Vel Tech</h1>
            <p className="text-muted">Mentoring Portal Login</p>
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              padding: '0.75rem',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              marginBottom: '1rem',
              border: '1px solid #fecaca'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', padding: '0.75rem' }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            &copy; {new Date().getFullYear()} Vel Tech Multi Tech
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;