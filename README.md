# Portable Spas NZ - Infographic Generator

AI-powered infographic generator for Portable Spas New Zealand. Uses Gemini 3 Pro Image Preview for generation and Pinecone RAG for technical knowledge enrichment.

## Features

- **AI Image Generation**: Generate professional infographics using Google's Gemini 3 Pro Image Preview model
- **RAG Integration**: Enrich content with technical details from Pinecone assistant
- **Multiple Aspect Ratios**: 10 aspect ratio options (1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9)
- **Multiple Resolutions**: 1K, 2K, and 4K output options
- **Reference Image Library**: Store and reuse reference images for consistent branding
- **Gallery**: Browse and manage previously generated infographics
- **Simple Authentication**: Password-protected access

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Image Generation**: Google Gemini 3 Pro Image Preview
- **RAG**: Pinecone Assistant
- **Storage**: Vercel Blob
- **Hosting**: Vercel

## Setup

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd portable-spas-infographics
npm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Pinecone API Key - Get from https://app.pinecone.io/
PINECONE_API_KEY=your_pinecone_api_key_here

# Google Gemini API Key - Get from https://aistudio.google.com/apikey
GOOGLE_API_KEY=your_google_gemini_api_key_here

# Vercel Blob Storage (automatically provided when deployed to Vercel)
# For local dev, create a Blob store in Vercel dashboard
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token_here

# Simple password for app access
APP_PASSWORD=your_secure_password_here

# Pinecone Assistant Name
PINECONE_ASSISTANT_NAME=portable-spas
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and import your GitHub repository
2. Add environment variables in the Vercel dashboard:
   - `PINECONE_API_KEY`
   - `GOOGLE_API_KEY`
   - `APP_PASSWORD`
   - `PINECONE_ASSISTANT_NAME`
3. Create a Blob store in Vercel Storage (automatically sets `BLOB_READ_WRITE_TOKEN`)
4. Deploy

## Usage

1. **Login**: Enter the password to access the app
2. **Create Infographic**:
   - Paste your content in the text area
   - Optionally select reference images from the library
   - Choose aspect ratio and resolution
   - Toggle RAG enrichment (enabled by default)
   - Click "Generate Infographic"
3. **Manage Gallery**: Click thumbnails to view, download, or delete previous generations
4. **Reference Images**: Upload images to the library for reuse across generations

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth` | POST | Authenticate with password |
| `/api/auth` | GET | Check authentication status |
| `/api/auth` | DELETE | Logout |
| `/api/context` | POST | Query Pinecone for RAG context |
| `/api/generate` | POST | Generate infographic |
| `/api/infographics` | GET | List all infographics |
| `/api/infographics` | DELETE | Delete an infographic |
| `/api/reference-images` | GET | List reference images |
| `/api/reference-images` | POST | Upload reference image |
| `/api/reference-images` | DELETE | Delete reference image |

## Aspect Ratios & Resolutions

| Ratio | 1K | 2K | 4K |
|-------|----|----|----|
| 1:1 | 1024x1024 | 2048x2048 | 4096x4096 |
| 2:3 | 848x1264 | 1696x2528 | 3392x5056 |
| 3:2 | 1264x848 | 2528x1696 | 5056x3392 |
| 3:4 | 896x1200 | 1792x2400 | 3584x4800 |
| 4:3 | 1200x896 | 2400x1792 | 4800x3584 |
| 4:5 | 928x1152 | 1856x2304 | 3712x4608 |
| 5:4 | 1152x928 | 2304x1856 | 4608x3712 |
| 9:16 | 768x1376 | 1536x2752 | 3072x5504 |
| 16:9 | 1376x768 | 2752x1536 | 5504x3072 |
| 21:9 | 1584x672 | 3168x1344 | 6336x2688 |

## License

Private - Portable Spas New Zealand
