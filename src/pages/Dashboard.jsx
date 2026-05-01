// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import QuizCard from '../components/QuizCard';
import Loader from '../components/Loader';
import { getQuizzes, getUserResults } from '../services/quizService';
import { getPerformanceSummary, getRecommendations } from '../services/analyticsService';

const Dashboard = ({ user }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [performance, setPerformance] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [fetchedQuizzes, fetchedResults] = await Promise.all([
          getQuizzes(),
          getUserResults(user.id)
        ]);

        setQuizzes(fetchedQuizzes);
        setResults(fetchedResults);

        const summary = getPerformanceSummary(fetchedResults);
        setPerformance(summary);

        if (summary && summary.weakTopics.length > 0) {
          setRecommendations(getRecommendations(summary.weakTopics, fetchedQuizzes));
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user.id]);

  if (loading) return <Loader message="Loading Dashboard..." />;

  const recommendedIds = recommendations.map(r => r.id);
  const filteredQuizzes = quizzes.filter(q => 
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    q.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-container" style={{ paddingBottom: '2rem' }}>
      <Navbar user={user} />
      
      <div className="dashboard-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Performance Summary Section */}
        {performance && performance.totalQuizzes > 0 && (
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))' }}>
            <h2>Your Performance</h2>
            <div className="grid-cols-2" style={{ marginTop: '1rem' }}>
              <div>
                <p>Accuracy</p>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: performance.accuracy > 70 ? 'var(--success)' : 'var(--warning)' }}>
                  {performance.accuracy}%
                </div>
              </div>
              <div>
                <p>Quizzes Taken</p>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                  {performance.totalQuizzes}
                </div>
              </div>
            </div>
            {performance.weakTopics.length > 0 && (
              <div className="mt-2">
                <p style={{ color: 'var(--danger)', fontWeight: 600 }}>Needs Improvement: {performance.weakTopics.join(', ')}</p>
              </div>
            )}
          </div>
        )}

        {/* Quizzes Section */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              Available Quizzes
            </h2>
            <input 
              type="text" 
              placeholder="Search by title or subject..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '0.8rem 1rem',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(0,0,0,0.2)',
                color: 'var(--text-primary)',
                minWidth: '250px'
              }}
            />
          </div>
          
          <div className="grid-cols-2" style={{ marginTop: '1.5rem' }}>
            {filteredQuizzes.length > 0 ? (
              filteredQuizzes.map(quiz => (
                <QuizCard 
                  key={quiz.id} 
                  quiz={quiz} 
                  isRecommended={recommendedIds.includes(quiz.id)} 
                />
              ))
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>No quizzes found matching "{searchQuery}"</p>
            )}
          </div>
        </div>

        {/* Previous Results Section (Optional/Simple) */}
        {results.length > 0 && (
          <div>
            <h2>Recent Results</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {results.slice(-3).reverse().map(result => {
                const quiz = quizzes.find(q => q.id === result.quizId);
                const pct = Math.round((result.score / result.total) * 100);
                return (
                  <div key={result.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem' }}>
                    <div>
                      <h4 style={{ margin: 0 }}>{quiz ? quiz.title : 'Unknown Quiz'}</h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(result.date).toLocaleDateString()}</span>
                    </div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: pct >= 60 ? 'var(--success)' : 'var(--warning)' }}>
                      {pct}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
