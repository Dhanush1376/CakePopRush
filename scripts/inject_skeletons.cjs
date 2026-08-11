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

pages.forEach(page => {
  const filePath = path.join(process.cwd(), 'src', 'pages', 'admin', 'pages', page + '.tsx');
  if (!fs.existsSync(filePath)) {
    console.log('Not found:', filePath);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add import
  if (!content.includes(page + 'Skeleton')) {
    const importStatement = "import { " + page + "Skeleton } from '../components/" + page + "Skeleton';\n";
    const lastImportIndex = content.lastIndexOf('import ');
    const endOfLastImport = content.indexOf('\n', lastImportIndex);
    content = content.substring(0, endOfLastImport + 1) + importStatement + content.substring(endOfLastImport + 1);
  }
  
  // Add useState and useEffect inside the component
  const componentStr = "export function " + page + "() {\n";
  if (content.includes(componentStr) && !content.includes('isLoading')) {
    const insertion = `  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <` + page + `Skeleton />;
`;
    content = content.replace(componentStr, componentStr + insertion);
  }
  
  fs.writeFileSync(filePath, content);
});
console.log('Injected skeletons');
