const fs = require('fs');
const file = 'c:/Users/Dhanush/OneDrive/Desktop/PROJECTS/CakePopRush/src/pages/admin/pages/AdminCustomOrders.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacement = `const [view, setView] = React.useState<'list' | 'grid'>('list');

  React.useEffect(() => {
    const checkView = () => {
      if (typeof window !== 'undefined') {
        setView(window.innerWidth <= 768 ? 'grid' : 'list');
      }
    };
    
    // Check on mount
    checkView();
    
    // Check on resize (useful for responsive testing)
    window.addEventListener('resize', checkView);
    return () => window.removeEventListener('resize', checkView);
  }, []);`;

content = content.replace(/const \[view, setView\] = React\.useState\<'list' \| 'grid'\>\('list'\);/, replacement);

// Now fix the mobileCards rendering issue:
content = content.replace(
  /\{\/\* Mobile Cards View \(displayed on mobile screens when in list view\) \*\/\}\s*\{view === 'list' && \(\s*<div className=\{styles\.mobileCards\}>/g,
  "{/* Mobile Cards View */}\n        <div className={styles.mobileCards} style={{ display: view === 'list' ? 'none' : '' }}>"
);

// We need to remove the matching `)}` that was closing `{view === 'list' && (`.
// It's located right before `<div className={styles.pagination}>`.
content = content.replace(
  /        <\/div>\s*\)\}\s*<div className=\{styles\.pagination\}>/g,
  "        </div>\n\n        <div className={styles.pagination}>"
);

fs.writeFileSync(file, content);
console.log('Re-applied listener and fixed mobileCards rendering');
