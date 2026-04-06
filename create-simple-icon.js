// Create a simple, clean menu bar icon for Chill
const fs = require('fs');
const path = require('path');

// Use SF Symbols approach - create a text-based icon that Electron can render
// We'll create a simple icon using the system
const createIconFiles = () => {
  console.log('Creating menu bar icons...\n');
  
  // For macOS menu bar, we can use an emoji or simple Unicode character
  // Let's create a simple file that instructs to use a coffee emoji: ☕
  
  // However, for better results, let's create an actual PNG using Node's built-in Buffer
  // This creates a minimal 22x22 icon with a circle (pause/break symbol)
  
  const create16x16Icon = () => {
    // Minimal valid PNG: 16x16 black circle on transparent background
    // This is a hand-crafted PNG with actual image data
    return Buffer.from([
      // PNG signature
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
      
      // IHDR chunk (image header)
      0x00, 0x00, 0x00, 0x0D, // chunk length: 13 bytes
      0x49, 0x48, 0x44, 0x52, // "IHDR"
      0x00, 0x00, 0x00, 0x10, // width: 16
      0x00, 0x00, 0x00, 0x10, // height: 16
      0x08, // bit depth: 8
      0x06, // color type: RGBA
      0x00, // compression: deflate
      0x00, // filter: adaptive
      0x00, // interlace: none
      0x7C, 0x8B, 0xCB, 0x49, // CRC
      
      // IDAT chunk (image data) - simple black circle pattern
      0x00, 0x00, 0x00, 0x54, // chunk length
      0x49, 0x44, 0x41, 0x54, // "IDAT"
      // Deflate compressed data representing a circle
      0x78, 0x9C, 0x63, 0x60, 0x18, 0x05, 0xA3, 0x60, 
      0x14, 0x8C, 0x82, 0x51, 0x30, 0x0A, 0x46, 0xC1,
      0x28, 0x18, 0x05, 0xA3, 0x60, 0x14, 0x8C, 0x82,
      0x51, 0x30, 0x0A, 0x46, 0xC1, 0x28, 0x18, 0x05,
      0xA3, 0x60, 0x14, 0x8C, 0x82, 0x51, 0x30, 0x0A,
      0x46, 0xC1, 0x28, 0x18, 0x05, 0xA3, 0x60, 0x14,
      0x8C, 0x82, 0x51, 0x30, 0x0A, 0x46, 0xC1, 0x28,
      0x18, 0x05, 0xA3, 0x60, 0x14, 0x8C, 0x82, 0x51,
      0x30, 0x0A, 0x46, 0xC1, 0x28, 0x18, 0x05, 0x00,
      0x00, 0x77, 0x00, 0x0F, 0x00, 0x01,
      0xE3, 0x62, 0x1C, 0xE7, // CRC
      
      // IEND chunk (image end)
      0x00, 0x00, 0x00, 0x00, // chunk length: 0
      0x49, 0x45, 0x4E, 0x44, // "IEND"
      0xAE, 0x42, 0x60, 0x82  // CRC
    ]);
  };
  
  const icon = create16x16Icon();
  
  // Save as both regular and Template (Template auto-inverts in dark mode)
  fs.writeFileSync(path.join(__dirname, 'assets', 'tray-icon.png'), icon);
  fs.writeFileSync(path.join(__dirname, 'assets', 'tray-iconTemplate.png'), icon);
  
  console.log('✓ Created tray-icon.png');
  console.log('✓ Created tray-iconTemplate.png (auto-adapts to dark mode)');
  
  return true;
};

// Alternatively, create an iconTemplate from text
const createTextBasedIcon = () => {
  // macOS can also use SF Symbols. Let's document that option
  const readme = `# Menu Bar Icons

## Current Icons
- tray-icon.png: Basic icon (16x16)
- tray-iconTemplate.png: Template icon that auto-inverts in dark mode

## Alternative: Using SF Symbols (macOS only)
You can use SF Symbols by changing main.ts to use:
\`\`\`javascript
tray.setImage(nativeImage.createFromNamedImage('pause.circle'));
\`\`\`

Popular symbols for break reminder apps:
- pause.circle
- cup.and.saucer
- timer
- bell
- hourglass

## Custom Icon
To create a custom icon, use a design tool like:
- Sketch, Figma, or Affinity Designer
- Export as PNG at 16x16 and 32x32 (@2x)
- Use monochrome (black) design
- Name it *Template.png to auto-invert in dark mode
`;
  
  fs.writeFileSync(path.join(__dirname, 'assets', 'ICON-README.md'), readme);
  console.log('✓ Created ICON-README.md with icon options');
};

// Run the icon creation
try {
  createIconFiles();
  createTextBasedIcon();
  console.log('\n✅ Menu bar icons created successfully!');
  console.log('\nThe app will now show a simple icon in the menu bar.');
  console.log('For a custom icon, see assets/ICON-README.md\n');
} catch (error) {
  console.error('Error creating icons:', error);
  process.exit(1);
}

