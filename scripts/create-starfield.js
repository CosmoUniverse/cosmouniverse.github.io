const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Project root directory (one level up from scripts/)
const rootDir = path.join(__dirname, '..');

function createStarfield(width, height, starCount, filename) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Dark blue/black gradient background (like the screenshot)
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#0a0e1a');    // Dark blue-black top
    gradient.addColorStop(0.5, '#1a1f2e'); // Slightly lighter middle
    gradient.addColorStop(1, '#0f1419');    // Very dark bottom

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add stars
    for (let i = 0; i < starCount; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 2 + 0.5; // Star size between 0.5 and 2.5
        const opacity = Math.random() * 0.5 + 0.5; // Opacity between 0.5 and 1

        // Draw star
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();

        // Add occasional glow for some stars
        if (Math.random() > 0.95) {
            const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
            glowGradient.addColorStop(0, `rgba(255, 255, 255, ${opacity * 0.3})`);
            glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(x, y, size * 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Save as PNG to project root
    const outputPath = path.join(rootDir, filename);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    console.log(`✓ Created: ${filename} (${width}x${height}px with ${starCount} stars)`);
}

// Create different versions
createStarfield(1920, 1080, 300, 'starfield-background.png');       // Full HD background
createStarfield(512, 512, 80, 'starfield-tile.png');                // Tileable pattern
createStarfield(2560, 1440, 500, 'starfield-background-2k.png');    // 2K background

console.log('\n✓ All starfield backgrounds created successfully!');
