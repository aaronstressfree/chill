const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

console.log('🔄 Converting SVG tray icons to PNG...\n');

const assetsDir = path.join(__dirname, 'assets');

// Icons to convert with their sizes
const conversions = [
  // Coffee cup (primary icon you want)
  { svg: 'iconTemplate.svg', png: 'iconTemplate.png', size: 16 },
  { svg: 'iconTemplate@2x.svg', png: 'iconTemplate@2x.png', size: 32 },
  
  // Simple C (backup)
  { svg: 'iconTemplate-simple.svg', png: 'iconTemplate-simple.png', size: 16 },
  { svg: 'iconTemplate-simple@2x.svg', png: 'iconTemplate-simple@2x.png', size: 32 },
  
  // Dot (fallback)
  { svg: 'iconTemplate-dot.svg', png: 'iconTemplate-dot.png', size: 16 },
  { svg: 'iconTemplate-dot@2x.svg', png: 'iconTemplate-dot@2x.png', size: 32 }
];

async function convertIcon({ svg, png, size }) {
  const svgPath = path.join(assetsDir, svg);
  const pngPath = path.join(assetsDir, png);
  
  if (!fs.existsSync(svgPath)) {
    console.log(`⚠️  ${svg} not found, skipping...`);
    return;
  }
  
  try {
    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(pngPath);
    
    console.log(`✅ Created ${png} (${size}x${size})`);
  } catch (error) {
    console.error(`❌ Failed to convert ${svg}:`, error.message);
  }
}

async function convertAll() {
  for (const conversion of conversions) {
    await convertIcon(conversion);
  }
  
  console.log('\n✨ Conversion complete!');
  console.log('\n📝 Next steps:');
  console.log('  1. PNG files are now in the assets/ directory');
  console.log('  2. The app will use these PNG files for the tray icon');
  console.log('  3. Restart your app to see the coffee cup icon!');
}

convertAll().catch(console.error);

