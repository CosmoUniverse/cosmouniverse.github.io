const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
const cheerio = require('cheerio');

const SITE_URL = 'https://www.cosmouniverse.io';
const HTML_FILES_PATTERN = '**/*.html';
const IGNORE_PATTERNS = ['node_modules/**', 'dist/**', 'build/**', '.gemini/**'];

function getUrlPath(filePath) {
    // Convert backslashes to forward slashes for URL consistency
    let relativePath = filePath.replace(/\\/g, '/');
    
    // Split path into segments to encode each segment individually
    const segments = relativePath.split('/');
    const encodedSegments = segments.map(segment => encodeURIComponent(segment));
    
    return encodedSegments.join('/');
}

async function processFile(filePath) {
    console.log(`Processing: ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(content);
    let modified = false;

    // Check/Inject Description
    const metaDescription = $('meta[name="description"]');
    if (metaDescription.length === 0) {
        console.log(`  - Missing description. Generating...`);
        
        let descriptionText = '';
        
        // Try .page-description first
        const pageDesc = $('.page-description').first();
        if (pageDesc.length > 0 && pageDesc.text().trim()) {
             descriptionText = pageDesc.text().trim();
        } else {
            // Fallback to first non-empty paragraph
            $('p').each((i, el) => {
                const text = $(el).text().trim();
                // Check if it has text and is not the empty page-description we already checked
                if (text && !$(el).hasClass('page-description')) {
                    descriptionText = text;
                    return false; // break loop
                }
            });
        }

        if (descriptionText) {
            // Truncate to 160 chars
            if (descriptionText.length > 160) {
                descriptionText = descriptionText.substring(0, 157) + '...';
            }
            
            // Clean up text (remove newlines, extra spaces)
            descriptionText = descriptionText.replace(/\s+/g, ' ').trim();

            $('head').append(`<meta name="description" content="${descriptionText}">`);
            modified = true;
            console.log(`  - Injected: "${descriptionText}"`);
        } else {
            console.log(`  - WARNING: Could not generate description (no content found).`);
        }
    }

    if (modified) {
        fs.writeFileSync(filePath, $.html(), 'utf8');
    }

    // Return metadata for Sitemap
    const stats = fs.statSync(filePath);
    return {
        url: `${SITE_URL}/${getUrlPath(filePath)}`,
        lastMod: stats.mtime.toISOString().split('T')[0] // YYYY-MM-DD
    };
}

function generateSitemap(pages) {
    console.log('Generating sitemap.xml...');
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    pages.forEach(page => {
        xml += '  <url>\n';
        xml += `    <loc>${page.url}</loc>\n`;
        xml += `    <lastmod>${page.lastMod}</lastmod>\n`;
        xml += '  </url>\n';
    });

    xml += '</urlset>';

    fs.writeFileSync('sitemap.xml', xml, 'utf8');
    console.log(`  - Written sitemap.xml with ${pages.length} URLs.`);
}

function generateRobotsTxt() {
    console.log('Generating robots.txt...');
    const content = `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml`;
    fs.writeFileSync('robots.txt', content, 'utf8');
    console.log('  - Written robots.txt');
}

console.log('Starting SEO generation...');

async function scanFiles() {
    return glob(HTML_FILES_PATTERN, { ignore: IGNORE_PATTERNS });
}

async function main() {
    try {
        const files = await scanFiles();
        const pages = [];

        for (const file of files) {
            const pageData = await processFile(file);
            pages.push(pageData);
        }

        generateSitemap(pages);
        generateRobotsTxt();
        
        console.log('SEO generation complete.');

    } catch (error) {
        console.error('Fatal Error:', error);
        process.exit(1);
    }
}

main();