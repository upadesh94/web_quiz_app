// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import AppRoutes from './routes';
import { getCurrentUser } from './services/authService';
import Loader from './components/Loader';
import BottomNav from './components/BottomNav';

const AppContent = ({ user, setUser }) => {
  const location = useLocation();
  const isQuizPage = location.pathname.includes('/quiz/');

  return (
    <>
      <div className="app-container" style={{ paddingBottom: (user && !isQuizPage) ? '70px' : '0' }}>
        <AppRoutes user={user} setUser={setUser} />
      </div>
      {(user && !isQuizPage) && <BottomNav user={user} />}
    </>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = () => {
      const sessionUser = getCurrentUser();
      if (sessionUser) {
        setUser(sessionUser);
      }
      setLoading(false);
    };
    
    checkSession();
  }, []);

  if (loading) {
    return (
      <div className="app-container" style={{ justifyContent: 'center' }}>
        <Loader message="Initializing EduQuiz..." />
      </div>
    );
  }

  return (
    <Router>
      <AppContent user={user} setUser={setUser} />
    </Router>
  );
}

export default App;
