const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

const dir = 'C:/Users/san84/philo-mobile/수능영어_PDF_모음';

async function main() {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.pdf'));

  // Skip files that already have clear names (2023*, 2024*, 2025*)
  const targetFiles = files.filter(f => !f.match(/^202[345]/));

  const results = [];

  for (const fname of targetFiles) {
    const filePath = path.join(dir, fname);
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer, { max: 1 }); // only first page
      const text = data.text.substring(0, 500); // first 500 chars
      results.push({ fname, text, pages: data.numpages });
    } catch (e) {
      results.push({ fname, text: `ERROR: ${e.message}`, pages: 0 });
    }
  }

  // Output results as JSON
  console.log(JSON.stringify(results, null, 2));
}

main().catch(console.error);
