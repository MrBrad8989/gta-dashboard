export default function AttachmentPreview({ url }: { url: string }) {
  const isImage = (url: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(url) || url.includes('cdn.discordapp.com');
  const isYouTube = (url: string) => url.includes('youtube.com') || url.includes('youtu.be');
  
  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  if (isImage(url)) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        <img 
          src={url} 
          alt="Attachment" 
          className="max-w-full max-h-96 rounded-lg border border-gray-700 hover:opacity-80 transition"
        />
      </a>
    );
  }

  if (isYouTube(url)) {
    const embedUrl = getYouTubeEmbedUrl(url);
    if (embedUrl) {
      return (
        <iframe
          src={embedUrl}
          className="w-full aspect-video rounded-lg border border-gray-700"
          allowFullScreen
        />
      );
    }
  }

  // Video directo
  if (/\.(mp4|webm)$/i.test(url)) {
    return (
      <video 
        controls 
        className="max-w-full max-h-96 rounded-lg border border-gray-700"
      >
        <source src={url} />
      </video>
    );
  }

  // Fallback: link
  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-blue-400 hover:text-blue-300 underline break-all"
    >
      {url}
    </a>
  );
}
