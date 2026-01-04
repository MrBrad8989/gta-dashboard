"use client";

import { getDiscordAvatarUrl } from '@/lib/avatarHelper';

interface UserAvatarProps {
  discordId: string;
  avatar:  string | null;
  name?:  string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function UserAvatar({ 
  discordId, 
  avatar, 
  name, 
  size = 'md',
  className = ''
}: UserAvatarProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-24 h-24'
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = `https://cdn.discordapp.com/embed/avatars/${parseInt(discordId) % 5}.png`;
  };

  return (
    <img 
      src={getDiscordAvatarUrl(discordId, avatar)} 
      alt={name || 'Usuario'}
      className={`${sizeClasses[size]} rounded-full ${className}`}
      onError={handleError}
    />
  );
}