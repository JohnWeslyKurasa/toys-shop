const fs = require('fs');
const css = fs.readFileSync('styles.css', 'utf8');

const lines = css.split('\n');
lines.forEach((line, i) => {
  if (line.includes('.drawer-left') || line.includes('drawer-header')) {
    console.log(`Line ${i + 1}: ${line}`);
  }
});
