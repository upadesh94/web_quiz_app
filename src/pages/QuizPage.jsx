// src/pages/QuizPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizById, saveQuizResult } from '../services/quizService';
import QuestionBox from '../components/QuestionBox';
import Loader from '../components/Loader';

const QuizPage = ({ user }) => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionIndex: selectedOptionIndex }
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      const data = await getQuizById(quizId);
      if (data) {
        setQuiz(data);
        setTimeLeft(data.duration);
      } else {
        navigate('/dashboard'); // Quiz not found
      }
      setLoading(false);
    };
    fetchQuiz();
  }, [quizId, navigate]);

  const handleSubmit = useCallback(async () => {
    if (submitting || !quiz) return;
    setSubmitting(true);

    let score = 0;
    const topicAnalysis = { [quiz.topic]: { correct: 0, total: quiz.questions.length } };

    quiz.questions.forEach((q, index) => {
      if (answers[index] === q.correctIndex) {
        score++;
        topicAnalysis[quiz.topic].correct++;
      }
    });

    const result = await saveQuizResult(user.id, quiz.id, score, quiz.questions.length, topicAnalysis);
    navigate('/result', { 
      state: { 
        result, 
        totalQuestions: quiz.questions.length, 
        quizTitle: quiz.title,
        answers,
        questions: quiz.questions
      } 
    });
  }, [answers, quiz, user.id, navigate, submitting]);

  useEffect(() => {
    if (!quiz || submitting) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz, submitting, handleSubmit]);

  const handleOptionSelect = (optionIndex) => {
    setAnswers(prev => ({ ...prev, [currentQuestionIndex]: optionIndex }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  if (loading) return <Loader message="Loading Quiz..." />;
  if (submitting) return <Loader message="Submitting Quiz..." />;
  if (!quiz) return null;

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  // Format time
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isTimeLow = timeLeft < 60;

  return (
    <div className="page-container" style={{ paddingBottom: '2rem' }}>
      {/* Top Bar with Timer */}
      <div className="card" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '1rem 1.5rem',
        marginBottom: '2rem',
        position: 'sticky',
        top: '1rem',
        zIndex: 10
      }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '60%' }}>
          {quiz.title}
        </h3>
        <div style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          color: isTimeLow ? 'var(--danger)' : 'var(--accent-primary)',
          animation: isTimeLow ? 'pulse 1s infinite' : 'none'
        }}>
          ⏱️ {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>

      {/* Question Area */}
      <div style={{ flex: 1 }}>
        <QuestionBox 
          question={currentQuestion}
          currentIndex={currentQuestionIndex}
          total={quiz.questions.length}
          selectedOption={answers[currentQuestionIndex]}
          onOptionSelect={handleOptionSelect}
        />
      </div>

      {/* Bottom Navigation */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginTop: '2rem',
        maxWidth: '800px',
        margin: '2rem auto 0 auto',
        width: '100%'
      }}>
        <button 
          className="btn btn-outline" 
          onClick={handlePrev} 
          disabled={currentQuestionIndex === 0}
          style={{ opacity: currentQuestionIndex === 0 ? 0.5 : 1, minWidth: '120px' }}
        >
          Previous
        </button>

        {isLastQuestion ? (
          <button 
            className="btn btn-success" 
            onClick={handleSubmit}
            style={{ minWidth: '120px' }}
          >
            Submit Quiz
          </button>
        ) : (
          <button 
            className="btn btn-primary" 
            onClick={handleNext}
            style={{ minWidth: '120px' }}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
