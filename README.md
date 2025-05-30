# Bulk Messaging Tool

A Next.js application for sending bulk WhatsApp messages using the WaAPI service with full dark/light mode support.

## Features

- **🌓 Dark/Light Mode**: Complete theme switching with persistent storage
- **👥 Sender Management**: Add and manage WaAPI tokens with connection status
- **📋 Contact Lists**: Create and organize contact groups
- **📞 Contact Management**: Add contacts manually or via CSV upload
- **📢 Campaign Creation**: Design and schedule message campaigns with text or media
- **🖼️ Media Messaging**: Send images, videos, documents with optional captions
- **🚀 Bulk Messaging**: Send messages with throttling to avoid rate limits
- **📊 Real-time Status**: Track campaign progress and delivery status
- **📈 Analytics**: View success rates and delivery logs

## Theme Features

- Automatic system preference detection
- Manual toggle between light and dark modes  
- Persistent theme storage in localStorage
- Smooth transitions between themes
- Consistent dark mode across all components
- Custom scrollbar styling for both themes

## Installation

1. Clone the repository:
```bash
cd BulkMessagingTool
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file and configure:
```
MONGODB_URI=mongodb://localhost:27017/bulk-messaging-tool
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

4. Run the application:
```bash
npm run dev
```

## Project Structure

```
├── app/
│   ├── api/           # API routes
│   ├── senders/       # Sender management pages
│   ├── contacts/      # Contact management pages
│   ├── lists/         # List management pages
│   ├── campaigns/     # Campaign pages
│   └── layout.tsx     # Root layout with theme provider
├── components/
│   ├── Navigation.tsx # Main navigation with theme toggle
│   ├── ThemeProvider.tsx # Theme context provider
│   └── ThemeToggle.tsx # Theme toggle button
├── lib/
│   ├── mongoose.ts    # MongoDB connection
│   └── waapi.ts       # WaAPI integration
├── models/            # MongoDB models
└── globals.css        # Global styles with dark mode support
```

## Usage

1. **Add a Sender**: Go to `/senders` and add your WaAPI token
2. **Create Lists**: Create contact groups in `/lists`
3. **Add Contacts**: Manually add or upload CSV files in `/contacts`
4. **Create Campaign**: Design your message in `/campaigns/new` (text or media)
5. **Media Messages**: For media campaigns, provide a direct URL to your image/video/document
6. **Send Messages**: Execute the campaign with automatic throttling

## Media Message Support

The tool now supports sending media messages using WaAPI's media endpoints:

### Supported Media Types
- **Images**: JPG, JPEG, PNG, GIF, WebP
- **Videos**: MP4, AVI, MOV, WebM  
- **Audio**: MP3, WAV, OGG
- **Documents**: PDF, DOC, DOCX

### How to Send Media
1. Select "Media Message" when creating a campaign
2. Provide a direct URL to your media file
3. Optionally add a caption
4. The tool will use WaAPI's `/send-media` endpoint

### Media URL Requirements
- Must be a direct, publicly accessible URL
- File should be downloadable without authentication
- Recommended file size: < 50MB (depending on WaAPI limits)

### Test Media Feature
Visit `/test-media` to test media sending with a single message before running full campaigns.

## Theme Implementation

The dark mode implementation includes:

### ThemeProvider Component
- Manages theme state using React Context
- Automatically detects system preference
- Persists theme choice in localStorage
- Applies theme to document root

### ThemeToggle Component
- Clean toggle button with icons
- Smooth transitions
- Accessible with proper titles

### Global Styling
- Tailwind CSS with dark mode class strategy
- Custom scrollbar styling for both themes
- Consistent color palette for light/dark modes

## CSV Format

When uploading contacts, use this CSV format:
```csv
name,phone
John Doe,+1234567890
Jane Smith,+0987654321
```

## Important Notes

- **Rate Limiting**: Messages are sent with 1-second delays to avoid WhatsApp restrictions
- **Token Management**: Keep your WaAPI tokens secure and monitor connection status
- **Contact Validation**: Phone numbers should include country codes
- **Campaign Status**: Monitor sending progress in real-time
- **Theme Persistence**: Your theme preference is saved and restored on reload

## API Endpoints

- `GET/POST /api/senders` - Manage senders
- `GET/POST /api/lists` - Manage contact lists
- `GET/POST /api/contacts` - Manage contacts
- `POST /api/contacts/bulk` - Bulk upload contacts
- `GET/POST /api/campaigns` - Manage campaigns
- `POST /api/campaigns/[id]/send` - Send campaign

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Themes**: Custom theme provider with localStorage persistence
- **File Processing**: Papa Parse for CSV handling
- **Icons**: Lucide React

## Dark Mode Classes

The application uses Tailwind's class-based dark mode strategy:

```css
/* Light mode */
.bg-white

/* Dark mode */
.dark:bg-gray-800

/* Both modes with transitions */
.bg-white dark:bg-gray-800 transition-colors
```

## Security Considerations

- WaAPI tokens are stored securely in the database
- Input validation on all forms and API endpoints
- Rate limiting prevents abuse of WhatsApp services
- Environment variables protect sensitive configuration

## Deployment

1. Build the application:
```bash
npm run build
```

2. Start production server:
```bash
npm start
```

3. Configure production environment variables
4. Set up MongoDB in production
5. Configure proper security headers

## Customization

To modify the theme colors, update the Tailwind config and CSS variables in `globals.css`. The theme system is fully customizable and extensible.

## License

This project is for personal/commercial use. Ensure compliance with WhatsApp's terms of service when using bulk messaging features.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Support

For issues or questions, please create an issue in the repository.
#   B u l k - M e s s a g i n g  
 