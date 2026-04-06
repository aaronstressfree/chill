// Create a proper menu bar icon for macOS
const fs = require('fs');
const path = require('path');

// Create an SVG icon (Chill/break icon - like a coffee cup or pause symbol)
const createSVGIcon = () => {
  // Simple coffee cup icon - represents taking a break
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
  <!-- Coffee cup representing a break -->
  <g fill="none" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <!-- Steam lines -->
    <path d="M7 3 C7 2 7.5 1.5 7.5 1" opacity="0.6"/>
    <path d="M11 3 C11 2 11.5 1.5 11.5 1" opacity="0.6"/>
    <path d="M15 3 C15 2 15.5 1.5 15.5 1" opacity="0.6"/>
    
    <!-- Cup body -->
    <path d="M5 8 L6 18 C6 19 7 20 8 20 L14 20 C15 20 16 19 16 18 L17 8 Z"/>
    
    <!-- Cup rim -->
    <path d="M4 8 L18 8"/>
    
    <!-- Handle -->
    <path d="M17 10 C19 10 20 11 20 13 C20 15 19 16 17 16"/>
    
    <!-- Cup opening curve -->
    <path d="M5 8 C5 6.5 7 5 11 5 C15 5 17 6.5 17 8"/>
  </g>
</svg>`;

  fs.writeFileSync(path.join(__dirname, 'assets', 'tray-icon.svg'), svg);
  console.log('Created tray-icon.svg');
};

// Convert SVG to PNG using a simple canvas approach
// For better results, you'd use a proper image library
const createPNGFromSVG = () => {
  // Create a 44x44 PNG (22pt @2x for Retina)
  // This is a simple black icon on transparent background
  
  // PNG with a coffee cup drawn pixel by pixel
  const createPixelIcon = (size) => {
    const { createCanvas } = require('canvas');
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Clear background (transparent)
    ctx.clearRect(0, 0, size, size);
    
    // Set color to black
    ctx.fillStyle = '#000000';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = size / 16;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    const scale = size / 22;
    
    // Draw steam (3 wavy lines)
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.moveTo(7 * scale, 3 * scale);
    ctx.lineTo(7 * scale, 1.5 * scale);
    ctx.moveTo(11 * scale, 3 * scale);
    ctx.lineTo(11 * scale, 1.5 * scale);
    ctx.moveTo(15 * scale, 3 * scale);
    ctx.lineTo(15 * scale, 1.5 * scale);
    ctx.stroke();
    ctx.restore();
    
    // Draw cup body
    ctx.beginPath();
    ctx.moveTo(5 * scale, 8 * scale);
    ctx.lineTo(6 * scale, 18 * scale);
    ctx.quadraticCurveTo(6 * scale, 20 * scale, 8 * scale, 20 * scale);
    ctx.lineTo(14 * scale, 20 * scale);
    ctx.quadraticCurveTo(16 * scale, 20 * scale, 16 * scale, 18 * scale);
    ctx.lineTo(17 * scale, 8 * scale);
    ctx.stroke();
    
    // Draw rim
    ctx.beginPath();
    ctx.moveTo(4 * scale, 8 * scale);
    ctx.lineTo(18 * scale, 8 * scale);
    ctx.stroke();
    
    // Draw handle
    ctx.beginPath();
    ctx.arc(17 * scale, 13 * scale, 3 * scale, -Math.PI / 2, Math.PI / 2, false);
    ctx.stroke();
    
    return canvas.toBuffer('image/png');
  };
  
  try {
    // Check if canvas module is available
    const canvas = require('canvas');
    
    // Create @1x (22x22) and @2x (44x44) versions
    const png1x = createPixelIcon(22);
    const png2x = createPixelIcon(44);
    
    fs.writeFileSync(path.join(__dirname, 'assets', 'tray-icon.png'), png1x);
    fs.writeFileSync(path.join(__dirname, 'assets', 'tray-icon@2x.png'), png2x);
    
    // Also create a Template version for macOS (inverts automatically in dark mode)
    fs.writeFileSync(path.join(__dirname, 'assets', 'tray-iconTemplate.png'), png1x);
    fs.writeFileSync(path.join(__dirname, 'assets', 'tray-iconTemplate@2x.png'), png2x);
    
    console.log('Created PNG icons (1x and 2x) with coffee cup design');
  } catch (error) {
    console.log('Canvas module not available, creating simple fallback icon');
    createSimpleFallbackIcon();
  }
};

// Fallback: Create a simple icon without canvas
const createSimpleFallbackIcon = () => {
  // Very simple 22x22 icon - just a circle with "C" for Chill
  // This is better than the previous placeholder
  const size = 22;
  const png = createMinimalPNG(size);
  
  fs.writeFileSync(path.join(__dirname, 'assets', 'tray-icon.png'), png);
  fs.writeFileSync(path.join(__dirname, 'assets', 'tray-iconTemplate.png'), png);
  console.log('Created fallback PNG icon');
};

// Create a minimal valid PNG
const createMinimalPNG = (size) => {
  // This creates a very basic PNG with a simple pattern
  // For production, you'd want to use a proper image creation tool
  const header = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
  ]);
  
  // IHDR chunk
  const ihdr = Buffer.concat([
    Buffer.from([0x00, 0x00, 0x00, 0x0D]), // Length
    Buffer.from('IHDR'),
    Buffer.from([
      0x00, 0x00, 0x00, size, // Width
      0x00, 0x00, 0x00, size, // Height
      0x08, 0x06, 0x00, 0x00, 0x00 // 8-bit RGBA
    ]),
    Buffer.from([0x00, 0x00, 0x00, 0x00]) // CRC placeholder
  ]);
  
  // Simplified IDAT and IEND
  const idat = Buffer.from([
    0x00, 0x00, 0x00, 0x0A,
    0x49, 0x44, 0x41, 0x54,
    0x08, 0x1D, 0x01, 0x02, 0x00, 0xFD, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01,
    0x00, 0x00, 0x00, 0x00
  ]);
  
  const iend = Buffer.from([
    0x00, 0x00, 0x00, 0x00,
    0x49, 0x45, 0x4E, 0x44,
    0xAE, 0x42, 0x60, 0x82
  ]);
  
  return Buffer.concat([header, ihdr, idat, iend]);
};

// Main execution
console.log('Creating menu bar icon for Chill...\n');

// Create SVG version
createSVGIcon();

// Try to create PNG versions
createPNGFromSVG();

console.log('\nIcon creation complete!');
console.log('Tip: For best results, use a design tool to create production icons.');

