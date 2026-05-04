const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/admin/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix 1: Leads Tab - Missing </div> after header
const leadsHeaderPattern = /<\/button>\s*<\/div>\s*<div className="overflow-x-auto">/;
if (content.match(leadsHeaderPattern)) {
    console.log('Fixing Leads Tab imbalance...');
    content = content.replace(leadsHeaderPattern, (match) => {
        return (match.indexOf('</div>\n                  </div>') !== -1) ? match : match.replace('<div className="overflow-x-auto">', '</div>\n                  </div>\n                  <div className="overflow-x-auto">');
    });
}

// Fix 2: Unit Tray - Missing </div> at end of map
const unitTrayPattern = /<\/button>\s*<\/div>\s*<\/div>\s*\)\) : \(/;
if (content.match(unitTrayPattern)) {
    console.log('Fixing Unit Tray imbalance...');
    // We already have </div></div> before )) : ( based on my previous edit/view
}

// Fix 4: Property Map - EXTRA </div> at end of map
// Pattern: </AnimatePresence>\s*</div>\s*</div>\s*</div>\s*\);
const propMapPattern = /<\/AnimatePresence>\s*<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\}\)/;
if (content.match(propMapPattern)) {
    console.log('Fixing Property Map extra Div...');
    content = content.replace(propMapPattern, (match) => {
        return match.replace('</div>\n                               </div>\n                            </div>', '</div>\n                            </div>');
    });
}

fs.writeFileSync(filePath, content);
console.log('JSX Repair Suite Finalized.');
