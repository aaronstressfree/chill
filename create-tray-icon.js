const fs = require('fs');
const path = require('path');

// Create a simple SVG for a coffee cup icon (menu bar style)
const createMenuBarSVG = (size) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Coffee cup icon optimized for menu bar -->
  <g fill="black">
    <!-- Cup body -->
    <path d="M ${size * 0.25} ${size * 0.35} 
             L ${size * 0.25} ${size * 0.7} 
             Q ${size * 0.25} ${size * 0.85} ${size * 0.35} ${size * 0.85}
             L ${size * 0.65} ${size * 0.85}
             Q ${size * 0.75} ${size * 0.85} ${size * 0.75} ${size * 0.7}
             L ${size * 0.75} ${size * 0.35}
             Z"/>
    
    <!-- Handle -->
    <path d="M ${size * 0.75} ${size * 0.45}
             Q ${size * 0.9} ${size * 0.45} ${size * 0.9} ${size * 0.6}
             Q ${size * 0.9} ${size * 0.7} ${size * 0.8} ${size * 0.7}
             L ${size * 0.75} ${size * 0.7}
             L ${size * 0.75} ${size * 0.6}
             L ${size * 0.8} ${size * 0.6}
             Q ${size * 0.82} ${size * 0.6} ${size * 0.82} ${size * 0.55}
             Q ${size * 0.82} ${size * 0.5} ${size * 0.8} ${size * 0.5}
             L ${size * 0.75} ${size * 0.5}
             Z"/>
    
    <!-- Steam lines (3 wavy lines) -->
    <path d="M ${size * 0.35} ${size * 0.15}
             Q ${size * 0.35} ${size * 0.25} ${size * 0.37} ${size * 0.3}"
          stroke="black" stroke-width="${size * 0.05}" fill="none" stroke-linecap="round"/>
    <path d="M ${size * 0.5} ${size * 0.1}
             Q ${size * 0.5} ${size * 0.2} ${size * 0.52} ${size * 0.25}"
          stroke="black" stroke-width="${size * 0.05}" fill="none" stroke-linecap="round"/>
    <path d="M ${size * 0.65} ${size * 0.15}
             Q ${size * 0.65} ${size * 0.25} ${size * 0.67} ${size * 0.3}"
          stroke="black" stroke-width="${size * 0.05}" fill="none" stroke-linecap="round"/>
  </g>
</svg>`;

// Simple alternative: Circle with "C" for Chill
const createSimpleSVG = (size) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Simple "C" icon for Chill -->
  <g fill="black">
    <!-- Outer circle (C shape) -->
    <path d="M ${size * 0.75} ${size * 0.5}
             A ${size * 0.35} ${size * 0.35} 0 1 1 ${size * 0.75} ${size * 0.49}
             L ${size * 0.65} ${size * 0.49}
             A ${size * 0.25} ${size * 0.25} 0 1 0 ${size * 0.65} ${size * 0.5}
             Z"/>
  </g>
</svg>`;

// Even simpler: just a filled circle
const createDotSVG = (size) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <circle cx="${size/2}" cy="${size/2}" r="${size * 0.35}" fill="black"/>
</svg>`;

console.log('🎨 Creating macOS menu bar icon assets...\n');

const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Create both sizes for Retina displays
const iconSizes = [
  { size: 16, suffix: '' },      // Standard resolution
  { size: 32, suffix: '@2x' }    // Retina resolution
];

iconSizes.forEach(({ size, suffix }) => {
  // Coffee cup version
  const coffeeSVG = createMenuBarSVG(size);
  const coffeeFilename = `iconTemplate${suffix}.svg`;
  fs.writeFileSync(path.join(assetsDir, coffeeFilename), coffeeSVG);
  console.log(`✅ Created ${coffeeFilename} (${size}x${size})`);
  
  // Simple C version (backup)
  const simpleSVG = createSimpleSVG(size);
  const simpleFilename = `iconTemplate-simple${suffix}.svg`;
  fs.writeFileSync(path.join(assetsDir, simpleFilename), simpleSVG);
  console.log(`✅ Created ${simpleFilename} (${size}x${size})`);
  
  // Dot version (most reliable)
  const dotSVG = createDotSVG(size);
  const dotFilename = `iconTemplate-dot${suffix}.svg`;
  fs.writeFileSync(path.join(assetsDir, dotFilename), dotSVG);
  console.log(`✅ Created ${dotFilename} (${size}x${size})`);
});

console.log('\n📝 Icon files created in:', assetsDir);
console.log('\n💡 macOS Menu Bar Icon Requirements:');
console.log('  • Black foreground with transparency');
console.log('  • Named with "Template" for auto light/dark mode');
console.log('  • Standard (16x16) and Retina (@2x, 32x32)');
console.log('  • Simple, clear design that works at small size');
console.log('\n🎯 Three versions created:');
console.log('  1. iconTemplate*.svg - Coffee cup (most detailed)');
console.log('  2. iconTemplate-simple*.svg - "C" letter (clean)');
console.log('  3. iconTemplate-dot*.svg - Dot (most reliable)');
console.log('\n✨ The app will automatically use these icons!');
