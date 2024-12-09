const fs = require('fs');
const path = require('path');

const tempDir = path.join(__dirname, '..', 'temp');

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
  console.log('Created temp directory');
}
