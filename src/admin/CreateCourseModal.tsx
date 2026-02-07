import React, { useState } from 'react';

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCourse: (courseName: string) => void;
}

const CreateCourseModal: React.FC<CreateCourseModalProps> = ({
  isOpen,
  onClose,
  onCreateCourse,
}) => {
  const [courseName, setCourseName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (courseName.trim()) {
      onCreateCourse(courseName.trim());
      setCourseName('');
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Course</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <input
              type="text"
              placeholder="Provide a name.. (Eg: Basics of Odoo CRM)"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className="course-name-input"
              autoFocus
            />
          </div>
          <div className="modal-footer">
            <button type="submit" className="create-btn" disabled={!courseName.trim()}>
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourseModal;
