// src/components/QuestionBox.js
import React from 'react';

const QuestionBox = ({ question, currentIndex, total, selectedOption, onOptionSelect }) => {
  return (
    <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
          Question {currentIndex + 1} of {total}
        </span>
      </div>

      <h2 style={{ fontSize: '1.4rem', marginBottom: '2rem', lineHeight: '1.4' }}>
        {question.text}
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {question.options.map((option, index) => {
          const isSelected = selectedOption === index;
          
          return (
            <button
              key={index}
              onClick={() => onOptionSelect(index)}
              style={{
                textAlign: 'left',
                padding: '1.2rem',
                fontSize: '1.1rem',
                background: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                border: isSelected ? '2px solid var(--accent-primary)' : '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '12px',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                minHeight: 'var(--touch-target)' // Important for touch
              }}
            >
              <span style={{ 
                display: 'inline-block', 
                width: '30px', 
                height: '30px', 
                lineHeight: '30px',
                textAlign: 'center',
                background: isSelected ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                marginRight: '1rem',
                fontWeight: 'bold'
              }}>
                {String.fromCharCode(65 + index)}
              </span>
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionBox;
