const fs = require('fs');
const content = fs.readFileSync('c:/Projects/TravellerArchitect/docs/02 - 2300AD - Book 1 Characters amd Equipment.md', 'utf-8');
const lines = content.split(/\r?\n/);

let currentSection = '';
let currentCategory = '';
let items = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  if (line.startsWith('## ')) {
    currentCategory = line.substring(3).trim();
  }
  
  if (line.startsWith('### ')) {
    currentSection = line.substring(4).trim();
  }
  
  // Look for items: usually a bolded name followed by a description
  // e.g. **Item Name** – Description
  // Or table rows
  if (line.startsWith('|') && !line.includes('---')) {
    // console.log(`Cat: ${currentCategory}, Sec: ${currentSection}, Table row: ${line}`);
  }
  
  const match = line.match(/^\*\*([^\*]+)\*\*(.*)/);
  if (match) {
    const name = match[1].trim();
    const desc = match[2].trim().replace(/^[\s–-]+/, '');
    items.push({ category: currentCategory, section: currentSection, name, desc });
  }
}

console.log(`Found ${items.length} items from paragraphs.`);
// Write to a temp file to inspect
fs.writeFileSync('c:/Projects/TravellerArchitect/temp_parsed.json', JSON.stringify(items, null, 2));
