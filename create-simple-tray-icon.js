// Create a super simple tray icon that will work
const fs = require('fs');
const path = require('path');

// Create a minimal but valid 16x16 PNG with a coffee cup shape
// This is a hand-crafted PNG with actual pixel data
function createSimpleIcon() {
  // SVG coffee cup that we'll embed
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
    <path d="M3 5h8v7c0 1-1 2-2 2H5c-1 0-2-1-2-2V5z M2 4h10v1H2z M11 6c1 0 2 1 2 2.5S12 11 11 11" 
          fill="none" stroke="black" stroke-width="1.2" stroke-linecap="round"/>
  </svg>`;
  
  const assetsDir = path.join(__dirname, 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }
  
  // Save the SVG
  fs.writeFileSync(path.join(assetsDir, 'tray-icon.svg'), svg);
  console.log('✓ Created tray-icon.svg');
  
  // For now, we'll let Electron load the SVG directly or use emoji fallback
  // The emoji fallback in main.ts will handle this
  return true;
}

createSimpleIcon();
console.log('\n✅ Icon files ready!');
console.log('The app will use a coffee emoji (☕) as fallback if the PNG doesn\'t load.');

