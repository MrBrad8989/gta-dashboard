"use client";

import { useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import AttachmentInput from '@/components/AttachmentInput';

export default function TicketMessageForm({ 
  ticketId, 
  sendMessageAction 
}: { 
  ticketId: number;
  sendMessageAction: (formData: FormData) => Promise<void>;
}) {
  const [attachments, setAttachments] = useState<string[]>([]);
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('content', content);
    formData.append('attachments', JSON.stringify(attachments));
    
    await sendMessageAction(formData);
    
    // Reset form
    setContent('');
    setAttachments([]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-w-5xl mx-auto">
      <input 
        type="text" 
        value={content}
        onChange={(e) => setContent(e.target.value)}
        autoComplete="off"
        placeholder="Escribe tu mensaje..." 
        className="w-full p-3 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800 dark:text-white"
      />
      
      <AttachmentInput 
        attachments={attachments}
        onChange={setAttachments}
      />
      
      <div className="flex justify-end">
        <button 
          type="submit" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl transition shadow flex items-center gap-2 font-bold"
        >
          <FaPaperPlane /> Enviar
        </button>
      </div>
    </form>
  );
}
