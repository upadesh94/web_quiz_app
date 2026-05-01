// src/pages/ResultPage.js
import React from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import ResultCard from '../components/ResultCard';

const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // If no state, redirect to dashboard
  if (!location.state || !location.state.result) {
    return <Navigate to="/dashboard" />;
  }

  const { result, totalQuestions, quizTitle, questions, answers } = location.state;

  return (
    <div className="page-container flex-center" style={{ padding: '2rem 1rem', display: 'block' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <h1 className="text-center" style={{ marginBottom: '2rem' }}>{quizTitle}</h1>
        
        <ResultCard result={result} totalQuestions={totalQuestions} />

        {questions && answers && (
          <div className="card" style={{ marginTop: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>Review Answers</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {questions.map((q, index) => {
                const userAnswer = answers[index];
                const isCorrect = userAnswer === q.correctIndex;
                const missed = userAnswer === undefined || userAnswer === null;

                return (
                  <div key={q.id || index} style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '1rem', display: 'flex', gap: '10px' }}>
                      <span>{index + 1}.</span> 
                      <span>{q.text}</span>
                    </p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '1.5rem' }}>
                      {q.options.map((opt, optIdx) => {
                        let bgColor = 'rgba(255,255,255,0.05)';
                        let borderColor = 'rgba(255,255,255,0.1)';
                        
                        if (optIdx === q.correctIndex) {
                          bgColor = 'rgba(16, 185, 129, 0.2)'; // success
                          borderColor = 'var(--success)';
                        } else if (optIdx === userAnswer && !isCorrect) {
                          bgColor = 'rgba(239, 68, 68, 0.2)'; // danger
                          borderColor = 'var(--danger)';
                        }

                        return (
                          <div key={optIdx} style={{
                            padding: '0.8rem 1rem',
                            borderRadius: '4px',
                            background: bgColor,
                            border: `1px solid ${borderColor}`,
                            display: 'flex',
                            justifyContent: 'space-between'
                          }}>
                            <span>{opt}</span>
                            {optIdx === q.correctIndex && <span style={{ color: 'var(--success)' }}>✓ Correct</span>}
                            {optIdx === userAnswer && !isCorrect && <span style={{ color: 'var(--danger)' }}>✗ Your Answer</span>}
                          </div>
                        );
                      })}
                    </div>
                    {missed && <p style={{ color: 'var(--warning)', marginTop: '1rem', paddingLeft: '1.5rem' }}>You skipped this question.</p>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        <div className="text-center" style={{ marginTop: '3rem', paddingBottom: '3rem' }}>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/dashboard')}
            style={{ padding: '0 2rem', height: '56px' }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
