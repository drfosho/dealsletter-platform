const fs = require('fs');

// Read the file
const content = fs.readFileSync('src/app/admin/properties/page.tsx', 'utf8');

// Find the main return statement and the end of component
const lines = content.split('\n');

// Find where the old parsing code starts inside JSX
let inJSX = false;
let openBraces = 0;
let componentEndLine = -1;
let parsingCodeStart = -1;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Look for the return statement
  if (line.includes('return (')) {
    inJSX = true;
  }
  
  // Look for parsing code inside JSX (regex patterns)
  if (inJSX && line.match(/\/\(.*\)\/[igm]/) && line.includes('pattern')) {
    parsingCodeStart = i;
    console.log('Found parsing code at line', i + 1, ':', line.trim());
    break;
  }
}

console.log('Parsing code starts at line:', parsingCodeStart + 1);

// Find the proper closing of the component
let braceCount = 0;
let foundExport = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.includes('export default function AdminPropertiesPage')) {
    foundExport = true;
  }
  
  if (foundExport) {
    // Count braces
    for (const char of line) {
      if (char === '{') braceCount++;
      if (char === '}') braceCount--;
    }
    
    if (braceCount === 0 && line.includes('}')) {
      componentEndLine = i;
      console.log('Component should end at line:', i + 1);
      break;
    }
  }
}

// Find where the duplicate clean structure starts
let cleanStructureStart = -1;
for (let i = parsingCodeStart + 100; i < lines.length; i++) {
  if (lines[i].includes('{/* Import Preview Modal */}') || 
      lines[i].includes('{/* Quick Import Modal */}') ||
      lines[i].includes('<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">')) {
    cleanStructureStart = i;
    console.log('Clean structure starts at line:', i + 1);
    break;
  }
}

console.log('Total lines:', lines.length);