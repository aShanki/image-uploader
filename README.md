# Image Uploader

An Imgur-style image hosting application built with Next.js 15 and Go.

## Features

- User authentication
- Image upload with preview
- Responsive image grid
- Copy image URL functionality
- Sort by upload date
- Image deletion
- Support for jpg, png, gif, and webp formats
- Image optimization and thumbnails
- Cloudflare Tunnel integration

## Prerequisites

- Node.js 18+
- Go 1.21+
- Docker and Docker Compose (for production deployment)

## Development Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd image-uploader
```

2. Install dependencies:
```bash
npm install
cd frontend && npm install
cd ../backend && go mod download
```

3. Create .env.local in the frontend directory:
```bash
NEXT_PUBLIC_API_URL=http://localhost:4001
AUTH_USERNAME=admin
AUTH_PASSWORD=your_secure_password
```

4. Start the development servers:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:4001
- Backend API: http://localhost:4001/api

## Testing

Run end-to-end tests with Playwright:

```bash
npm run test:e2e
```

To view tests in UI mode:
```bash
npm run test:e2e:ui
```

## Production Deployment

1. Build and start the Docker containers:
```bash
docker-compose up --build
```

2. The application will be available at http://localhost:4001

3. Configure your Cloudflare Tunnel to point to http://localhost:4001

## Directory Structure

```
.
├── backend/                 # Go backend server
│   ├── main.go            # Main application entry
│   └── Dockerfile         # Backend container configuration
├── frontend/              # Next.js frontend
│   ├── src/              # Source code
│   ├── tests/            # Playwright tests
│   └── Dockerfile        # Frontend container configuration
└── docker-compose.yml    # Docker composition configuration
```

## Environment Variables

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `AUTH_USERNAME`: Admin username
- `AUTH_PASSWORD`: Admin password

### Backend
- `CORS_ALLOWED_ORIGINS`: Allowed CORS origins

## API Endpoints

- `POST /api/upload`: Upload image
- `GET /api/images`: List all images
- `DELETE /api/images/{id}`: Delete image
- `GET /images/{filename}`: Serve image files

## License

MIT