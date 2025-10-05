# Chill Website

A simple, beautiful static website for the Chill app download page.

## Hosting Options

This is a pure static website (HTML, CSS, JS) that can be hosted **for free** on any of these platforms:

### 1. GitHub Pages (Recommended - Easiest)

1. Create a new repository (e.g., `chill-website`)
2. Push the contents of this `website` folder to the repository
3. Go to repository Settings → Pages
4. Select branch `main` and folder `/` (root)
5. Your site will be live at `https://yourusername.github.io/chill-website`

### 2. Netlify (Great for custom domains)

1. Go to [netlify.com](https://netlify.com) and sign up
2. Click "Add new site" → "Import an existing project"
3. Connect to your Git repository or drag & drop this folder
4. Deploy! Your site will be live at `https://your-site-name.netlify.app`
5. Optional: Add a custom domain for free

### 3. Vercel (Similar to Netlify)

1. Go to [vercel.com](https://vercel.com) and sign up
2. Click "New Project"
3. Import your Git repository or upload this folder
4. Deploy! Your site will be live at `https://your-site-name.vercel.app`

### 4. Cloudflare Pages

1. Go to [pages.cloudflare.com](https://pages.cloudflare.com)
2. Create a new project
3. Connect your Git repository or upload files
4. Deploy! Includes free CDN and DDoS protection

## Hosting the Download Files

Currently, the download links point to `./downloads/` which doesn't exist yet. You have several options:

### Option 1: Host Files with the Website
1. Create a `downloads` folder in this directory
2. Copy your DMG and ZIP files from `/release/` to `downloads/`
3. Deploy everything together

### Option 2: Use GitHub Releases (Recommended)
1. Create a GitHub repository for your app
2. Create a new Release
3. Upload your DMG and ZIP files as release assets
4. Update the download URLs in `index.html` to point to the GitHub release URLs
   - Example: `https://github.com/yourusername/chill/releases/download/v1.0.0/Chill-1.0.0-arm64.dmg`

### Option 3: Use a CDN
- Upload files to a service like:
  - Cloudflare R2 (free tier)
  - Backblaze B2 (free tier)
  - AWS S3 (pay as you go)
- Update the URLs in `index.html`

## Setup Instructions

1. **Update GitHub Link:**
   - Open `index.html`
   - Replace `https://github.com/yourusername/chill` with your actual GitHub URL
   - (Or remove the GitHub section if you don't want to link to source code)

2. **Update Download URLs:**
   - Decide where you'll host the DMG/ZIP files
   - Update all download links in `index.html` with the correct URLs

3. **Optional: Add Analytics:**
   - Add Google Analytics, Plausible, or similar to track downloads
   - Insert tracking code in `index.html` before `</head>`

4. **Test Locally:**
   ```bash
   # Simple Python server
   python3 -m http.server 8000
   
   # Or use any local server
   # Then visit http://localhost:8000
   ```

5. **Deploy:**
   - Follow one of the hosting options above
   - Your site will be live in minutes!

## Customization

All styling is in `styles.css` with CSS custom properties at the top for easy theme changes:

- Colors: `--color-*` variables
- Spacing: `--spacing-*` variables
- Typography: `--font-size-*` variables
- Border radius: `--radius-*` variables

## Features

- ✨ Beautiful, modern design
- 📱 Fully responsive (mobile → desktop)
- ⚡ Fast loading (no frameworks)
- 🎨 Inter font family
- 🌙 Dark theme
- ♿ Accessible HTML
- 🔍 SEO friendly
- 📊 Analytics ready

## File Structure

```
website/
├── index.html       # Main HTML file
├── styles.css       # All styling
├── script.js        # Interactivity
└── README.md        # This file
```

## Cost Breakdown

- **Hosting**: $0 (GitHub Pages, Netlify, Vercel, or Cloudflare Pages)
- **Domain** (optional): ~$10-15/year
- **File storage**: $0 (if using GitHub Releases)
- **Bandwidth**: $0 (all platforms have generous free tiers)

**Total: FREE** (or ~$12/year with custom domain)

## Support

For issues with the website, contact your repository maintainer.

