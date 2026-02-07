import React, { useState, useEffect, useRef } from 'react';
import '../styles/QuizPrivacyMode.css';

interface Question {
  _id: string;
  questionText: string;
  options: Array<{ _id: string; text: string }>;
}

interface Quiz {
  _id: string;
  title: string;
  questions: Question[];
}

interface QuizPrivacyModeProps {
  quiz: Quiz;
  onSubmit: (answers: { [questionId: string]: string }) => void;
  onCancel: () => void;
  alreadyPassed?: boolean;
}

const QuizPrivacyMode: React.FC<QuizPrivacyModeProps> = ({
  quiz,
  onSubmit,
  onCancel,
  alreadyPassed = false,
}) => {
  const [showInstructions, setShowInstructions] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionId: string]: string }>({});
  const [focusLost, setFocusLost] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showInstructions) {
      // Enter fullscreen
      enterFullscreen();

      // Start timer
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Monitor visibility changes
      const handleVisibilityChange = () => {
        if (document.hidden) {
          setFocusLost((prev) => prev + 1);
          setShowWarning(true);
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      // Monitor fullscreen exit
      const handleFullscreenChange = () => {
        if (!document.fullscreenElement) {
          setShowWarning(true);
          setTimeout(() => enterFullscreen(), 500);
        }
      };

      document.addEventListener('fullscreenchange', handleFullscreenChange);

      return () => {
        clearInterval(timer);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        exitFullscreen();
      };
    }
  }, [showInstructions]);

  const enterFullscreen = () => {
    if (containerRef.current) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {
          console.log('Fullscreen not supported');
        });
      }
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  const handleStartQuiz = () => {
    setShowInstructions(false);
  };

  const handleSelectAnswer = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmitQuiz = () => {
    const confirmed = window.confirm(
      'Are you sure you want to submit? You cannot change your answers after submission.'
    );
    if (confirmed) {
      exitFullscreen();
      onSubmit(selectedAnswers);
    }
  };

  const handleAutoSubmit = () => {
    alert('Time is up! Your quiz will be automatically submitted.');
    exitFullscreen();
    onSubmit(selectedAnswers);
  };

  const handleExitQuiz = () => {
    const confirmed = window.confirm(
      'Are you sure you want to exit? Your progress will not be saved.'
    );
    if (confirmed) {
      exitFullscreen();
      onCancel();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const allQuestionsAnswered = Object.keys(selectedAnswers).length === quiz.questions.length;

  if (showInstructions) {
    return (
      <div className="qpm-overlay">
        <div className="qpm-instructions">
          <div className="qpm-inst-header">
            <div className="qpm-inst-badge">SECURE ASSESSMENT</div>
            <h2 className="qpm-inst-title">Privacy Mode Quiz</h2>
            <h3 className="qpm-inst-quiz-name">{quiz.title}</h3>
          </div>

          <div className="qpm-inst-content">
            <h4>Instructions & Rules:</h4>
            <ul>
              <li><span className="qpm-bullet">•</span> The quiz will open in <strong>fullscreen mode</strong></li>
              <li><span className="qpm-bullet">•</span> You have <strong>30 minutes</strong> to complete the quiz</li>
              <li><span className="qpm-bullet">•</span> <strong>Do not</strong> switch tabs or minimize the window</li>
              <li><span className="qpm-bullet">•</span> Exiting fullscreen will trigger a warning</li>
              <li><span className="qpm-bullet">•</span> You need <strong>{Math.ceil(quiz.questions.length / 2)}/{quiz.questions.length}</strong> correct answers to pass</li>
              <li><span className="qpm-bullet">•</span> Once submitted, answers cannot be changed</li>
              {alreadyPassed && (
                <li className="qpm-inst-passed"><span className="qpm-bullet">✓</span> You have already passed this quiz</li>
              )}
            </ul>

            <div className="qpm-inst-warning">
              <strong>Academic Integrity:</strong> This is a monitored environment.
              Any malpractice will be recorded and may result in disqualification.
            </div>
          </div>

          <div className="qpm-inst-actions">
            <button className="qpm-btn qpm-btn-cancel" onClick={onCancel}>
              Cancel
            </button>
            <button className="qpm-btn qpm-btn-start" onClick={handleStartQuiz}>
              I Understand - Start Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="qpm-quiz-container">
      {/* Warning Modal */}
      {showWarning && (
        <div className="qpm-warning-overlay">
          <div className="qpm-warning-box">
            <div className="qpm-warning-icon">!</div>
            <h3>Suspicious Activity Detected!</h3>
            <p>
              You have switched tabs or exited fullscreen mode.
              <br />
              <strong>This activity has been recorded.</strong>
            </p>
            <p className="qpm-warning-count">
              Violations: <strong>{focusLost}</strong>
            </p>
            <button
              className="qpm-btn qpm-btn-continue"
              onClick={() => setShowWarning(false)}
            >
              Continue Quiz
            </button>
          </div>
        </div>
      )}

      {/* Quiz Header */}
      <div className="qpm-header">
        <div className="qpm-header-left">
          <h2 className="qpm-title">{quiz.title}</h2>
          <div className="qpm-meta">
            <span>{quiz.questions.length} Questions</span>
            <span>•</span>
            <span>Pass: {Math.ceil(quiz.questions.length / 2)}/{quiz.questions.length}</span>
          </div>
        </div>
        <div className="qpm-header-right">
          <div className={`qpm-timer ${timeRemaining < 300 ? 'qpm-timer-warning' : ''}`}>
            Time: {formatTime(timeRemaining)}
          </div>
          <button className="qpm-exit-btn" onClick={handleExitQuiz}>
            Exit
          </button>
        </div>
      </div>

      {/* Questions */}
      <div className="qpm-questions">
        {quiz.questions.map((q, qIndex) => (
          <div key={q._id} className="qpm-question">
            <div className="qpm-q-number">Question {qIndex + 1}</div>
            <h3 className="qpm-q-text">{q.questionText}</h3>
            <div className="qpm-options">
              {q.options.map((opt) => (
                <label
                  key={opt._id}
                  className={`qpm-option ${
                    selectedAnswers[q._id] === opt._id ? 'qpm-option-selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name={`q-${q._id}`}
                    checked={selectedAnswers[q._id] === opt._id}
                    onChange={() => handleSelectAnswer(q._id, opt._id)}
                  />
                  <span className="qpm-option-radio"></span>
                  <span className="qpm-option-text">{opt.text}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Submit Section */}
      <div className="qpm-submit-section">
        <div className="qpm-progress">
          Answered: {Object.keys(selectedAnswers).length} / {quiz.questions.length}
        </div>
        <button
          className="qpm-btn qpm-btn-submit"
          onClick={handleSubmitQuiz}
          disabled={!allQuestionsAnswered}
        >
          Submit Quiz
        </button>
        {!allQuestionsAnswered && (
          <p className="qpm-hint">Please answer all questions before submitting</p>
        )}
      </div>
    </div>
  );
};

export default QuizPrivacyMode;
