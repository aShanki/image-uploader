# ImageUploader

A self-hosted, private image hosting service compatible with ShareX, built with Next.js, MongoDB, and Discord authentication.

## Features

- 🚀 Discord OAuth authentication
- 📁 Direct image uploads and URL sharing
- 🔗 Short URLs for easy sharing
- 🖼️ Support for images (JPG, PNG, GIF) and videos (MP4, MKV)
- 📱 Responsive web interface for browsing uploads
- 🔒 Secure file storage with authentication
- ⚡ Rate limiting and file size restrictions
- 📊 View tracking for uploads
- 🎨 Modern UI with shadcn/ui components
- 🐳 Docker deployment ready

## Prerequisites

- Node.js 18+ (for development)
- Docker and Docker Compose (for deployment)
- Discord application credentials
- Domain name (for production)

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/image-uploader.git
   cd image-uploader
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file:
   ```env
   MONGODB_URI=mongodb://localhost:27017/image-uploader
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   DISCORD_CLIENT_ID=your-discord-client-id
   DISCORD_CLIENT_SECRET=your-discord-client-secret
   SITE_URL=http://localhost:3000
   UPLOAD_DIR=uploads
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Production Deployment

1. Set up your domain and configure DNS settings.

2. Configure Cloudflare (optional but recommended):
   - Enable Cloudflare for your domain
   - Set up a Cloudflare Tunnel for secure access

3. Create a `.env` file for production:
   ```env
   NEXTAUTH_URL=https://your-domain.com
   NEXTAUTH_SECRET=your-production-secret
   DISCORD_CLIENT_ID=your-discord-client-id
   DISCORD_CLIENT_SECRET=your-discord-client-secret
   SITE_URL=https://your-domain.com
   MONGO_EXPRESS_PASSWORD=your-mongo-express-password
   ```

4. Deploy with Docker Compose:
   ```bash
   docker-compose up -d
   ```

## ShareX Configuration

1. Log in to your ImageUploader instance
2. Go to the settings page
3. Download the ShareX configuration file
4. Import the configuration into ShareX:
   - Open ShareX
   - Destinations -> Custom uploader settings
   - Import -> Select the downloaded file

## API Documentation

### Authentication

All API routes except for authentication and public image serving require authentication.

### Endpoints

- `POST /api/upload`: Upload a new file
  - Requires authentication
  - Accepts multipart/form-data
  - Returns file URL and deletion URL

- `GET /i/[shortUrl]`: Serve an image
  - Public access
  - Tracks view count

- `DELETE /api/images/[id]`: Delete an image
  - Requires authentication
  - Only the owner can delete their images

## Security Considerations

- All uploads require authentication
- Files are stored securely on the host system
- Rate limiting prevents abuse
- File size and type restrictions are enforced
- User roles (admin/user) control access levels

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details
