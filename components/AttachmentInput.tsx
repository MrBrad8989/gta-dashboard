"use client";

import { useState } from 'react';
import { FaImage, FaVideo, FaLink, FaTimes } from 'react-icons/fa';

export default function AttachmentInput({ 
  attachments, 
  onChange 
}: { 
  attachments: string[], 
  onChange: (urls: string[]) => void 
}) {
  const [urlInput, setUrlInput] = useState('');

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
    onChange(attachments.filter((_, i) => i !== index));
  };

  const isImage = (url: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
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
              <img 
                src={url} 
                alt="Attachment" 
                className="w-full h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-700"
              />
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
