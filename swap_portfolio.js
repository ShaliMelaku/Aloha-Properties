const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'src/app/admin/page.tsx');
const sourcePath = path.join(__dirname, 'clean_portfolio.jsx');

let targetContent = fs.readFileSync(targetPath, 'utf8');
const sourceContent = fs.readFileSync(sourcePath, 'utf8');

// The block starts with {activeTab === "portfolio" && (
// and ends after the corresponding AnimatePresence / motion.div block.
// Since the corrupted file has mismatched braces, we'll search for the boundaries.

const startMarker = '{activeTab === "portfolio" && (';
const endMarker = '{activeTab === "blog" && ('; // The next tab starts here

const startIndex = targetContent.indexOf(startMarker);
const endIndex = targetContent.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
    console.log('Swapping Portfolio block...');
    const prefix = targetContent.substring(0, startIndex);
    const suffix = targetContent.substring(endIndex);
    
    // Ensure the sourceContent ends with the correct nesting
    // The sourceContent I wrote ends with )} which matches the {activeTab === "portfolio" && (
    
    const newContent = prefix + sourceContent.trim() + '\n\n            ' + suffix;
    fs.writeFileSync(targetPath, newContent);
    console.log('Swap Complete.');
} else {
    console.log('Could not find markers:', { startIndex, endIndex });
}
