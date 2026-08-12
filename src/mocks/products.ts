import type { Product } from '@/types/product';

export const mockCategories = [
  { id: 'all', name: 'All Items' },
  { id: 'cake-pops', name: 'Cake Pops' },
  { id: 'cupcakes', name: 'Cupcakes' },
  { id: 'cookies', name: 'Cookies' },
  { id: 'brownies', name: 'Brownies' },
  { id: 'desserts', name: 'Desserts' },
  { id: 'cakes', name: 'Cakes' },
  { id: 'macarons', name: 'Macarons' },
  { id: 'cake-jars', name: 'Cake Jars' },
  { id: 'gift-boxes', name: 'Gift Boxes' },
];

const baseProductDetails = {
  isCustomizable: true,
  isEggless: true,
  ingredients: 'Sugar, Flour, Butter, Cocoa Powder, Free-range Eggs, Milk, Pure Vanilla Extract, Premium Sprinkles, Belgian Chocolate.',
  allergens: ['Milk', 'Wheat', 'Soy'],
  dietaryInfo: ['Vegetarian', 'Eggless (Optional)'],
  nutrition: { calories: 220, protein: 3, carbs: 28, fat: 10 },
  preparationTime: '4–6 hours',
  shelfLife: '3 days',
  storage: 'Refrigerate after delivery. Best consumed at room temperature.',
  deliveryInfo: 'Freshly made and delivered within 24-48 hours. Carefully packed to ensure perfect condition upon arrival.',
  flavours: [
    { id: 'f1', name: 'Chocolate', priceModifier: 0, colorHex: '#5B291A' },
    { id: 'f2', name: 'Vanilla', priceModifier: 0, colorHex: '#FFD8A3' },
  ],
  quantities: [
    { id: 'q1', label: 'Regular Box', pieces: 6, priceModifier: 0 },
    { id: 'q2', label: 'Party Box', pieces: 12, priceModifier: 32000 },
  ],
  addOns: [
    { id: 'a1', name: 'Chocolate Drizzle', price: 4000 },
    { id: 'a2', name: 'Premium Gift Packaging', price: 9900 },
  ],
  occasions: ['Birthday', 'Anniversary', 'Thank You', 'Just Because'],
  faqs: [
    { question: 'How long does delivery take?', answer: 'We typically deliver within 24-48 hours depending on your pincode.' },
    { question: 'Are these eggless?', answer: 'We offer both egg-based and eggless variants. You can select your preference during customization.' },
  ]
};

export const mockProducts: Product[] = [
  {
    ...baseProductDetails,
    id: 'prod_1',
    slug: 'choclate-chip-cookies',
    name: 'Chocolate Chip Cookies',
    categoryName: 'Cookies',
    images: [{ id: 'img_1', url: '/images/Products/Choclate chip cookies.jpeg', alt: 'Chocolate Chip Cookies' }],
    basePrice: 45000,
    rating: 4.8,
    reviewCount: 120,
    isBestSeller: true,
    description: 'Classic chocolate chip cookies, baked to perfection with gooey chocolate centers.',
  },
  {
    ...baseProductDetails,
    id: 'prod_2',
    slug: 'chocolate-biscoff-brownie',
    name: 'Chocolate Biscoff Brownie',
    categoryName: 'Brownies',
    images: [{ id: 'img_2', url: '/images/Products/Chocolate biscoff brownie.jpeg', alt: 'Chocolate Biscoff Brownie' }],
    basePrice: 55000,
    rating: 4.9,
    reviewCount: 85,
    isNew: true,
    description: 'Rich chocolate brownie infused with crunchy Biscoff spread and biscuit crumbles.',
  },
  {
    ...baseProductDetails,
    id: 'prod_3',
    slug: 'chocolate-gooey-brownie',
    name: 'Chocolate Gooey Brownie',
    categoryName: 'Brownies',
    images: [{ id: 'img_3', url: '/images/Products/Chocolate gooey brownie.jpeg', alt: 'Chocolate Gooey Brownie' }],
    basePrice: 50000,
    rating: 4.7,
    reviewCount: 200,
    isBestSeller: true,
    description: 'Ultimate fudgy chocolate brownie with a melt-in-your-mouth gooey center.',
  },
  {
    ...baseProductDetails,
    id: 'prod_4',
    slug: 'dark-choclate-cakepops',
    name: 'Dark Chocolate Cake Pops',
    categoryName: 'Cake Pops',
    images: [{ id: 'img_4', url: '/images/Products/Dark choclate cakepops.jpeg', alt: 'Dark Chocolate Cake Pops' }],
    basePrice: 38000,
    rating: 4.6,
    reviewCount: 65,
    description: 'Decadent dark chocolate cake pops dipped in premium dark chocolate.',
  },
  {
    ...baseProductDetails,
    id: 'prod_5',
    slug: 'milk-choclate-cakepops',
    name: 'Milk Chocolate Cake Pops',
    categoryName: 'Cake Pops',
    images: [{ id: 'img_5', url: '/images/Products/Milk choclate cakepops.jpeg', alt: 'Milk Chocolate Cake Pops' }],
    basePrice: 35000,
    rating: 4.8,
    reviewCount: 142,
    isBestSeller: true,
    description: 'Classic milk chocolate cake pops, a favorite for kids and adults alike.',
  },
  {
    ...baseProductDetails,
    id: 'prod_6',
    slug: 'nutella-sea-salt-cookies',
    name: 'Nutella Sea Salt Cookies',
    categoryName: 'Cookies',
    images: [{ id: 'img_6', url: '/images/Products/Nutella sea salt cookies.jpeg', alt: 'Nutella Sea Salt Cookies' }],
    basePrice: 58000,
    rating: 4.9,
    reviewCount: 310,
    isBestSeller: true,
    description: 'Soft cookies stuffed with Nutella and sprinkled with flaky sea salt.',
  },
  {
    ...baseProductDetails,
    id: 'prod_7',
    slug: 'oreo-pops',
    name: 'Oreo Pops',
    categoryName: 'Cake Pops',
    images: [{ id: 'img_7', url: '/images/Products/Oreo pops.jpeg', alt: 'Oreo Pops' }],
    basePrice: 36000,
    rating: 4.7,
    reviewCount: 88,
    description: 'Crushed Oreos mixed with cream cheese, coated in white chocolate.',
  },
  {
    ...baseProductDetails,
    id: 'prod_8',
    slug: 'red-velvet-cookies',
    name: 'Red Velvet Cookies',
    categoryName: 'Cookies',
    images: [{ id: 'img_8', url: '/images/Products/Red velvet cookies.jpeg', alt: 'Red Velvet Cookies' }],
    basePrice: 48000,
    rating: 4.5,
    reviewCount: 45,
    description: 'Soft and chewy red velvet cookies packed with white chocolate chips.',
  },
  {
    ...baseProductDetails,
    id: 'prod_9',
    slug: 'triple-chocolate-cookies',
    name: 'Triple Chocolate Cookies',
    categoryName: 'Cookies',
    images: [{ id: 'img_9', url: '/images/Products/Triple chocolate cookies.jpeg', alt: 'Triple Chocolate Cookies' }],
    basePrice: 52000,
    rating: 4.8,
    reviewCount: 175,
    description: 'The ultimate chocolate lover’s dream featuring dark, milk, and white chocolate.',
  },
  {
    ...baseProductDetails,
    id: 'prod_10',
    slug: 'white-choclate-cakepops',
    name: 'White Chocolate Cake Pops',
    categoryName: 'Cake Pops',
    images: [{ id: 'img_10', url: '/images/Products/White choclate cakepops.jpeg', alt: 'White Chocolate Cake Pops' }],
    basePrice: 38000,
    rating: 4.4,
    reviewCount: 32,
    description: 'Vanilla cake pops wrapped in a smooth white chocolate shell.',
  },
  {
    ...baseProductDetails,
    id: 'prod_11',
    slug: 'assorted-cookies',
    name: 'Assorted Cookies',
    categoryName: 'Cookies',
    images: [{ id: 'img_11', url: '/images/Products/asorted flavours of cookies.jpeg', alt: 'Assorted Cookies' }],
    basePrice: 65000,
    rating: 4.9,
    reviewCount: 220,
    isBestSeller: true,
    description: 'A perfect box of mixed cookies for those who want to try everything.',
  },
  {
    ...baseProductDetails,
    id: 'prod_12',
    slug: 'biscoff-filled-chocolate-cupcakes',
    name: 'Biscoff Filled Chocolate Cupcakes',
    categoryName: 'Cupcakes',
    images: [{ id: 'img_12', url: '/images/Products/biscoff filled chocolate cupcakes.jpeg', alt: 'Biscoff Filled Chocolate Cupcakes' }],
    basePrice: 75000,
    rating: 4.7,
    reviewCount: 95,
    isNew: true,
    description: 'Moist chocolate cupcakes with a surprise Biscoff center.',
  },
  {
    ...baseProductDetails,
    id: 'prod_13',
    slug: 'chocolate-chip-cupcakes',
    name: 'Chocolate Chip Cupcakes',
    categoryName: 'Cupcakes',
    images: [{ id: 'img_13', url: '/images/Products/chocolate chip cupcakes.jpeg', alt: 'Chocolate Chip Cupcakes' }],
    basePrice: 60000,
    rating: 4.6,
    reviewCount: 82,
    description: 'Fluffy vanilla cupcakes loaded with mini chocolate chips.',
  },
  {
    ...baseProductDetails,
    id: 'prod_14',
    slug: 'chocolate-hazelnut-brownie',
    name: 'Chocolate Hazelnut Brownie',
    categoryName: 'Brownies',
    images: [{ id: 'img_14', url: '/images/Products/chocolate hazelnut brownie.jpeg', alt: 'Chocolate Hazelnut Brownie' }],
    basePrice: 58000,
    rating: 4.8,
    reviewCount: 110,
    description: 'Fudgy brownie generously topped with roasted hazelnuts.',
  },
  {
    ...baseProductDetails,
    id: 'prod_15',
    slug: 'chocolate-nutella-brownie',
    name: 'Chocolate Nutella Brownie',
    categoryName: 'Brownies',
    images: [{ id: 'img_15', url: '/images/Products/chocolate nutella brownie.jpeg', alt: 'Chocolate Nutella Brownie' }],
    basePrice: 62000,
    rating: 4.9,
    reviewCount: 250,
    isBestSeller: true,
    description: 'Our signature brownie swirled with a generous amount of Nutella.',
  },
  {
    ...baseProductDetails,
    id: 'prod_16',
    slug: 'chocolate-nutella-cake-jar',
    name: 'Chocolate Nutella Cake Jar',
    categoryName: 'Desserts',
    images: [{ id: 'img_16', url: '/images/Products/chocolate nutella cake jar.jpeg', alt: 'Chocolate Nutella Cake Jar' }],
    basePrice: 45000,
    rating: 4.7,
    reviewCount: 65,
    description: 'Layers of chocolate cake and Nutella frosting served in a cute jar.',
  },
  {
    ...baseProductDetails,
    id: 'prod_17',
    slug: 'mini-valentine-cake',
    name: 'Mini Valentine Cake',
    categoryName: 'Birthday Cakes',
    images: [{ id: 'img_17', url: '/images/Products/mini valentine cake.jpeg', alt: 'Mini Valentine Cake' }],
    basePrice: 150000,
    rating: 4.8,
    reviewCount: 40,
    isLimitedEdition: true,
    description: 'A beautiful mini cake perfect for a romantic celebration.',
  },
  {
    ...baseProductDetails,
    id: 'prod_18',
    slug: 'mug-cake-mix',
    name: 'Mug Cake Mix',
    categoryName: 'Desserts',
    images: [{ id: 'img_18', url: '/images/Products/mug cake mix.jpeg', alt: 'Mug Cake Mix' }],
    basePrice: 25000,
    rating: 4.5,
    reviewCount: 30,
    description: 'Quick and easy mug cake mix for your midnight cravings.',
  },
  {
    ...baseProductDetails,
    id: 'prod_19',
    slug: 'nutella-biscoff-sandwich',
    name: 'Nutella Biscoff Sandwich',
    categoryName: 'Desserts',
    images: [{ id: 'img_19', url: '/images/Products/nutella biscoff sandwich.jpeg', alt: 'Nutella Biscoff Sandwich' }],
    basePrice: 85000,
    rating: 4.9,
    reviewCount: 180,
    isNew: true,
    description: 'A decadent sandwich dessert combining the best of Nutella and Biscoff.',
  },
  {
    ...baseProductDetails,
    id: 'prod_20',
    slug: 'nutella-filled-chocolate-cupcakes',
    name: 'Nutella Filled Chocolate Cupcakes',
    categoryName: 'Cupcakes',
    images: [{ id: 'img_20', url: '/images/Products/nutella filled chocolate cupcakes.jpeg', alt: 'Nutella Filled Chocolate Cupcakes' }],
    basePrice: 75000,
    rating: 4.8,
    reviewCount: 145,
    description: 'Chocolate cupcakes bursting with a rich Nutella core.',
  },
  {
    ...baseProductDetails,
    id: 'prod_21',
    slug: 'pista-flavoured-rainbow-chips',
    name: 'Pista Flavoured Rainbow Chips',
    categoryName: 'Cookies',
    images: [{ id: 'img_21', url: '/images/Products/pista flavoured rainbow chips.jpeg', alt: 'Pista Flavoured Rainbow Chips' }],
    basePrice: 55000,
    rating: 4.4,
    reviewCount: 25,
    description: 'Unique pistachio flavoured cookies loaded with colorful rainbow chips.',
  },
  {
    ...baseProductDetails,
    id: 'prod_22',
    slug: 'vanilla-mango-cupcakes',
    name: 'Vanilla Mango Cupcakes',
    categoryName: 'Cupcakes',
    images: [{ id: 'img_22', url: '/images/Products/vanilla mango cupcakes.jpeg', alt: 'Vanilla Mango Cupcakes' }],
    basePrice: 65000,
    rating: 4.6,
    reviewCount: 55,
    isNew: true,
    description: 'Light vanilla cupcakes infused with fresh mango puree.',
  },
  {
    ...baseProductDetails,
    id: 'prod_23',
    slug: 'macarons-box',
    name: 'Assorted Macarons Box',
    categoryName: 'Macarons',
    images: [{ id: 'img_23', url: '/images/Products/nutella biscoff sandwich.jpeg', alt: 'Macarons' }],
    basePrice: 95000,
    rating: 4.8,
    reviewCount: 42,
    description: 'Delicate french macarons with various fillings.',
  },
  {
    ...baseProductDetails,
    id: 'prod_24',
    slug: 'red-velvet-cake-jar',
    name: 'Red Velvet Cake Jar',
    categoryName: 'Cake Jars',
    images: [{ id: 'img_24', url: '/images/Products/chocolate nutella cake jar.jpeg', alt: 'Cake Jars' }],
    basePrice: 55000,
    rating: 4.6,
    reviewCount: 30,
    description: 'Layers of red velvet cake and cream cheese frosting.',
  },
  {
    ...baseProductDetails,
    id: 'prod_25',
    slug: 'luxury-gift-box',
    name: 'Luxury Gift Box',
    categoryName: 'Gift Boxes',
    images: [{ id: 'img_25', url: '/images/Products/asorted flavours of cookies.jpeg', alt: 'Gift Boxes' }],
    basePrice: 250000,
    rating: 5.0,
    reviewCount: 15,
    description: 'A beautiful luxury gift box containing assorted treats.',
  },
];

// Product Selectors
export const getProductById = (id: string): Product | undefined => {
  return mockProducts.find(p => p.id === id);
};

export const getProductBySlug = (slug: string): Product | undefined => {
  return mockProducts.find(p => p.slug === slug);
};

export const getProductsByCategory = (category: string): Product[] => {
  if (category === 'All Items' || category === 'all') return mockProducts;
  if (category === 'cakes' || category === 'birthday-cakes') {
    return mockProducts.filter(p => p.categoryName === 'Cakes' || p.categoryName === 'Birthday Cakes' || p.categoryName.toLowerCase().includes('cake'));
  }
  return mockProducts.filter(p => p.categoryName === category || p.categoryName.toLowerCase().replace(" ", "-") === category);
};

export const getFeaturedProducts = (limit = 4): Product[] => {
  return mockProducts.filter(p => p.isBestSeller || p.isNew).slice(0, limit);
};

export const getBestSellingProducts = (limit = 8): Product[] => {
  return mockProducts.filter(p => p.isBestSeller).slice(0, limit);
};

export const getNewArrivals = (limit = 4): Product[] => {
  return mockProducts.filter(p => p.isNew).slice(0, limit);
};

export const getRelatedProducts = (productId: string, limit = 4): Product[] => {
  const product = getProductById(productId);
  if (!product) return [];
  return mockProducts
    .filter(p => p.id !== productId && p.categoryName === product.categoryName)
    .slice(0, limit);
};

export const searchProducts = (query: string): Product[] => {
  const lowercaseQuery = query.toLowerCase();
  return mockProducts.filter(
    p =>
      p.name.toLowerCase().includes(lowercaseQuery) ||
      p.description?.toLowerCase().includes(lowercaseQuery) ||
      p.categoryName.toLowerCase().includes(lowercaseQuery)
  );
};
