const fs = require('fs');
const path = require('path');

const responsiveCSS = `
@media (max-width: 1200px) and (min-width: 768px) {
  .statCard {
    padding: 10px 4px;
    gap: 4px;
  }
  .statIconWrapper {
    width: 28px;
    height: 28px;
    margin-bottom: 2px;
  }
  .statIconWrapper > svg {
    width: 14px;
    height: 14px;
  }
  .statLabel {
    font-size: 9px;
    letter-spacing: -0.2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
  .statValue {
    font-size: 16px;
  }
  .statTrend {
    font-size: 8.5px;
    gap: 2px;
    flex-wrap: nowrap;
    white-space: nowrap;
  }
}
`;

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // apply to files that have .statCard
      if (content.includes('.statCard {') && !content.includes('padding: 10px 4px;')) {
        content += responsiveCSS;
        fs.writeFileSync(fullPath, content);
        console.log('Updated statCard rules in', fullPath);
      }
    }
  }
}

processDir('src/pages/admin');
