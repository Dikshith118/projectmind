import { useState, useRef } from 'react';

export default function FileUpload({ onFileSelect, onFileRemove, selectedFile }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-powerpoint'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Please upload PDF, DOCX, TXT, or PPTX files only.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB.');
      return;
    }

    onFileSelect(file);
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleRemove = () => {
    onFileRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const icons = {
      pdf: '📄',
      docx: '📝',
      doc: '📝',
      txt: '📃',
      pptx: '📊',
      ppt: '📊'
    };
    return icons[ext] || '📎';
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-slate-300">
        Upload Supporting Documents <span className="text-slate-500 font-normal">(Optional)</span>
      </label>

      {!selectedFile ? (
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
            transition-all duration-300
            ${isDragging 
              ? 'border-cyan-400/50 bg-cyan-500/10 scale-[1.02]' 
              : 'border-white/10 bg-slate-950/40 hover:border-cyan-400/30 hover:bg-slate-950/60'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt,.pptx,.ppt"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center">
              <span className="text-3xl">📁</span>
            </div>

            <div>
              <p className="text-white font-semibold mb-1">
                {isDragging ? 'Drop your file here' : 'Drag & drop or click to upload'}
              </p>
              <p className="text-xs text-slate-400">
                Supports PDF, DOCX, TXT, PPTX • Max 10MB
              </p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {['PDF', 'DOCX', 'TXT', 'PPTX'].map((type) => (
                <span
                  key={type}
                  className="text-xs px-2 py-1 rounded-lg bg-white/5 text-slate-400 border border-white/10"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-cyan-400/20 rounded-2xl p-4 bg-cyan-500/5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center shrink-0">
                <span className="text-2xl">{getFileIcon(selectedFile.name)}</span>
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-400">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              className="shrink-0 w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 transition flex items-center justify-center"
              title="Remove file"
            >
              ×
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-cyan-400/10">
            <p className="text-xs text-cyan-200/70 flex items-center gap-2">
              <span>✨</span>
              <span>AI will analyze this document to generate smarter task plans</span>
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-slate-500 leading-relaxed">
        Upload project requirements, architecture docs, API specs, or feature descriptions. 
        AI will extract key information to create more accurate task breakdowns.
      </p>
    </div>
  );
}
