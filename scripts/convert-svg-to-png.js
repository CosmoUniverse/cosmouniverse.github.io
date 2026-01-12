const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// Project root directory (one level up from scripts/)
const rootDir = path.join(__dirname, '..');

async function convertSvgToPng() {
    try {
        // Read SVG file
        const svgData = fs.readFileSync(path.join(rootDir, 'background-pattern.svg'), 'utf8');

        // Create a data URL
        const svgDataUrl = 'data:image/svg+xml;base64,' + Buffer.from(svgData).toString('base64');

        // Create canvas (you can adjust size - this creates a larger version)
        const canvas = createCanvas(1200, 1200);
        const ctx = canvas.getContext('2d');

        // Load and draw SVG
        const img = await loadImage(svgDataUrl);

        // Fill with transparent background
        ctx.clearRect(0, 0, 1200, 1200);

        // Draw SVG tiled 10x10 times for a pattern
        for (let x = 0; x < 10; x++) {
            for (let y = 0; y < 10; y++) {
                ctx.drawImage(img, x * 120, y * 120, 120, 120);
            }
        }

        // Save as PNG
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(path.join(rootDir, 'background-pattern.png'), buffer);
        console.log('✓ PNG file created: background-pattern.png (1200x1200px)');

        // Also create a single tile version
        const smallCanvas = createCanvas(120, 120);
        const smallCtx = smallCanvas.getContext('2d');
        smallCtx.drawImage(img, 0, 0, 120, 120);
        const smallBuffer = smallCanvas.toBuffer('image/png');
        fs.writeFileSync(path.join(rootDir, 'background-pattern-tile.png'), smallBuffer);
        console.log('✓ Tile PNG created: background-pattern-tile.png (120x120px)');

    } catch (error) {
        console.error('Error:', error.message);
    }
}

convertSvgToPng();
