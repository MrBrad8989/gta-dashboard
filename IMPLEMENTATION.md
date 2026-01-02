# Ticket System - Discord Notifications & Attachments Implementation

## Overview
This implementation adds two major features to the GTA Dashboard ticket system:
1. **Discord DM Notifications** - Users and staff receive Discord direct messages when there are new replies to tickets
2. **File Attachments with Live Preview** - Support for adding images/videos via URLs with live preview

## Changes Made

### 1. Database Schema Updates (`prisma/schema.prisma`)
- Added `attachments Json? @default("[]")` field to `TicketMessage` model
- This field stores an array of URLs as JSON

### 2. Discord Notification System

#### `lib/discordNotifications.ts` (NEW)
- Created `sendTicketNotification()` function
- Sends formatted Discord embeds via DM
- Includes ticket title, message preview, and direct link to ticket
- Handles errors gracefully

#### `bot/index.ts`
- Added `/send-dm` POST endpoint
- Receives Discord user ID and message payload
- Sends DM to the specified user
- Returns success/error status

#### `app/actions/ticketActions.ts`
- Updated `sendMessage()` to support attachments
- Added notification logic:
  - When **staff** replies → notifies **ticket creator**
  - When **user** replies → notifies **assigned staff member**
- Updated `createTicket()` to handle initial attachments
- Creates an initial message with attachments if provided

### 3. Attachment Components

#### `components/AttachmentInput.tsx` (NEW)
- Client component for adding attachment URLs
- Features:
  - URL input field with validation
  - Live preview grid for added attachments
  - Remove button for each attachment
  - Supports images (jpg, png, gif, webp)
  - Supports videos (mp4, webm, YouTube)
  - Enter key support for quick adding

#### `components/AttachmentPreview.tsx` (NEW)
- Displays attachments in messages
- Features:
  - Image preview with click-to-open
  - YouTube embed support
  - Direct video playback for MP4/WebM
  - Fallback link for unsupported types
  - Discord CDN support

#### `components/TicketMessageForm.tsx` (NEW)
- Client component for ticket message form
- Integrates AttachmentInput
- Manages local state for attachments
- Handles form submission with attachments

### 4. UI Integration

#### `app/tickets/[id]/page.tsx`
- Integrated AttachmentPreview in message display
- Replaced inline form with TicketMessageForm component
- Shows attachments below message content
- Type-safe rendering of attachment arrays

#### `app/tickets/new/page.tsx`
- Added AttachmentInput to ticket creation form
- Attachments sent as initial message if provided
- Integrated with existing form submission

### 5. Configuration

#### `.env.example` (NEW)
- Documented all required environment variables:
  - `BOT_API_URL` - URL of Discord bot API (default: http://localhost:3001)
  - `NEXT_PUBLIC_DASHBOARD_URL` - Public dashboard URL for notification links

#### `.gitignore`
- Updated to allow `.env.example` file

## How It Works

### Notification Flow
1. User or staff sends a message in a ticket
2. `sendMessage()` action creates the message in database
3. Function determines who to notify:
   - If sender is staff assigned to ticket → notify creator
   - If sender is user → notify assigned staff
4. `sendTicketNotification()` is called with notification details
5. Bot fetches user's Discord ID from database
6. Bot API `/send-dm` endpoint sends formatted DM
7. User receives notification with ticket link

### Attachment Flow
1. User enters attachment URLs in AttachmentInput
2. URLs are stored in local component state
3. Live preview shows thumbnails/icons for each attachment
4. On submit, URLs are JSON-encoded and sent to server
5. Server stores attachments array in TicketMessage
6. When rendering, AttachmentPreview displays each URL appropriately
7. Images are embedded, videos are playable, YouTube links are embedded

## Benefits

### For Users
- ✅ Instant Discord notifications for ticket replies
- ✅ No need to constantly check dashboard
- ✅ Easy evidence submission via image/video URLs
- ✅ Live preview of attachments before sending
- ✅ Click notification to go directly to ticket

### For Staff
- ✅ Immediate notification when users reply
- ✅ Better response times
- ✅ Visual evidence in ticket conversations
- ✅ Support for multiple attachment types
- ✅ YouTube video embeds for tutorials/examples

## Technical Details

### Supported Attachment Types
- **Images**: .jpg, .jpeg, .png, .gif, .webp, Discord CDN URLs
- **Videos**: .mp4, .webm
- **YouTube**: Full URLs and short links (youtu.be)

### Security Considerations
- No file uploads (only URLs) - prevents storage/bandwidth issues
- Discord CDN URLs are whitelisted for images
- All external links open in new tab with noopener/noreferrer
- JSON validation on attachments array

### Performance
- Attachments stored as JSON (efficient for small arrays)
- Lazy loading for images in preview
- No server-side file processing
- Client-side state management for attachments

## Environment Variables Required

```env
# Discord Bot API endpoint
BOT_API_URL=http://localhost:3001

# Public dashboard URL for notification links
NEXT_PUBLIC_DASHBOARD_URL=https://your-domain.com
```

## Migration Notes

### Database Migration Required
After deploying, run:
```bash
npx prisma db push
# or
npx prisma migrate dev --name add_attachments_to_ticket_messages
```

This adds the `attachments` column to the `TicketMessage` table with a default value of empty array.

### Backwards Compatibility
- ✅ Existing tickets work without changes
- ✅ Old messages without attachments display normally
- ✅ Notifications gracefully handle missing Discord IDs
- ✅ Attachments are optional in all forms

## Testing Checklist

- [ ] Create new ticket with attachments
- [ ] Send message with image URL
- [ ] Send message with YouTube URL
- [ ] Verify Discord DM received as user
- [ ] Verify Discord DM received as staff
- [ ] Test attachment preview in messages
- [ ] Test attachment removal before sending
- [ ] Verify notification links work correctly
- [ ] Test with missing BOT_API_URL (graceful failure)
- [ ] Test with user without Discord ID

## Future Enhancements (Not Implemented)

- Direct file uploads to Discord CDN
- Attachment upload progress indicators
- Thumbnail generation for videos
- Attachment file size validation
- Imgur/other CDN integrations
- Notification preferences per user
- Read receipts for notifications
- Notification batching for multiple messages
