"use client";

import { useState } from 'react';
import { FaImage, FaVideo, FaLink, FaTimes, FaExclamationTriangle } from 'react-icons/fa';

export default function AttachmentInput({ 
  attachments, 
  onChange 
}: { 
  attachments: string[], 
  onChange: (urls: string[]) => void 
}) {
  const [urlInput, setUrlInput] = useState('');
  const [brokenUrls, setBrokenUrls] = useState<Set<string>>(new Set());

  const addUrl = () => {
    if (!urlInput.trim()) return;
    // Evitar URLs duplicadas
    if (attachments.includes(urlInput.trim())) {
      setUrlInput('');
      return;
    }
    onChange([...attachments, urlInput.trim()]);
    setUrlInput('');
  };

  const removeUrl = (index: number) => {
    const urlToRemove = attachments[index];
    onChange(attachments.filter((_, i) => i !== index));
    // Remove from broken URLs set if it was there
    if (brokenUrls.has(urlToRemove)) {
      const newBrokenUrls = new Set(brokenUrls);
      newBrokenUrls.delete(urlToRemove);
      setBrokenUrls(newBrokenUrls);
    }
  };

  const handleImageError = (url: string) => {
    setBrokenUrls(new Set(brokenUrls).add(url));
  };

  const isImage = (url: string) => {
    // Check for image file extensions first
    if (/\.(jpg|jpeg|png|gif|webp)$/i.test(url)) return true;
    // For Discord CDN, check if the URL contains image extensions
    if (url.includes('cdn.discordapp.com') && /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url)) return true;
    return false;
  };
  const isVideo = (url: string) => /\.(mp4|webm)$/i.test(url) || url.includes('youtube.com') || url.includes('youtu.be');

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="URL de imagen o video (Discord, Imgur, YouTube...)"
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addUrl())}
        />
        <button
          type="button"
          onClick={addUrl}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2"
        >
          <FaLink /> Añadir
        </button>
      </div>

      {/* Preview de attachments */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {attachments.map((url, index) => (
          <div key={index} className="relative group">
            <button
              type="button"
              onClick={() => removeUrl(index)}
              className="absolute top-2 right-2 z-10 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
            >
              <FaTimes />
            </button>
            
            {isImage(url) && (
              brokenUrls.has(url) ? (
                <div className="w-full h-32 bg-red-100 dark:bg-red-900/20 rounded-lg flex flex-col items-center justify-center border border-red-300 dark:border-red-700">
                  <FaExclamationTriangle className="text-2xl text-red-500 mb-2" />
                  <span className="text-xs text-red-600 dark:text-red-400">Error al cargar</span>
                </div>
              ) : (
                <img 
                  src={url} 
                  alt="Attachment" 
                  className="w-full h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-700"
                  onError={() => handleImageError(url)}
                />
              )
            )}
            
            {isVideo(url) && (
              <div className="w-full h-32 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700">
                <FaVideo className="text-4xl text-gray-400" />
              </div>
            )}

            {!isImage(url) && !isVideo(url) && (
              <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center border border-gray-300 dark:border-gray-700">
                <FaLink className="text-2xl text-gray-400" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
