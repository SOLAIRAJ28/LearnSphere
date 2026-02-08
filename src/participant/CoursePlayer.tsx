import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contentAPI, courseAPI, participantAPI, quizAPI } from '../services/api';
import { getCurrentUser } from '../utils/auth';
import type { Content } from '../types/course';
import Certificate from './Certificate';
import QuizPrivacyMode from './QuizPrivacyMode';
import '../styles/CoursePlayer.css';
import '../styles/Certificate.css';

interface CourseInfo {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  lessonsCount: number;
  totalDuration: number;
}

const CoursePlayer: React.FC = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const userId = currentUser?._id || '';

  const [course, setCourse] = useState<CourseInfo | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedContents, setCompletedContents] = useState<string[]>([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Quiz state
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionId: string]: string }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0, passed: false });

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch course info and contents in parallel
      const [courseRes, contentsRes] = await Promise.all([
        courseAPI.getCourse(courseId!),
        contentAPI.getCourseContents(courseId!),
      ]);

      const courseData = courseRes.data || courseRes;
      const contentsData = contentsRes.data || contentsRes;

      setCourse(courseData);
      setContents(contentsData);

      // Auto-select first video content
      const firstVideo = contentsData.find(
        (c: Content) => c.category === 'video' && c.videoFileId
      );
      if (firstVideo) {
        setSelectedContent(firstVideo);
      } else if (contentsData.length > 0) {
        setSelectedContent(contentsData[0]);
      }

      // Fetch quizzes for this course
      try {
        const quizRes = await quizAPI.getCourseQuizzes(courseId!);
        const quizData = quizRes.data || quizRes || [];
        setQuizzes(quizData);
      } catch {
        // No quizzes
      }

      // Fetch enrollment progress
      if (userId) {
        try {
          await participantAPI.updateProgress(courseId!, userId, 'In Progress');
          const progressRes = await participantAPI.getProgress(courseId!, userId);
          const progressData = progressRes.data || progressRes;
          setCompletedContents(progressData.completedContents || []);
          setCompletionPercentage(progressData.completionPercentage || 0);
          setQuizCompleted(progressData.quizCompleted || false);
        } catch {
          // Ignore if progress fetch fails
        }
      }
    } catch (err: any) {
      console.error('Error loading course:', err);
      setError(err.message || 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const getContentUrl = (content: Content) => {
    if (content.videoFileId) {
      return `/api/video/${content.videoFileId}`;
    }
    const url = content.fileUrl || content.url || content.imageUrl || content.videoLink;
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) return url;
    return `/${url}`;
  };

  const getVideoUrl = (content: Content) => {
    if (content.videoFileId) {
      return `/api/video/${content.videoFileId}`;
    }
    if (content.videoLink) return content.videoLink;
    if (content.url) return content.url;
    return null;
  };

  const handleContentSelect = (content: Content) => {
    setSelectedContent(content);
    setShowQuiz(false);
    setQuizSubmitted(false);
    setSelectedAnswers({});
  };

  const handleStartQuiz = (quiz: any) => {
    setActiveQuiz(quiz);
    setShowQuiz(true);
    setSelectedContent(null);
    setQuizSubmitted(false);
    setSelectedAnswers({});
    setQuizScore({ correct: 0, total: 0, passed: false });
  };

  const handlePreviousContent = () => {
    if (showQuiz) {
      // If currently showing quiz, go back to the last content
      if (contents.length > 0) {
        const lastContent = contents[contents.length - 1];
        setSelectedContent(lastContent);
        setShowQuiz(false);
        setQuizSubmitted(false);
        setSelectedAnswers({});
      }
      return;
    }

    if (!selectedContent || contents.length === 0) return;
    
    const currentIndex = contents.findIndex(c => c._id === selectedContent._id);
    if (currentIndex > 0) {
      setSelectedContent(contents[currentIndex - 1]);
    }
  };

  const handleNextContent = () => {
    if (!selectedContent || contents.length === 0) return;
    
    const currentIndex = contents.findIndex(c => c._id === selectedContent._id);
    if (currentIndex < contents.length - 1) {
      setSelectedContent(contents[currentIndex + 1]);
      setShowQuiz(false);
      setQuizSubmitted(false);
      setSelectedAnswers({});
    } else if (quizzes.length > 0 && !quizCompleted) {
      // After last content, move to quiz if available
      handleStartQuiz(quizzes[0]);
    }
  };

  const getCurrentContentIndex = () => {
    if (showQuiz) return contents.length; // Quiz is after all contents
    if (!selectedContent) return -1;
    return contents.findIndex(c => c._id === selectedContent._id);
  };

  const canGoPrevious = () => {
    if (showQuiz && contents.length > 0) return true;
    const currentIndex = getCurrentContentIndex();
    return currentIndex > 0;
  };

  const canGoNext = () => {
    if (showQuiz) return false;
    const currentIndex = getCurrentContentIndex();
    return currentIndex < contents.length - 1 || (quizzes.length > 0 && !quizCompleted);
  };

  const handleQuizCancel = () => {
    setShowQuiz(false);
    setActiveQuiz(null);
    setSelectedAnswers({});
  };

  const handleQuizSubmit = async (answers: { [questionId: string]: string }) => {
    if (!activeQuiz || !courseId || !userId) return;

    setSelectedAnswers(answers);
    const questions = activeQuiz.questions || [];
    let correct = 0;

    questions.forEach((q: any) => {
      const selectedOptId = answers[q._id];
      if (selectedOptId) {
        const selectedOpt = q.options.find((o: any) => o._id === selectedOptId);
        if (selectedOpt?.isCorrect) correct++;
      }
    });

    const total = questions.length;
    const passed = correct >= Math.ceil(total / 2);

    setQuizScore({ correct, total, passed });
    setQuizSubmitted(true);
    setShowQuiz(false);

    // If passed and quiz not already completed, update progress
    if (passed && !quizCompleted) {
      try {
        const res = await participantAPI.completeQuiz(courseId, userId);
        const data = res.data || res;
        handleProgressUpdate(data);
      } catch (err) {
        console.error('Error completing quiz:', err);
      }
    }
  };

  const handleSelectAnswer = (questionId: string, optionId: string) => {
    if (quizSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz || !courseId || !userId) return;

    const questions = activeQuiz.questions || [];
    let correct = 0;

    questions.forEach((q: any) => {
      const selectedOptId = selectedAnswers[q._id];
      if (selectedOptId) {
        const selectedOpt = q.options.find((o: any) => o._id === selectedOptId);
        if (selectedOpt?.isCorrect) correct++;
      }
    });

    const total = questions.length;
    const passed = correct >= Math.ceil(total / 2); // Need at least half correct

    setQuizScore({ correct, total, passed });
    setQuizSubmitted(true);

    // If passed and quiz not already completed, update progress
    if (passed && !quizCompleted) {
      try {
        const res = await participantAPI.completeQuiz(courseId, userId);
        const data = res.data || res;
        handleProgressUpdate(data);
      } catch (err) {
        console.error('Error completing quiz:', err);
      }
    }
  };

  const handleRetakeQuiz = () => {
    setQuizSubmitted(false);
    setSelectedAnswers({});
    setQuizScore({ correct: 0, total: 0, passed: false });
    setShowQuiz(true);
  };

  const handleBack = () => {
    navigate('/participant');
  };

  // Process progress response and trigger congrats if 100%
  const handleProgressUpdate = (data: any) => {
    setCompletedContents(data.completedContents || []);
    const pct = data.completionPercentage || 0;
    const prevPct = completionPercentage;
    setCompletionPercentage(pct);
    setQuizCompleted(data.quizCompleted || false);

    // Show congratulations when reaching 100%
    if (pct >= 100 && prevPct < 100) {
      setShowCongrats(true);
    }
  };

  // Mark content as completed when video ends
  const handleVideoEnded = async () => {
    if (!selectedContent || !courseId || !userId) return;
    if (completedContents.includes(selectedContent._id)) return;

    try {
      const res = await participantAPI.markContentComplete(courseId, userId, selectedContent._id);
      const data = res.data || res;
      handleProgressUpdate(data);
    } catch (err) {
      console.error('Error marking content complete:', err);
    }
  };

  // Manually mark non-video content as completed
  const handleMarkComplete = async (contentId: string) => {
    if (!courseId || !userId) return;
    if (completedContents.includes(contentId)) return;

    try {
      const res = await participantAPI.markContentComplete(courseId, userId, contentId);
      const data = res.data || res;
      handleProgressUpdate(data);
    } catch (err) {
      console.error('Error marking content complete:', err);
    }
  };

  if (loading) {
    return (
      <div className="course-player-loading">
        <div className="cp-spinner"></div>
        <p>Loading course...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-player-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={handleBack}>← Back to Courses</button>
      </div>
    );
  }

  return (
    <div className="course-player">
      {/* Top Bar */}
      <div className="cp-topbar">
        <button className="cp-back-btn" onClick={handleBack}>
          ← Back
        </button>
        <h1 className="cp-course-title">{course?.title}</h1>
        <div className="cp-course-meta">
          <span>{contents.length} lessons</span>
          <span>•</span>
          <span>{completedContents.length}/{contents.length} completed</span>
          <span>•</span>
          <span className="cp-progress-text">{completionPercentage}%</span>
        </div>
        <div className="cp-progress-bar-container">
          <div className="cp-progress-bar" style={{ width: `${completionPercentage}%` }}></div>
        </div>
        <button
          className="cp-sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title={sidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
        >
          {sidebarOpen ? '☰' : '☰'}
        </button>
      </div>

      <div className="cp-main">
        {/* Video Player Area */}
        <div className="cp-player-area">
          {showQuiz && activeQuiz ? (
            /* ========= QUIZ VIEW ========= */
            <div className="cp-quiz-container">
              <div className="cp-quiz-header">
                <h2 className="cp-quiz-title">📝 {activeQuiz.title}</h2>
                <p className="cp-quiz-info">
                  {activeQuiz.questions?.length || 0} Questions • Pass: {Math.ceil((activeQuiz.questions?.length || 0) / 2)}/{activeQuiz.questions?.length || 0} correct
                </p>
                {quizCompleted && !quizSubmitted && (
                  <div className="cp-quiz-already-passed">✅ You have already passed this quiz</div>
                )}
              </div>

              {!quizSubmitted ? (
                /* Questions */
                <div className="cp-quiz-questions">
                  {(activeQuiz.questions || []).map((q: any, qIndex: number) => (
                    <div key={q._id} className="cp-quiz-question">
                      <div className="cp-quiz-q-number">Question {qIndex + 1}</div>
                      <h3 className="cp-quiz-q-text">{q.questionText}</h3>
                      <div className="cp-quiz-options">
                        {(q.options || []).map((opt: any) => (
                          <label
                            key={opt._id}
                            className={`cp-quiz-option ${selectedAnswers[q._id] === opt._id ? 'selected' : ''}`}
                          >
                            <input
                              type="radio"
                              name={`q-${q._id}`}
                              checked={selectedAnswers[q._id] === opt._id}
                              onChange={() => handleSelectAnswer(q._id, opt._id)}
                            />
                            <span className="cp-quiz-option-radio"></span>
                            <span className="cp-quiz-option-text">{opt.text}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="cp-quiz-submit-area">
                    <button
                      className="cp-quiz-submit-btn"
                      onClick={handleSubmitQuiz}
                      disabled={Object.keys(selectedAnswers).length < (activeQuiz.questions?.length || 0)}
                    >
                      Submit Quiz
                    </button>
                    {Object.keys(selectedAnswers).length < (activeQuiz.questions?.length || 0) && (
                      <p className="cp-quiz-hint">Answer all questions to submit</p>
                    )}
                  </div>
                </div>
              ) : (
                /* Results */
                <div className="cp-quiz-results">
                  <div className={`cp-quiz-result-card ${quizScore.passed ? 'passed' : 'failed'}`}>
                    <div className="cp-quiz-result-icon">{quizScore.passed ? '🎉' : '😞'}</div>
                    <h3 className="cp-quiz-result-title">
                      {quizScore.passed ? 'Congratulations! You Passed!' : 'Not Passed'}
                    </h3>
                    <div className="cp-quiz-result-score">
                      <span className="cp-quiz-score-number">{quizScore.correct}</span>
                      <span className="cp-quiz-score-divider">/</span>
                      <span className="cp-quiz-score-total">{quizScore.total}</span>
                    </div>
                    <p className="cp-quiz-result-text">
                      {quizScore.passed
                        ? `You got ${quizScore.correct} out of ${quizScore.total} correct. Well done!`
                        : `You need at least ${Math.ceil(quizScore.total / 2)} correct answers to pass. You got ${quizScore.correct}.`}
                    </p>

                    {/* Show correct/wrong per question */}
                    <div className="cp-quiz-review">
                      {(activeQuiz.questions || []).map((q: any, qIndex: number) => {
                        const selectedOptId = selectedAnswers[q._id];
                        const selectedOpt = q.options.find((o: any) => o._id === selectedOptId);
                        const correctOpt = q.options.find((o: any) => o.isCorrect);
                        const isCorrect = selectedOpt?.isCorrect;

                        return (
                          <div key={q._id} className={`cp-quiz-review-item ${isCorrect ? 'correct' : 'wrong'}`}>
                            <div className="cp-quiz-review-status">{isCorrect ? '✅' : '❌'}</div>
                            <div className="cp-quiz-review-content">
                              <p className="cp-quiz-review-q">Q{qIndex + 1}: {q.questionText}</p>
                              <p className="cp-quiz-review-a">
                                Your answer: <strong>{selectedOpt?.text || 'Not answered'}</strong>
                              </p>
                              {!isCorrect && (
                                <p className="cp-quiz-review-correct">
                                  Correct answer: <strong>{correctOpt?.text}</strong>
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="cp-quiz-result-actions">
                      {!quizScore.passed && (
                        <button className="cp-quiz-retake-btn" onClick={handleRetakeQuiz}>
                          🔄 Retake Quiz
                        </button>
                      )}
                      <button className="cp-quiz-back-btn" onClick={handlePreviousContent}>
                        ← Back to Content
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : selectedContent ? (
            <>
              {selectedContent.category === 'video' && selectedContent.videoFileId ? (
                <div className="cp-video-container">
                  <video
                    ref={videoRef}
                    key={selectedContent._id}
                    controls
                    autoPlay
                    preload="metadata"
                    className="cp-video"
                    onEnded={handleVideoEnded}
                  >
                    <source
                      src={getVideoUrl(selectedContent) || ''}
                      type="video/mp4"
                    />
                    Your browser does not support the video tag.
                  </video>
                  {completedContents.includes(selectedContent._id) && (
                    <div className="cp-completed-badge">✅ Completed</div>
                  )}
                </div>
              ) : selectedContent.category === 'video' && selectedContent.videoLink ? (
                <div className="cp-video-container">
                  <video
                    ref={videoRef}
                    key={selectedContent._id}
                    controls
                    autoPlay
                    preload="metadata"
                    className="cp-video"
                    onEnded={handleVideoEnded}
                  >
                    <source src={selectedContent.videoLink} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  {completedContents.includes(selectedContent._id) && (
                    <div className="cp-completed-badge">✅ Completed</div>
                  )}
                </div>
              ) : (
                <div className="cp-no-video">
                  <div className="cp-no-video-icon">📄</div>
                  <h3>{selectedContent.title}</h3>
                  {selectedContent.description && (
                    <p>{selectedContent.description}</p>
                  )}
                  {!selectedContent.description && (
                    <p>This content does not have a video.</p>
                  )}
                  {selectedContent.attachmentUrl && (
                    <a
                      href={selectedContent.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cp-open-link"
                      style={{ marginLeft: '12px' }}
                    >
                      📎 Attachment →
                    </a>
                  )}
                  {selectedContent.attachmentLink && (
                    <a
                      href={selectedContent.attachmentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cp-open-link"
                      style={{ marginLeft: '12px' }}
                    >
                      🔗 External Link →
                    </a>
                  )}
                  {selectedContent.allowDownload && getContentUrl(selectedContent) && (
                    <a
                      href={getContentUrl(selectedContent)!}
                      download
                      className="cp-open-link"
                      style={{ marginLeft: '12px' }}
                    >
                      ⬇️ Download →
                    </a>
                  )}
                  {completedContents.includes(selectedContent._id) ? (
                    <div className="cp-completed-badge" style={{ marginTop: '16px' }}>✅ Completed</div>
                  ) : (
                    <button
                      className="cp-mark-complete-btn"
                      onClick={() => handleMarkComplete(selectedContent._id)}
                      style={{ marginTop: '16px' }}
                    >
                      ✓ Mark as Completed
                    </button>
                  )}
                </div>
              )}

              {/* Content Details below video */}
              <div className="cp-content-details">
                <h2 className="cp-content-title">{selectedContent.title}</h2>
                <div className="cp-content-meta">
                  {selectedContent.duration > 0 && (
                    <span className="cp-meta-item">⏱ {selectedContent.duration} min</span>
                  )}
                  {selectedContent.responsible && (
                    <span className="cp-meta-item">👤 {selectedContent.responsible}</span>
                  )}
                  <span className="cp-meta-item cp-category-badge">
                    {selectedContent.category}
                  </span>
                </div>
                {selectedContent.description && (
                  <p className="cp-content-description">{selectedContent.description}</p>
                )}
              </div>

              {/* Content Navigation */}
              <div className="cp-content-navigation">
                <button
                  className="cp-nav-btn cp-nav-prev"
                  onClick={handlePreviousContent}
                  disabled={!canGoPrevious()}
                >
                  ← Previous
                </button>
                <button
                  className="cp-nav-btn cp-nav-next"
                  onClick={handleNextContent}
                  disabled={!canGoNext()}
                >
                  Next →
                </button>
              </div>
            </>
          ) : (
            <div className="cp-no-content">
              <div className="cp-no-content-icon">🎬</div>
              <h3>No content available</h3>
              <p>The instructor hasn't added any content for this course yet.</p>
            </div>
          )}
        </div>

        {/* Sidebar - Content List */}
        <div className={`cp-sidebar ${!sidebarOpen ? 'cp-sidebar-hidden' : ''}`}>
          <div className="cp-sidebar-header">
            <h3>Course Content</h3>
            <span className="cp-lesson-count">{completedContents.length}/{contents.length} done</span>
          </div>
          <div className="cp-content-list">
            {contents.map((content, index) => (
              <div
                key={content._id}
                className={`cp-content-item ${
                  selectedContent?._id === content._id ? 'active' : ''
                } ${completedContents.includes(content._id) ? 'completed' : ''}`}
                onClick={() => handleContentSelect(content)}
              >
                <div className={`cp-item-number ${completedContents.includes(content._id) ? 'done' : ''}`}>
                  {completedContents.includes(content._id) ? '✓' : index + 1}
                </div>
                <div className="cp-item-info">
                  <span className="cp-item-title">{content.title}</span>
                  <div className="cp-item-meta">
                    <span className="cp-item-type">
                      {content.category === 'video' && content.videoFileId
                        ? '🎥'
                        : content.category === 'video'
                        ? '🔗'
                        : content.category === 'document'
                        ? '📄'
                        : content.category === 'image'
                        ? '🖼️'
                        : '📌'}
                    </span>
                    {content.duration > 0 && (
                      <span className="cp-item-duration">
                        {content.duration} min
                      </span>
                    )}
                  </div>
                </div>
                {selectedContent?._id === content._id && (
                  <div className="cp-playing-indicator">▶</div>
                )}
              </div>
            ))}

            {contents.length === 0 && (
              <div className="cp-no-lessons">
                <p>No lessons added yet</p>
              </div>
            )}
          </div>

          {/* Quiz Section in Sidebar */}
          {quizzes.length > 0 && (
            <div className="cp-quiz-sidebar">
              <div className="cp-sidebar-header">
                <h3>Quiz</h3>
                <span className="cp-lesson-count">{quizCompleted ? '✅ Passed' : 'Pending'}</span>
              </div>
              {quizzes.map((quiz: any) => (
                <div
                  key={quiz._id}
                  className={`cp-content-item cp-quiz-item ${showQuiz && activeQuiz?._id === quiz._id ? 'active' : ''} ${quizCompleted ? 'completed' : ''}`}
                  onClick={() => handleStartQuiz(quiz)}
                >
                  <div className={`cp-item-number ${quizCompleted ? 'done' : ''}`}>
                    {quizCompleted ? '✓' : '📝'}
                  </div>
                  <div className="cp-item-info">
                    <span className="cp-item-title">{quiz.title}</span>
                    <div className="cp-item-meta">
                      <span className="cp-item-type">❓</span>
                      <span className="cp-item-duration">
                        {quiz.questions?.length || 0} Questions
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Congratulations Popup */}
      {showCongrats && (
        <div className="cert-congrats-banner">
          <div className="cert-congrats-card">
            <div className="cert-congrats-icon">🎉</div>
            <h2 className="cert-congrats-title">Congratulations!</h2>
            <p className="cert-congrats-subtitle">You have successfully completed</p>
            <p className="cert-congrats-course">{course?.title}</p>
            <div className="cert-congrats-actions">
              <button
                className="cert-view-btn"
                onClick={() => { setShowCongrats(false); setShowCertificate(true); }}
              >
                🏆 View Certificate
              </button>
              <button
                className="cert-later-btn"
                onClick={() => setShowCongrats(false)}
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {showCertificate && (
        <Certificate
          studentName={currentUser?.name || 'Student'}
          courseName={course?.title || 'Course'}
          completionDate={new Date().toISOString()}
          onClose={() => setShowCertificate(false)}
        />
      )}

      {/* Quiz Privacy Mode */}
      {showQuiz && activeQuiz && !quizSubmitted && (
        <QuizPrivacyMode
          quiz={activeQuiz}
          onSubmit={handleQuizSubmit}
          onCancel={handleQuizCancel}
          alreadyPassed={quizCompleted}
        />
      )}

      {/* Quiz Results Modal */}
      {quizSubmitted && (
        <div className="qpm-overlay">
          <div className="cp-quiz-results-modal">
            <div className={`cp-quiz-result-card ${quizScore.passed ? 'passed' : 'failed'}`}>
              <div className="cp-quiz-result-icon">{quizScore.passed ? '🎉' : '😞'}</div>
              <h3 className="cp-quiz-result-title">
                {quizScore.passed ? 'Congratulations! You Passed!' : 'Not Passed'}
              </h3>
              <div className="cp-quiz-result-score">
                <span className="cp-quiz-score-number">{quizScore.correct}</span>
                <span className="cp-quiz-score-divider">/</span>
                <span className="cp-quiz-score-total">{quizScore.total}</span>
              </div>
              <p className="cp-quiz-result-text">
                {quizScore.passed
                  ? `You got ${quizScore.correct} out of ${quizScore.total} correct. Well done!`
                  : `You need at least ${Math.ceil(quizScore.total / 2)} correct answers to pass. You got ${quizScore.correct}.`}
              </p>

              <div className="cp-quiz-result-actions">
                {!quizScore.passed && (
                  <button className="qpm-btn qpm-btn-start" onClick={handleRetakeQuiz}>
                    🔄 Retake Quiz
                  </button>
                )}
                <button 
                  className="qpm-btn qpm-btn-cancel" 
                  onClick={() => {
                    setQuizSubmitted(false);
                    handlePreviousContent();
                  }}
                >
                  ← Back to Content
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursePlayer;
