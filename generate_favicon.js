const fs = require('fs');
const path = require('path');

// Paths
const fontPath = path.join(__dirname, 'fonts', 'lucia-bt', 'Lucia BT.ttf');
const outputPath = path.join(__dirname, 'images', 'favicon.svg');

try {
  // Read font file and convert to base64
  const fontBuffer = fs.readFileSync(fontPath);
  const fontBase64 = fontBuffer.toString('base64');

  // Define SVG content with embedded font
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <defs>
    <style>
      @font-face {
        font-family: 'Lucia BT';
        src: url('data:font/ttf;base64,${fontBase64}') format('truetype');
        font-weight: normal;
        font-style: normal;
      }
      .bg-circle {
        fill: #322325; /* Brand Charcoal */
      }
      .border-circle {
        fill: none;
        stroke: #C08B5D; /* Brand Gold */
        stroke-width: 3;
      }
      .logo-letter {
        font-family: 'Lucia BT', 'Alex Brush', cursive;
        fill: #D4AF7A; /* Soft Warm Gold */
        font-size: 86px;
        text-anchor: middle;
        dominant-baseline: central;
      }
    </style>
  </defs>
  <!-- Brand Charcoal Circle Background -->
  <circle cx="64" cy="64" r="62" class="bg-circle" />
  
  <!-- Subtle Gold Inner Border -->
  <circle cx="64" cy="64" r="54" class="border-circle" />
  
  <!-- Centered Cursive Letter 'A' -->
  <text x="63" y="65" class="logo-letter">A</text>
</svg>
`;

  // Ensure images directory exists
  const imagesDir = path.dirname(outputPath);
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  // Write SVG file
  fs.writeFileSync(outputPath, svgContent, 'utf8');
  console.log(`Favicon SVG generated successfully at: ${outputPath}`);
} catch (error) {
  console.error('Error generating favicon:', error.message);
  process.exit(1);
}
