// src/components/QuizCard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const QuizCard = ({ quiz, isRecommended }) => {
  const navigate = useNavigate();

  return (
    <div className="card" style={{ 
      position: 'relative',
      borderLeft: isRecommended ? '4px solid var(--warning)' : 'var(--glass-border)'
    }}>
      {isRecommended && (
        <span style={{
          position: 'absolute',
          top: '-10px',
          right: '15px',
          background: 'var(--warning)',
          color: '#fff',
          padding: '2px 10px',
          borderRadius: '10px',
          fontSize: '0.8rem',
          fontWeight: 'bold',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
        }}>
          Recommended
        </span>
      )}
      
      <h3 style={{ marginBottom: '0.5rem' }}>{quiz.title}</h3>
      <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
        Subject: {quiz.subject} | Class: {quiz.classLevel}
      </p>
      
      <div className="flex-center" style={{ justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          ⏱️ {quiz.duration / 60} mins | {quiz.questions.length} Qs
        </span>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate(`/quiz/${quiz.id}`)}
          style={{ minHeight: '40px', padding: '0 1rem', fontSize: '1rem' }}
        >
          Start
        </button>
      </div>
    </div>
  );
};

export default QuizCard;
