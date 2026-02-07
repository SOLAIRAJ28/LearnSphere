import React, { useRef } from 'react';
import '../styles/Certificate.css';

interface CertificateProps {
  studentName: string;
  courseName: string;
  completionDate: string;
  onClose: () => void;
}

const Certificate: React.FC<CertificateProps> = ({
  studentName,
  courseName,
  completionDate,
  onClose,
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const cert = certificateRef.current;
    if (!cert) return;

    // Use html2canvas-like approach via print
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to download the certificate');
      return;
    }

    const certHTML = cert.innerHTML;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Certificate - ${courseName}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            min-height: 100vh; 
            background: #f0f0f0;
            font-family: 'Georgia', 'Times New Roman', serif;
          }
          .cert-page {
            width: 1000px;
            height: 700px;
            background: #fffef5;
            position: relative;
            overflow: hidden;
            box-shadow: 0 4px 30px rgba(0,0,0,0.15);
          }
          .cert-border-outer {
            position: absolute;
            inset: 12px;
            border: 3px solid #c9a84c;
            border-radius: 4px;
          }
          .cert-border-inner {
            position: absolute;
            inset: 20px;
            border: 1.5px solid #c9a84c;
            border-radius: 2px;
          }
          .cert-corner {
            position: absolute;
            width: 60px;
            height: 60px;
          }
          .cert-corner.tl { top: 28px; left: 28px; border-top: 3px solid #1e3a5f; border-left: 3px solid #1e3a5f; }
          .cert-corner.tr { top: 28px; right: 28px; border-top: 3px solid #1e3a5f; border-right: 3px solid #1e3a5f; }
          .cert-corner.bl { bottom: 28px; left: 28px; border-bottom: 3px solid #1e3a5f; border-left: 3px solid #1e3a5f; }
          .cert-corner.br { bottom: 28px; right: 28px; border-bottom: 3px solid #1e3a5f; border-right: 3px solid #1e3a5f; }
          .cert-watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 200px;
            font-weight: 900;
            color: rgba(30, 58, 95, 0.03);
            letter-spacing: 20px;
            white-space: nowrap;
            pointer-events: none;
          }
          .cert-content {
            position: relative;
            z-index: 2;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            padding: 50px 80px;
            text-align: center;
          }
          .cert-logo-section {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 10px;
          }
          .cert-logo-icon {
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #1e3a5f, #2196f3);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 900;
            font-size: 18px;
            font-family: Arial, sans-serif;
            box-shadow: 0 2px 8px rgba(30, 58, 95, 0.3);
          }
          .cert-logo-text {
            font-family: Arial, sans-serif;
            font-size: 22px;
            font-weight: 800;
            background: linear-gradient(135deg, #1e3a5f, #2196f3);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .cert-logo-sub {
            font-family: Arial, sans-serif;
            font-size: 14px;
            font-weight: 600;
            background: linear-gradient(135deg, #7cb342, #8bc34a);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .cert-ribbon {
            display: flex;
            align-items: center;
            gap: 16px;
            margin: 8px 0;
          }
          .cert-ribbon-line {
            width: 100px;
            height: 2px;
            background: linear-gradient(90deg, transparent, #c9a84c, transparent);
          }
          .cert-ribbon-star {
            color: #c9a84c;
            font-size: 20px;
          }
          .cert-heading {
            font-size: 42px;
            font-weight: 400;
            color: #1e3a5f;
            letter-spacing: 8px;
            text-transform: uppercase;
            margin: 4px 0;
            font-family: 'Georgia', serif;
          }
          .cert-subheading {
            font-size: 15px;
            color: #888;
            letter-spacing: 4px;
            text-transform: uppercase;
            margin-bottom: 12px;
          }
          .cert-appreciation {
            font-size: 14px;
            color: #666;
            margin-bottom: 4px;
            font-style: italic;
          }
          .cert-student-name {
            font-size: 38px;
            font-weight: 700;
            color: #1e3a5f;
            font-family: 'Georgia', serif;
            border-bottom: 2px solid #c9a84c;
            padding-bottom: 6px;
            margin: 4px 0 12px;
            min-width: 400px;
            display: inline-block;
          }
          .cert-description {
            font-size: 15px;
            color: #555;
            line-height: 1.6;
            max-width: 600px;
          }
          .cert-course-name {
            font-weight: 700;
            color: #1e3a5f;
            font-size: 17px;
          }
          .cert-footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            width: 100%;
            margin-top: 24px;
            padding: 0 20px;
          }
          .cert-footer-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
          }
          .cert-footer-line {
            width: 160px;
            height: 1.5px;
            background: #1e3a5f;
          }
          .cert-footer-label {
            font-size: 11px;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          .cert-footer-value {
            font-size: 13px;
            color: #333;
            font-weight: 600;
          }
          .cert-seal {
            width: 80px;
            height: 80px;
            border: 3px solid #c9a84c;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #fdf6e3, #fffef5);
            box-shadow: 0 2px 10px rgba(201, 168, 76, 0.3);
          }
          .cert-seal-inner {
            width: 60px;
            height: 60px;
            border: 1.5px solid #c9a84c;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            color: #c9a84c;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            text-align: center;
            line-height: 1.2;
          }
          .cert-id {
            position: absolute;
            bottom: 28px;
            right: 40px;
            font-size: 9px;
            color: #bbb;
            font-family: monospace;
          }
          @media print {
            body { background: white; }
            .cert-page { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        ${certHTML}
        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const formattedDate = new Date(completionDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const certId = `KEC-${Date.now().toString(36).toUpperCase()}`;

  return (
    <div className="cert-modal-overlay" onClick={onClose}>
      <div className="cert-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cert-modal-actions">
          <button className="cert-download-btn" onClick={handleDownload}>
            🖨️ Print / Download PDF
          </button>
          <button className="cert-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="cert-scroll-wrapper">
          <div className="cert-page" ref={certificateRef}>
            {/* Decorative borders */}
            <div className="cert-border-outer"></div>
            <div className="cert-border-inner"></div>
            <div className="cert-corner tl"></div>
            <div className="cert-corner tr"></div>
            <div className="cert-corner bl"></div>
            <div className="cert-corner br"></div>

            {/* Watermark */}
            <div className="cert-watermark">KEC</div>

            {/* Main Content */}
            <div className="cert-content">
              {/* Logo */}
              <div className="cert-logo-section">
                <div className="cert-logo-icon">KEC</div>
                <div>
                  <div className="cert-logo-text">KEC LearnHub</div>
                  <div className="cert-logo-sub">Excellence in Education</div>
                </div>
              </div>

              {/* Decorative ribbon */}
              <div className="cert-ribbon">
                <div className="cert-ribbon-line"></div>
                <span className="cert-ribbon-star">★</span>
                <span className="cert-ribbon-star">★</span>
                <span className="cert-ribbon-star">★</span>
                <div className="cert-ribbon-line"></div>
              </div>

              {/* Certificate heading */}
              <h1 className="cert-heading">Certificate</h1>
              <p className="cert-subheading">of Completion & Appreciation</p>

              {/* Student info */}
              <p className="cert-appreciation">This is proudly presented to</p>
              <div className="cert-student-name">{studentName}</div>

              <p className="cert-description">
                For the successful completion of the course
                <br />
                <span className="cert-course-name">"{courseName}"</span>
                <br />
                demonstrating dedication, commitment, and excellence in learning.
              </p>

              {/* Footer */}
              <div className="cert-footer">
                <div className="cert-footer-item">
                  <div className="cert-footer-value">{formattedDate}</div>
                  <div className="cert-footer-line"></div>
                  <div className="cert-footer-label">Date of Completion</div>
                </div>

                <div className="cert-seal">
                  <div className="cert-seal-inner">
                    Verified<br />✓
                  </div>
                </div>

                <div className="cert-footer-item">
                  <div className="cert-footer-value">KEC LearnHub</div>
                  <div className="cert-footer-line"></div>
                  <div className="cert-footer-label">Issued By</div>
                </div>
              </div>
            </div>

            <div className="cert-id">ID: {certId}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
