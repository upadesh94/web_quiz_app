// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, signUp } from '../services/authService';
import Loader from '../components/Loader';

const LoginPage = ({ setUser }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !name)) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError('');

    try {
      let user;
      if (isSignUp) {
        user = await signUp(email, password, role, name);
      } else {
        user = await login(email, password);
      }
      
      setUser(user);
      if (user.role === 'teacher') {
        navigate('/teacher');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message={isSignUp ? "Creating account..." : "Logging in..."} />;

  return (
    <div className="flex-center page-container" style={{ padding: '2rem 1rem' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '2.5rem' }}>
        <h1 className="text-center" style={{ marginBottom: '0.5rem' }}>EduQuiz</h1>
        <p className="text-center mb-2">
          {isSignUp ? "Create a new account" : "Welcome back! Please login."}
        </p>

        {error && (
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid var(--danger)', marginBottom: '1.5rem', borderRadius: '4px' }}>
            <p style={{ color: 'var(--danger)', margin: 0 }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleAuth}>
          {isSignUp && (
            <>
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Account Type</label>
                <select 
                  className="input-field" 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>
            </>
          )}

          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input 
              type="email" 
              className="input-field" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@school.com"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input 
              type="password" 
              className="input-field" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn btn-primary w-full mt-2" style={{ height: '56px', fontSize: '1.2rem' }}>
            {isSignUp ? "Sign Up" : "Login"}
          </button>
        </form>

        <div className="text-center mt-4">
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <span 
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              style={{ color: 'var(--accent-primary)', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {isSignUp ? "Login here" : "Sign up"}
            </span>
          </p>
          
          <button 
            type="button" 
            className="btn btn-outline mt-2" 
            style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
            onClick={async () => {
              setLoading(true);
              if (window.seedDemoUsers) {
                await window.seedDemoUsers();
                alert("Demo users (student@school.com and teacher@school.com) created! Password for both is 'password'");
              }
              setLoading(false);
            }}
          >
            Create Demo Accounts
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
