# Asset Files

This directory should contain:

## Required Files

### tray-icon.png
- Size: 16x16 or 32x32 pixels (will be resized to 16x16)
- Format: PNG with transparency
- Purpose: Menu bar icon
- Design: Simple, monochrome icon that fits Mac's menu bar aesthetic

### icon.icns
- Format: ICNS (Mac app icon format)
- Purpose: Application icon
- Sizes: Should include multiple resolutions (16x16 up to 1024x1024)
- Tool: Use `iconutil` or apps like Icon Composer to create

## Creating Icons

### Generate ICNS from PNG:
```bash
# Create iconset folder
mkdir icon.iconset

# Add PNG files at different sizes (must be exact names):
# icon_16x16.png
# icon_16x16@2x.png
# icon_32x32.png
# icon_32x32@2x.png
# icon_128x128.png
# icon_128x128@2x.png
# icon_256x256.png
# icon_256x256@2x.png
# icon_512x512.png
# icon_512x512@2x.png

# Convert to ICNS
iconutil -c icns icon.iconset
```

### Quick Placeholder Icons

For development, you can create simple placeholder icons:

```bash
# Install ImageMagick if needed
brew install imagemagick

# Create a simple tray icon
convert -size 32x32 xc:transparent \
  -fill black -draw "circle 16,16 16,4" \
  tray-icon.png

# Create a simple app icon (you'll still need to convert to ICNS)
convert -size 1024x1024 xc:"#1677ff" \
  -fill white -pointsize 400 \
  -draw "text 300,650 'C'" \
  icon.png
```
