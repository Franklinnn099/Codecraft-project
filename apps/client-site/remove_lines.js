const fs = require('fs');
const path = 'c:\\Users\\USER\\Desktop\\Expert-office-Furnish-final\\apps\\client-site\\src\\pages\\ProductPage.jsx';
const lines = fs.readFileSync(path, 'utf8').split(/\r?\n/);

// We need to remove lines 507-523 and 410-414 (1-based)
// 0-based: 506-522 and 409-413

// Remove larger index first
// Removing 507-523 (17 lines)
lines.splice(506, 17);

// Removing 410-414 (5 lines)
lines.splice(409, 5);

fs.writeFileSync(path, lines.join('\n'));
console.log('Successfully modified ProductPage.jsx');
