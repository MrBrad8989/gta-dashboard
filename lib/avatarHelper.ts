export function getDiscordAvatarUrl(discordId: string, avatar: string | null): string {
  if (!avatar) {
    // Avatar por defecto basado en el discriminador
    return `https://cdn.discordapp.com/embed/avatars/${parseInt(discordId) % 5}.png`;
  }
  
  // Avatar personalizado
  const extension = avatar.startsWith('a_') ? 'gif' : 'png';
  return `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.${extension}?size=128`;
}
