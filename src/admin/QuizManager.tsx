import React, { useState, useEffect } from 'react';
import type { Quiz, Question, Answer } from '../types/course';
import { quizAPI } from '../services/api';
import '../styles/QuizManager.css';

interface QuizManagerProps {
  courseId: string;
}

const QuizManager: React.FC<QuizManagerProps> = ({ courseId }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [showRewardsForm, setShowRewardsForm] = useState(false);
  
  // Quiz form state
  const [quizTitle, setQuizTitle] = useState('');
  
  // Question form state
  const [questionText, setQuestionText] = useState('');
  const [answers, setAnswers] = useState<Answer[]>([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false }
  ]);
  
  // Rewards form state
  const [correctPoints, setCorrectPoints] = useState(10);
  const [wrongPoints, setWrongPoints] = useState(0);
  const [completionPoints, setCompletionPoints] = useState(50);

  useEffect(() => {
    fetchQuizzes();
  }, [courseId]);

  const fetchQuizzes = async () => {
    try {
      const response = await quizAPI.getCourseQuizzes(courseId);
      setQuizzes(response.data);
    } catch (err: any) {
      console.error('Error fetching quizzes:', err);
    }
  };

  const handleCreateQuiz = async () => {
    if (!quizTitle.trim()) {
      alert('Please enter a quiz title');
      return;
    }

    try {
      await quizAPI.createQuiz(courseId, { title: quizTitle });
      setQuizTitle('');
      setShowQuizForm(false);
      await fetchQuizzes();
    } catch (err: any) {
      alert(err.message || 'Failed to create quiz');
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;

    try {
      await quizAPI.deleteQuiz(quizId);
      if (selectedQuiz?._id === quizId) {
        setSelectedQuiz(null);
      }
      await fetchQuizzes();
    } catch (err: any) {
      alert(err.message || 'Failed to delete quiz');
    }
  };

  const handleSelectQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setSelectedQuestion(null);
    setShowQuestionForm(false);
    setShowRewardsForm(false);
    
    // Set rewards
    setCorrectPoints(quiz.rewards.correctPoints);
    setWrongPoints(quiz.rewards.wrongPoints);
    setCompletionPoints(quiz.rewards.completionPoints);
  };

  const handleAddAnswer = () => {
    setAnswers([...answers, { text: '', isCorrect: false }]);
  };

  const handleRemoveAnswer = (index: number) => {
    if (answers.length <= 2) {
      alert('At least 2 answers are required');
      return;
    }
    setAnswers(answers.filter((_, i) => i !== index));
  };

  const handleAnswerChange = (index: number, field: 'text' | 'isCorrect', value: string | boolean) => {
    const newAnswers = [...answers];
    if (field === 'text') {
      newAnswers[index].text = value as string;
    } else {
      newAnswers[index].isCorrect = value as boolean;
    }
    setAnswers(newAnswers);
  };

  const handleSaveQuestion = async () => {
    if (!selectedQuiz) return;

    if (!questionText.trim()) {
      alert('Please enter a question');
      return;
    }

    const validAnswers = answers.filter(a => a.text.trim());
    if (validAnswers.length < 2) {
      alert('At least 2 answers are required');
      return;
    }

    const hasCorrect = validAnswers.some(a => a.isCorrect);
    if (!hasCorrect) {
      alert('At least one correct answer is required');
      return;
    }

    try {
      if (selectedQuestion) {
        // Update existing question
        await quizAPI.updateQuestion(selectedQuiz._id, selectedQuestion._id!, {
          questionText,
          options: validAnswers
        });
      } else {
        // Add new question
        await quizAPI.addQuestion(selectedQuiz._id, {
          questionText,
          options: validAnswers
        });
      }

      // Refresh quiz data
      const response = await quizAPI.getQuiz(selectedQuiz._id);
      setSelectedQuiz(response.data);
      
      // Update quiz in list
      setQuizzes(quizzes.map(q => q._id === response.data._id ? response.data : q));
      
      // Reset form
      setQuestionText('');
      setAnswers([{ text: '', isCorrect: false }, { text: '', isCorrect: false }]);
      setSelectedQuestion(null);
      setShowQuestionForm(false);
    } catch (err: any) {
      alert(err.message || 'Failed to save question');
    }
  };

  const handleEditQuestion = (question: Question) => {
    setSelectedQuestion(question);
    setQuestionText(question.questionText);
    setAnswers(question.options.map(opt => ({ ...opt })));
    setShowQuestionForm(true);
    setShowRewardsForm(false);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!selectedQuiz || !confirm('Are you sure you want to delete this question?')) return;

    try {
      await quizAPI.deleteQuestion(selectedQuiz._id, questionId);
      
      // Refresh quiz data
      const response = await quizAPI.getQuiz(selectedQuiz._id);
      setSelectedQuiz(response.data);
      setQuizzes(quizzes.map(q => q._id === response.data._id ? response.data : q));
      
      if (selectedQuestion?._id === questionId) {
        setSelectedQuestion(null);
        setShowQuestionForm(false);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete question');
    }
  };

  const handleSaveRewards = async () => {
    if (!selectedQuiz) return;

    try {
      await quizAPI.updateRewards(selectedQuiz._id, {
        correctPoints,
        wrongPoints,
        completionPoints
      });

      const response = await quizAPI.getQuiz(selectedQuiz._id);
      setSelectedQuiz(response.data);
      setQuizzes(quizzes.map(q => q._id === response.data._id ? response.data : q));
      
      alert('Rewards updated successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to update rewards');
    }
  };

  if (!selectedQuiz) {
    return (
      <div className="quiz-manager">
        <div className="quiz-list-header">
          <h3>Quizzes ({quizzes.length})</h3>
          <button
            className="add-quiz-btn"
            onClick={() => setShowQuizForm(!showQuizForm)}
          >
            + Add Quiz
          </button>
        </div>

        {showQuizForm && (
          <div className="quiz-form">
            <input
              type="text"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              placeholder="Enter quiz title"
              className="quiz-title-input"
            />
            <div className="form-actions">
              <button className="btn-primary" onClick={handleCreateQuiz}>
                Create Quiz
              </button>
              <button className="btn-secondary" onClick={() => setShowQuizForm(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="quiz-list">
          {quizzes.length === 0 ? (
            <div className="no-quizzes">
              <p>No quizzes yet. Click "Add Quiz" to create one.</p>
            </div>
          ) : (
            quizzes.map((quiz) => (
              <div key={quiz._id} className="quiz-item">
                <div className="quiz-info" onClick={() => handleSelectQuiz(quiz)}>
                  <h4>{quiz.title}</h4>
                  <span className="quiz-questions-count">
                    {quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="quiz-actions">
                  <button
                    className="action-icon edit"
                    onClick={() => handleSelectQuiz(quiz)}
                    title="Edit"
                  >
                    ✎
                  </button>
                  <button
                    className="action-icon delete"
                    onClick={() => handleDeleteQuiz(quiz._id)}
                    title="Delete"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-editor">
      <div className="quiz-editor-header">
        <button className="back-btn" onClick={() => setSelectedQuiz(null)}>
          ← Back to Quizzes
        </button>
        <h3>{selectedQuiz.title}</h3>
      </div>

      <div className="quiz-editor-content">
        <div className="questions-sidebar">
          <div className="sidebar-header">
            <h4>Questions ({selectedQuiz.questions.length})</h4>
            <button
              className="add-question-btn"
              onClick={() => {
                setShowQuestionForm(true);
                setShowRewardsForm(false);
                setSelectedQuestion(null);
                setQuestionText('');
                setAnswers([{ text: '', isCorrect: false }, { text: '', isCorrect: false }]);
              }}
            >
              + Add
            </button>
          </div>

          <div className="questions-list">
            {selectedQuiz.questions.map((question, index) => (
              <div
                key={question._id}
                className={`question-item ${selectedQuestion?._id === question._id ? 'active' : ''}`}
                onClick={() => handleEditQuestion(question)}
              >
                <span>Question {index + 1}</span>
                <button
                  className="delete-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteQuestion(question._id!);
                  }}
                  title="Delete"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <button
            className="rewards-btn"
            onClick={() => {
              setShowRewardsForm(true);
              setShowQuestionForm(false);
              setSelectedQuestion(null);
            }}
          >
            ⚙️ Configure Rewards
          </button>
        </div>

        <div className="question-editor">
          {showQuestionForm ? (
            <div className="question-form">
              <h4>{selectedQuestion ? 'Edit Question' : 'Add New Question'}</h4>
              
              <div className="form-group">
                <label>Question Text</label>
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Enter your question here..."
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Answers</label>
                <div className="answers-list">
                  {answers.map((answer, index) => (
                    <div key={index} className="answer-item">
                      <input
                        type="checkbox"
                        checked={answer.isCorrect}
                        onChange={(e) => handleAnswerChange(index, 'isCorrect', e.target.checked)}
                        title="Mark as correct"
                      />
                      <input
                        type="text"
                        value={answer.text}
                        onChange={(e) => handleAnswerChange(index, 'text', e.target.value)}
                        placeholder={`Answer ${index + 1}`}
                      />
                      {answers.length > 2 && (
                        <button
                          className="remove-answer"
                          onClick={() => handleRemoveAnswer(index)}
                          title="Remove answer"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button className="add-answer-btn" onClick={handleAddAnswer}>
                  + Add Answer
                </button>
              </div>

              <div className="form-actions">
                <button className="btn-primary" onClick={handleSaveQuestion}>
                  Save Question
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setShowQuestionForm(false);
                    setSelectedQuestion(null);
                    setQuestionText('');
                    setAnswers([{ text: '', isCorrect: false }, { text: '', isCorrect: false }]);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : showRewardsForm ? (
            <div className="rewards-form">
              <h4>Configure Rewards</h4>
              
              <div className="form-group">
                <label>Points for Correct Answer</label>
                <input
                  type="number"
                  value={correctPoints}
                  onChange={(e) => setCorrectPoints(parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Points for Wrong Answer</label>
                <input
                  type="number"
                  value={wrongPoints}
                  onChange={(e) => setWrongPoints(parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="form-group">
                <label>Quiz Completion Points</label>
                <input
                  type="number"
                  value={completionPoints}
                  onChange={(e) => setCompletionPoints(parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>

              <button className="btn-primary" onClick={handleSaveRewards}>
                Save Rewards
              </button>
            </div>
          ) : (
            <div className="empty-state">
              <p>Select a question to edit or click "Add" to create a new question</p>
              <p>Configure rewards to set points for this quiz</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizManager;
