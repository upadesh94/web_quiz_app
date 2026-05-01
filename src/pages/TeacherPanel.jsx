// src/pages/TeacherPanel.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { addQuiz } from '../services/quizService';
import { getStudents, updateStudentStatus, updateStudentDetails, createStudentAccount } from '../services/authService';

const TeacherPanel = ({ user }) => {
  const [activeTab, setActiveTab] = useState('quiz'); // 'quiz' or 'students'

  // --- Quiz Builder State ---
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [classLevel, setClassLevel] = useState(8);
  const [questions, setQuestions] = useState([
    { text: '', options: ['', '', '', ''], correctIndex: 0 }
  ]);
  const [quizSuccess, setQuizSuccess] = useState(false);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  // --- Student Management State ---
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentSuccess, setStudentSuccess] = useState('');
  const [studentError, setStudentError] = useState('');
  
  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  
  // Add Student state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentPassword, setNewStudentPassword] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [addingStudent, setAddingStudent] = useState(false);

  // Fetch students
  const fetchStudents = async () => {
    setLoadingStudents(true);
    const data = await getStudents();
    setStudents(data);
    setLoadingStudents(false);
  };

  useEffect(() => {
    if (activeTab === 'students') {
      fetchStudents();
    }
  }, [activeTab]);

  // --- Quiz Handlers ---
  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[optIndex] = value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, { text: '', options: ['', '', '', ''], correctIndex: 0 }]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    if (!title || !subject || questions.length === 0) return;
    
    const isValid = questions.every(q => q.text && q.options.every(o => o.trim() !== ''));
    if (!isValid) {
      alert("Please fill in all question texts and options.");
      return;
    }

    setSubmittingQuiz(true);
    const formattedQuestions = questions.map((q, i) => ({
      id: `t_q${i}`,
      text: q.text,
      options: q.options,
      correctIndex: parseInt(q.correctIndex)
    }));

    const newQuiz = {
      title,
      subject,
      topic: subject, 
      classLevel: parseInt(classLevel),
      duration: questions.length * 60, 
      questions: formattedQuestions
    };

    await addQuiz(newQuiz);
    setQuizSuccess(true);
    setTitle('');
    setSubject('');
    setClassLevel(8);
    setQuestions([{ text: '', options: ['', '', '', ''], correctIndex: 0 }]);
    setSubmittingQuiz(false);
    
    setTimeout(() => setQuizSuccess(false), 3000);
  };

  // --- Student Management Handlers ---
  const handleStatusChange = async (studentId, newStatus) => {
    try {
      await updateStudentStatus(studentId, newStatus);
      setStudents(students.map(s => s.id === studentId ? { ...s, status: newStatus } : s));
      setStudentSuccess(`Student marked as ${newStatus}`);
      setTimeout(() => setStudentSuccess(''), 3000);
    } catch (err) {
      setStudentError(err.message);
      setTimeout(() => setStudentError(''), 3000);
    }
  };

  const saveEdit = async (studentId) => {
    try {
      if (!editName) return;
      await updateStudentDetails(studentId, { name: editName });
      setStudents(students.map(s => s.id === studentId ? { ...s, name: editName } : s));
      setEditingId(null);
      setStudentSuccess("Student details updated");
      setTimeout(() => setStudentSuccess(''), 3000);
    } catch (err) {
      setStudentError(err.message);
      setTimeout(() => setStudentError(''), 3000);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newStudentEmail || !newStudentPassword || !newStudentName) return;
    
    setAddingStudent(true);
    setStudentError('');
    try {
      await createStudentAccount(newStudentEmail, newStudentPassword, newStudentName);
      setStudentSuccess('Student account created successfully!');
      setNewStudentEmail('');
      setNewStudentPassword('');
      setNewStudentName('');
      setShowAddForm(false);
      await fetchStudents();
      setTimeout(() => setStudentSuccess(''), 3000);
    } catch (err) {
      setStudentError(err.message);
      setTimeout(() => setStudentError(''), 5000);
    } finally {
      setAddingStudent(false);
    }
  };

  // --- Render Helpers ---
  const renderQuizBuilder = () => (
    <div className="card" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <h2>Quiz Builder</h2>
      <p className="mb-2">Create a dynamic quiz with custom questions.</p>

      {quizSuccess && (
        <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid var(--success)', marginBottom: '1.5rem', borderRadius: '4px' }}>
          <p style={{ color: 'var(--success)', margin: 0 }}>Quiz created and published successfully!</p>
        </div>
      )}

      <form onSubmit={handleQuizSubmit}>
        <div className="grid-cols-2" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="input-group">
            <label className="input-label">Quiz Title</label>
            <input type="text" className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. World History Midterm" required />
          </div>
          <div className="input-group">
            <label className="input-label">Subject</label>
            <input type="text" className="input-field" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. History" required />
          </div>
        </div>

        <div className="input-group" style={{ marginBottom: '2rem' }}>
          <label className="input-label">Class Level</label>
          <select className="input-field" value={classLevel} onChange={(e) => setClassLevel(e.target.value)}>
            <option value="8">Class 8</option>
            <option value="9">Class 9</option>
            <option value="10">Class 10</option>
          </select>
        </div>

        <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
          Questions ({questions.length})
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {questions.map((q, qIndex) => (
            <div key={qIndex} style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0 }}>Question {qIndex + 1}</h4>
                {questions.length > 1 && (
                  <button type="button" className="btn btn-danger" onClick={() => removeQuestion(qIndex)} style={{ padding: '0.2rem 0.8rem', fontSize: '0.8rem', minHeight: 'auto' }}>
                    Remove
                  </button>
                )}
              </div>

              <div className="input-group">
                <input type="text" className="input-field" value={q.text} onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)} placeholder="Enter question text here..." required />
              </div>

              <div className="grid-cols-2" style={{ gap: '1rem', marginTop: '1rem' }}>
                {q.options.map((opt, optIndex) => (
                  <div key={optIndex} className="input-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Option {optIndex + 1}</label>
                    <input type="text" className="input-field" value={opt} onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)} placeholder={`Option ${optIndex + 1}`} required />
                  </div>
                ))}
              </div>

              <div className="input-group" style={{ marginTop: '1rem', maxWidth: '300px' }}>
                <label className="input-label" style={{ color: 'var(--accent-primary)' }}>Correct Answer</label>
                <select className="input-field" value={q.correctIndex} onChange={(e) => handleQuestionChange(qIndex, 'correctIndex', e.target.value)} style={{ borderColor: 'var(--accent-primary)' }}>
                  {q.options.map((_, i) => <option key={i} value={i}>Option {i + 1}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>

        <button type="button" className="btn btn-outline w-full" onClick={addQuestion} style={{ marginTop: '1.5rem', borderStyle: 'dashed' }}>
          + Add Another Question
        </button>

        <button type="submit" className="btn btn-primary w-full" style={{ height: '60px', marginTop: '2rem', fontSize: '1.1rem' }} disabled={submittingQuiz}>
          {submittingQuiz ? 'Publishing...' : 'Publish Full Quiz'}
        </button>
      </form>
    </div>
  );

  const renderStudentManagement = () => (
    <div className="card" style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>Student Management</h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Approve and manage student accounts.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : '+ Add New Student'}
        </button>
      </div>

      {studentSuccess && (
        <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid var(--success)', marginBottom: '1.5rem', borderRadius: '4px' }}>
          <p style={{ color: 'var(--success)', margin: 0 }}>{studentSuccess}</p>
        </div>
      )}

      {studentError && (
        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid var(--danger)', marginBottom: '1.5rem', borderRadius: '4px' }}>
          <p style={{ color: 'var(--danger)', margin: 0 }}>{studentError}</p>
        </div>
      )}

      {showAddForm && (
        <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '2rem', border: '1px solid var(--accent-primary)' }}>
          <h3 style={{ marginTop: 0 }}>Provision New Account</h3>
          <form onSubmit={handleAddStudent} className="grid-cols-2" style={{ gap: '1rem', alignItems: 'end' }}>
            <div className="input-group" style={{ margin: 0 }}>
              <label className="input-label">Full Name</label>
              <input type="text" className="input-field" value={newStudentName} onChange={e => setNewStudentName(e.target.value)} required />
            </div>
            <div className="input-group" style={{ margin: 0 }}>
              <label className="input-label">Email</label>
              <input type="email" className="input-field" value={newStudentEmail} onChange={e => setNewStudentEmail(e.target.value)} required />
            </div>
            <div className="input-group" style={{ margin: 0 }}>
              <label className="input-label">Temporary Password</label>
              <input type="text" className="input-field" value={newStudentPassword} onChange={e => setNewStudentPassword(e.target.value)} required minLength={6} />
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={addingStudent}>
              {addingStudent ? 'Creating...' : 'Create Account'}
            </button>
          </form>
        </div>
      )}

      {loadingStudents ? (
        <p className="text-center" style={{ padding: '2rem' }}>Loading students...</p>
      ) : students.length === 0 ? (
        <p className="text-center" style={{ padding: '2rem', color: 'var(--text-secondary)' }}>No students found.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '1rem' }}>Name</th>
                <th style={{ padding: '1rem' }}>Email</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem' }}>
                    {editingId === s.id ? (
                      <input type="text" className="input-field" value={editName} onChange={e => setEditName(e.target.value)} style={{ padding: '0.4rem' }} autoFocus />
                    ) : (
                      <span style={{ fontWeight: 600 }}>{s.name}</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{s.email}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.3rem 0.6rem', 
                      borderRadius: '20px', 
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      background: s.status === 'pending' ? 'rgba(245, 158, 11, 0.2)' : s.status === 'suspended' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                      color: s.status === 'pending' ? 'var(--warning)' : s.status === 'suspended' ? 'var(--danger)' : 'var(--success)'
                    }}>
                      {s.status ? s.status.toUpperCase() : 'APPROVED'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    {editingId === s.id ? (
                      <>
                        <button className="btn btn-primary" onClick={() => saveEdit(s.id)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', minHeight: 'auto' }}>Save</button>
                        <button className="btn btn-outline" onClick={() => setEditingId(null)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', minHeight: 'auto' }}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button className="btn btn-outline" onClick={() => { setEditingId(s.id); setEditName(s.name); }} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', minHeight: 'auto' }}>Edit</button>
                        
                        {(!s.status || s.status === 'pending' || s.status === 'suspended') && (
                          <button className="btn btn-primary" onClick={() => handleStatusChange(s.id, 'approved')} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', minHeight: 'auto', background: 'var(--success)' }}>Approve</button>
                        )}
                        
                        {(!s.status || s.status === 'approved') && (
                          <button className="btn btn-danger" onClick={() => handleStatusChange(s.id, 'suspended')} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', minHeight: 'auto' }}>Suspend</button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="page-container" style={{ paddingBottom: '3rem' }}>
      <Navbar user={user} />
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          className={`btn ${activeTab === 'quiz' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('quiz')}
          style={{ width: '200px' }}
        >
          Quiz Builder
        </button>
        <button 
          className={`btn ${activeTab === 'students' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('students')}
          style={{ width: '200px' }}
        >
          Student Management
        </button>
      </div>

      {activeTab === 'quiz' ? renderQuizBuilder() : renderStudentManagement()}
      
    </div>
  );
};

export default TeacherPanel;
