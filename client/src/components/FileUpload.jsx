import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineCloudUpload, HiOutlineDocument, HiOutlineX } from 'react-icons/hi';

const FileUpload = ({ onFileSelect, currentFile, loading }) => {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false)
  });

  const removeFile = (e) => {
    e.stopPropagation();
    onFileSelect(null);
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragActive || dragActive
            ? 'border-primary bg-primary-light'
            : 'border-border hover:border-primary hover:bg-primary-light/50'
          }
          ${loading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <AnimatePresence mode="wait">
          {currentFile ? (
            <motion.div
              key="file"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-success-light rounded-2xl flex items-center justify-center mb-4">
                <HiOutlineDocument className="w-8 h-8 text-success" />
              </div>
              <p className="font-medium text-text-primary mb-1">{currentFile.name}</p>
              <p className="text-sm text-text-secondary mb-4">
                {(currentFile.size / 1024).toFixed(1)} KB
              </p>
              <button
                onClick={removeFile}
                className="flex items-center gap-2 px-4 py-2 bg-error-light text-error rounded-lg hover:bg-error hover:text-white transition-colors"
              >
                <HiOutlineX className="w-4 h-4" />
                Remove
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-primary-light rounded-2xl flex items-center justify-center mb-4">
                <HiOutlineCloudUpload className="w-8 h-8 text-primary" />
              </div>
              <p className="font-medium text-text-primary mb-1">
                {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
              </p>
              <p className="text-sm text-text-secondary mb-4">
                or click to browse
              </p>
              <p className="text-xs text-text-secondary">
                Supports PDF, DOCX (Max 5MB)
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && (
          <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-2" />
              <p className="text-sm text-text-secondary">Uploading...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
