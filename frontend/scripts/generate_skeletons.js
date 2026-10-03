const fs = require('fs');
const path = require('path');

const pages = [
  'AdminAnalytics',
  'AdminCoupons',
  'AdminCustomOrders',
  'AdminNotifications',
  'AdminReviews',
  'AdminSettings',
  'AdminUsers'
];

const cssTemplate = `
/* Container & Shimmer Animation */
.container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

.skeleton {
  background: #f6f7f8;
  background-image: linear-gradient(
    to right,
    #f6f7f8 0%,
    #edeef1 20%,
    #f6f7f8 40%,
    #f6f7f8 100%
  );
  background-repeat: no-repeat;
  background-size: 1000px 100%; 
  animation-duration: 2s;
  animation-fill-mode: forwards; 
  animation-iteration-count: infinite;
  animation-name: shimmer;
  animation-timing-function: linear;
  border-radius: var(--radius-md);
}

.header { margin-bottom: 8px; }
.titleSkeleton { width: 160px; height: 32px; margin-bottom: 8px; }
.subtitleSkeleton { width: 240px; height: 16px; }

.toolbar {
  display: flex; gap: 12px; padding: 12px;
  background: var(--color-white); border: 1px solid var(--color-border);
  border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);
}
.searchSkeleton { flex: 1; height: 36px; border-radius: 8px; }
.btnSkeleton { width: 120px; height: 36px; border-radius: 8px; }

.contentBlock {
  background: var(--color-white); border: 1px solid var(--color-border);
  border-radius: var(--radius-lg); padding: 24px; min-height: 400px;
}
.contentLine { width: 100%; height: 24px; margin-bottom: 16px; }
.contentLineShort { width: 60%; height: 24px; }
`;

const tsxTemplate = (name) => `import React from 'react';
import styles from './${name}Skeleton.module.css';

export function ${name}Skeleton() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <div className={\`\${styles.skeleton} \${styles.titleSkeleton}\`} />
          <div className={\`\${styles.skeleton} \${styles.subtitleSkeleton}\`} />
        </div>
      </div>
      <div className={styles.toolbar}>
        <div className={\`\${styles.skeleton} \${styles.searchSkeleton}\`} />
        <div className={\`\${styles.skeleton} \${styles.btnSkeleton}\`} />
        <div className={\`\${styles.skeleton} \${styles.btnSkeleton}\`} />
      </div>
      <div className={styles.contentBlock}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i}>
            <div className={\`\${styles.skeleton} \${styles.contentLine}\`} />
            <div className={\`\${styles.skeleton} \${styles.contentLineShort}\`} style={{ marginBottom: '32px' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
`;

pages.forEach(page => {
  const tsxPath = path.join(__dirname, 'src', 'pages', 'admin', 'components', `${page}Skeleton.tsx`);
  const cssPath = path.join(__dirname, 'src', 'pages', 'admin', 'components', `${page}Skeleton.module.css`);
  fs.writeFileSync(tsxPath, tsxTemplate(page));
  fs.writeFileSync(cssPath, cssTemplate);
});
console.log('Created 7 skeleton components');
