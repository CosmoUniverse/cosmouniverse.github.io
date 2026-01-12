const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// Project root directory (one level up from scripts/)
const rootDir = path.join(__dirname, '..');

async function convertStarfieldPattern() {
    try {
        const svgData = fs.readFileSync(path.join(rootDir, 'starfield-pattern.svg'), 'utf8');
        const svgDataUrl = 'data:image/svg+xml;base64,' + Buffer.from(svgData).toString('base64');

        // Create different sizes
        const sizes = [
            { width: 100, height: 100, name: 'starfield-pattern-100x100.png' },
            { width: 1000, height: 1000, name: 'starfield-pattern-1000x1000.png' },
            { width: 1920, height: 1080, name: 'starfield-pattern-fullhd.png' }
        ];

        for (const size of sizes) {
            const canvas = createCanvas(size.width, size.height);
            const ctx = canvas.getContext('2d');

            // Fill with dark background
            ctx.fillStyle = '#0a0e1a';
            ctx.fillRect(0, 0, size.width, size.height);

            const img = await loadImage(svgDataUrl);

            // Tile the pattern
            const tilesX = Math.ceil(size.width / 100);
            const tilesY = Math.ceil(size.height / 100);

            for (let x = 0; x < tilesX; x++) {
                for (let y = 0; y < tilesY; y++) {
                    ctx.drawImage(img, x * 100, y * 100, 100, 100);
                }
            }

            const buffer = canvas.toBuffer('image/png');
            fs.writeFileSync(path.join(rootDir, size.name), buffer);
            console.log(`✓ Created: ${size.name} (${size.width}x${size.height}px)`);
        }

        console.log('\n✓ All starfield pattern images created!');
    } catch (error) {
        console.error('Error:', error.message);
    }
}

convertStarfieldPattern();
