const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

console.log('☕ Creating Chill app icon...\n');

// Create a beautiful coffee cup icon for the app
const createAppIconSVG = (size) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cupGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#8B4513;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#654321;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="steamGradient" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" style="stop-color:#999999;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#CCCCCC;stop-opacity:0.3" />
    </linearGradient>
    <radialGradient id="coffeeGradient" cx="50%" cy="30%">
      <stop offset="0%" style="stop-color:#6F4E37;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#4A3424;stop-opacity:1" />
    </radialGradient>
  </defs>
  
  <!-- Background circle with gradient -->
  <circle cx="${size/2}" cy="${size/2}" r="${size * 0.48}" fill="url(#cupGradient)"/>
  
  <!-- Steam lines (wavy and elegant) -->
  <g opacity="0.7">
    <path d="M ${size * 0.35} ${size * 0.15} Q ${size * 0.33} ${size * 0.2} ${size * 0.35} ${size * 0.25} Q ${size * 0.37} ${size * 0.3} ${size * 0.35} ${size * 0.35}" 
          stroke="url(#steamGradient)" stroke-width="${size * 0.02}" fill="none" stroke-linecap="round"/>
    <path d="M ${size * 0.5} ${size * 0.1} Q ${size * 0.48} ${size * 0.15} ${size * 0.5} ${size * 0.2} Q ${size * 0.52} ${size * 0.25} ${size * 0.5} ${size * 0.3}" 
          stroke="url(#steamGradient)" stroke-width="${size * 0.02}" fill="none" stroke-linecap="round"/>
    <path d="M ${size * 0.65} ${size * 0.15} Q ${size * 0.67} ${size * 0.2} ${size * 0.65} ${size * 0.25} Q ${size * 0.63} ${size * 0.3} ${size * 0.65} ${size * 0.35}" 
          stroke="url(#steamGradient)" stroke-width="${size * 0.02}" fill="none" stroke-linecap="round"/>
  </g>
  
  <!-- Cup body with gradient -->
  <path d="M ${size * 0.28} ${size * 0.4} 
           L ${size * 0.28} ${size * 0.7} 
           Q ${size * 0.28} ${size * 0.8} ${size * 0.35} ${size * 0.82}
           L ${size * 0.65} ${size * 0.82}
           Q ${size * 0.72} ${size * 0.8} ${size * 0.72} ${size * 0.7}
           L ${size * 0.72} ${size * 0.4}
           Z"
        fill="#FFFFFF" opacity="0.95"/>
  
  <!-- Coffee inside cup -->
  <ellipse cx="${size * 0.5}" cy="${size * 0.43}" rx="${size * 0.2}" ry="${size * 0.04}" fill="url(#coffeeGradient)"/>
  
  <!-- Cup handle -->
  <path d="M ${size * 0.72} ${size * 0.5}
           Q ${size * 0.85} ${size * 0.5} ${size * 0.85} ${size * 0.62}
           Q ${size * 0.85} ${size * 0.72} ${size * 0.75} ${size * 0.72}
           L ${size * 0.72} ${size * 0.72}
           L ${size * 0.72} ${size * 0.67}
           L ${size * 0.75} ${size * 0.67}
           Q ${size * 0.78} ${size * 0.67} ${size * 0.78} ${size * 0.62}
           Q ${size * 0.78} ${size * 0.55} ${size * 0.75} ${size * 0.55}
           L ${size * 0.72} ${size * 0.55}
           Z"
        fill="#FFFFFF" opacity="0.9"/>
  
  <!-- Saucer -->
  <ellipse cx="${size * 0.5}" cy="${size * 0.83}" rx="${size * 0.28}" ry="${size * 0.05}" fill="#FFFFFF" opacity="0.85"/>
</svg>`;

const assetsDir = path.join(__dirname, 'assets');
const iconSetDir = path.join(__dirname, 'icon.iconset');

// Create iconset directory
if (!fs.existsSync(iconSetDir)) {
  fs.mkdirSync(iconSetDir, { recursive: true });
}

// Generate high-res SVG
const svgContent = createAppIconSVG(1024);
const svgPath = path.join(assetsDir, 'app-icon.svg');
fs.writeFileSync(svgPath, svgContent);
console.log('✅ Created app-icon.svg');

// Icon sizes needed for macOS .icns
const iconSizes = [
  { size: 16, name: 'icon_16x16.png' },
  { size: 32, name: 'icon_16x16@2x.png' },
  { size: 32, name: 'icon_32x32.png' },
  { size: 64, name: 'icon_32x32@2x.png' },
  { size: 128, name: 'icon_128x128.png' },
  { size: 256, name: 'icon_128x128@2x.png' },
  { size: 256, name: 'icon_256x256.png' },
  { size: 512, name: 'icon_256x256@2x.png' },
  { size: 512, name: 'icon_512x512.png' },
  { size: 1024, name: 'icon_512x512@2x.png' }
];

async function generateIcons() {
  console.log('\n📐 Generating PNG icons at multiple sizes...');
  
  for (const { size, name } of iconSizes) {
    const outputPath = path.join(iconSetDir, name);
    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`  ✓ ${name} (${size}x${size})`);
  }
  
  console.log('\n🎨 Icon set complete!');
  console.log('\n📝 Next step: Convert to .icns');
  console.log('   Run: iconutil -c icns icon.iconset');
  console.log('   This will create icon.icns in the current directory');
  console.log('\n💡 Or on this Mac, the script can do it automatically...');
}

generateIcons().catch(console.error);

