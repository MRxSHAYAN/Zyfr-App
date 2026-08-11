import React, { useRef, useState, useCallback } from 'react';
import { Camera, X, Upload } from 'lucide-react';

/**
 * ImageUploader
 * Local file-based avatar picker:
 *   - Desktop: file input (click) + drag-and-drop
 *   - Mobile: triggers native photo gallery / file picker
 *   - Instant client-side preview via URL.createObjectURL
 *   - Converts selected image to base64 to pass back via onImageSelect
 *   - Falls back to initials badge when no image is set
 *
 * Props:
 *   currentImageUrl  string | null — existing avatar URL
 *   displayName      string        — used for the initials fallback
 *   onImageSelect    (base64: string) => void — called with base64 data URL
 *   size             'sm' | 'md' | 'lg'  (default 'md')
 */
const SIZE_MAP = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
};

const ICON_SIZE_MAP = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

const ImageUploader = ({
  currentImageUrl = null,
  displayName = '',
  onImageSelect,
  size = 'md',
}) => {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join('');
  };

  const processFile = useCallback(
    (file) => {
      if (!file || !file.type.startsWith('image/')) return;
      // Instant preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // Also convert to base64 so the parent can send it to the server
      const reader = new FileReader();
      reader.onload = () => {
        onImageSelect?.(reader.result);
      };
      reader.readAsDataURL(file);
    },
    [onImageSelect]
  );

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    processFile(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const clearPreview = (e) => {
    e.stopPropagation();
    setPreview(null);
    onImageSelect?.(null);
  };

  const displaySrc = preview || currentImageUrl;
  const sizeClass = SIZE_MAP[size] || SIZE_MAP.md;
  const iconClass = ICON_SIZE_MAP[size] || ICON_SIZE_MAP.md;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar area */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload profile picture"
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative ${sizeClass} rounded-2xl cursor-pointer group
          border-2 transition-all duration-200 select-none
          ${
            isDragging
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30 scale-105'
              : 'border-surface-200 dark:border-surface-700 hover:border-primary-400 dark:hover:border-primary-500'
          }
          focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none`}
      >
        {displaySrc ? (
          <img
            src={displaySrc}
            alt="Avatar preview"
            className="w-full h-full object-cover rounded-2xl"
          />
        ) : (
          <div className="w-full h-full rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
            <span className="text-white font-bold text-2xl select-none">{getInitials(displayName)}</span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
          <Camera className={`${iconClass} text-white`} />
          <span className="text-white text-[10px] font-medium">Change</span>
        </div>

        {/* Clear button */}
        {displaySrc && (
          <button
            type="button"
            onClick={clearPreview}
            aria-label="Remove image"
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-500 hover:bg-rose-600
              text-white flex items-center justify-center shadow-lg transition-all
              opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Helper text */}
      <p className="text-xs text-surface-400 dark:text-surface-500 text-center">
        Click to upload or drag & drop
        <br />
        <span className="text-[10px]">JPG, PNG, GIF, WebP — max 5 MB</span>
      </p>

      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        aria-hidden="true"
      />
    </div>
  );
};

export default ImageUploader;
