// src/components/PrintControl.jsx
import React from 'react';

const PrintControl = () => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="print-control-container">
      <button 
        onClick={handlePrint}
        className="btn-print"
      >
        🖨️ Xuất PDF / In
      </button>
      <p className="print-hint">
        (Mẹo: Chọn "Lưu dưới dạng PDF" ở mục Máy in)
      </p>

      <style>{`
        .print-control-container {
          margin-top: 50px;
          padding-bottom: 100px;
          text-align: center;
        }

        .btn-print {
          padding: 10px 20px;
          font-size: 1.1rem;
          background-color: #6c757d;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: background 0.2s;
        }

        .btn-print:hover {
          background-color: #5a6268;
        }

        .print-hint {
          font-size: 0.9rem;
          color: #888;
          margin-top: 10px;
          font-style: italic;
        }

        /* Khi in thì ẩn chính nút này đi */
        @media print {
          .print-control-container {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PrintControl;