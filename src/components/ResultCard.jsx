// src/components/ResultCard.js
import React from 'react';

const ResultCard = ({ result, totalQuestions }) => {
  const percentage = Math.round((result.score / totalQuestions) * 100);
  
  let color = 'var(--success)';
  if (percentage < 40) color = 'var(--danger)';
  else if (percentage < 75) color = 'var(--warning)';

  return (
    <div className="card text-center" style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem 2rem' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Quiz Completed!</h2>
      
      <div style={{
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        background: `conic-gradient(${color} ${percentage}%, rgba(255,255,255,0.1) 0)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '2rem auto',
        boxShadow: '0 0 20px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'var(--bg-card)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ fontSize: '2rem', fontWeight: 'bold', color }}>{percentage}%</span>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Score</span>
        </div>
      </div>

      <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
        You scored <strong style={{ color }}>{result.score}</strong> out of {totalQuestions}
      </p>

      {result.topicAnalysis && (
        <div style={{ textAlign: 'left', marginTop: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Topic Breakdown:</h3>
          {Object.entries(result.topicAnalysis).map(([topic, data]) => {
            const topicPercent = Math.round((data.correct / data.total) * 100);
            return (
              <div key={topic} style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span>{topic}</span>
                  <span>{topicPercent}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                  <div style={{ 
                    width: `${topicPercent}%`, 
                    height: '100%', 
                    background: topicPercent >= 60 ? 'var(--success)' : 'var(--danger)',
                    borderRadius: '4px'
                  }}></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ResultCard;
