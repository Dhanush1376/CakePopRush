import { Product } from '@/types/product';
import { CategoryConfigSchema, ConfigGroupSchema, ProductConfigOverride } from './configurationTypes';

// Category defaults — each category gets a sensible baseline.
export const categoryConfigs: Record<string, CategoryConfigSchema> = {
  'Cookies': {
    categoryName: 'Cookies',
    groups: [
      { id: 'qty', title: 'Pick Your Box', subtitle: 'How many cookies?', type: 'quantity', required: true, sourceField: 'quantities', icon: 'ShoppingBag' },
      { id: 'addons', title: 'Gift Extras', type: 'addon', required: false, sourceField: 'addOns', icon: 'Gift' },
    ]
  },
  'Brownies': {
    categoryName: 'Brownies',
    groups: [
      { id: 'qty', title: 'Choose Your Box', type: 'quantity', required: true, sourceField: 'quantities', icon: 'ShoppingBag' },
      { id: 'addons', title: 'Make It a Gift', type: 'addon', required: false, sourceField: 'addOns', icon: 'Gift' },
    ]
  },
  'Cake Pops': {
    categoryName: 'Cake Pops',
    groups: [
      { id: 'qty', title: 'Choose Your Box Size', type: 'quantity', required: true, sourceField: 'quantities', icon: 'ShoppingBag' },
      { id: 'flavour', title: 'Choose Your Coating', subtitle: 'Pick your chocolate coating', type: 'flavour', required: true, sourceField: 'flavours', icon: 'Palette' },
      { id: 'addons', title: 'Add a Little Something', type: 'addon', required: false, sourceField: 'addOns', icon: 'Sparkles' },
    ]
  },
  'Cupcakes': {
    categoryName: 'Cupcakes',
    groups: [
      { id: 'qty', title: 'Choose Your Box', type: 'quantity', required: true, sourceField: 'quantities', icon: 'ShoppingBag' },
      { 
        id: 'frosting', 
        title: 'Choose Your Frosting', 
        type: 'inline', 
        required: true, 
        icon: 'Palette',
        inlineOptions: [
          { id: 'buttercream', label: 'Buttercream', priceDelta: 0, colorHex: '#FDFBF7' },
          { id: 'cream_cheese', label: 'Cream Cheese', priceDelta: 2000, colorHex: '#FFFDD0' },
          { id: 'ganache', label: 'Chocolate Ganache', priceDelta: 3000, colorHex: '#4A2511' }
        ]
      },
      { id: 'addons', title: 'Make It Extra Special', type: 'addon', required: false, sourceField: 'addOns', icon: 'Sparkles' },
    ]
  },
  'Desserts': {
    categoryName: 'Desserts',
    groups: [
      { id: 'qty', title: 'Choose Your Pack', type: 'quantity', required: true, sourceField: 'quantities', icon: 'ShoppingBag' },
      { id: 'addons', title: 'Gift Extras', type: 'addon', required: false, sourceField: 'addOns', icon: 'Gift' },
    ]
  },
  'Cakes': {
    categoryName: 'Cakes',
    groups: [
      { id: 'qty', title: 'Choose Cake Size', type: 'quantity', required: true, sourceField: 'quantities', icon: 'ShoppingBag' },
      { id: 'flavour', title: 'Choose Your Flavour', type: 'flavour', required: true, sourceField: 'flavours', icon: 'Palette' },
      { id: 'addons', title: 'Finishing Touches', type: 'addon', required: false, sourceField: 'addOns', icon: 'Sparkles' },
      { id: 'message', title: 'Add a Personal Message', type: 'message', required: false, sourceField: 'message', icon: 'MessageSquareHeart' },
    ]
  },
  'Macarons': {
    categoryName: 'Macarons',
    groups: [
      { id: 'qty', title: 'Choose Your Box', type: 'quantity', required: true, sourceField: 'quantities', icon: 'ShoppingBag' },
      { id: 'addons', title: 'Make It a Gift', type: 'addon', required: false, sourceField: 'addOns', icon: 'Gift' },
    ]
  },
  'Cake Jars': {
    categoryName: 'Cake Jars',
    groups: [
      { id: 'qty', title: 'Choose Your Set', type: 'quantity', required: true, sourceField: 'quantities', icon: 'ShoppingBag' },
      { id: 'addons', title: 'Gift Extras', type: 'addon', required: false, sourceField: 'addOns', icon: 'Gift' },
    ]
  },
  'Gift Boxes': {
    categoryName: 'Gift Boxes',
    groups: [
      { id: 'qty', title: 'Choose Your Box', type: 'quantity', required: true, sourceField: 'quantities', icon: 'ShoppingBag' },
      { id: 'addons', title: 'Personalise Your Gift', type: 'addon', required: false, sourceField: 'addOns', icon: 'Sparkles' },
      { id: 'message', title: 'Add a Personal Note', type: 'message', required: false, sourceField: 'message', icon: 'MessageSquareHeart' },
    ]
  }
};

const fallbackConfig: CategoryConfigSchema = {
  categoryName: 'Default',
  groups: [
    { id: 'qty', title: 'Choose Quantity', type: 'quantity', required: true, sourceField: 'quantities', icon: 'ShoppingBag' },
    { id: 'addons', title: 'Add-ons', type: 'addon', required: false, sourceField: 'addOns', icon: 'Tag' },
  ]
};

// Mock product overrides (normally these would be loaded from an API or the product's JSON payload)
// We define them here to simulate product-specific overrides in our mock data.
export const productOverrides: Record<string, ProductConfigOverride> = {
  // Dark Chocolate Cake Pops — specific drizzle add-on, no generic ones
  'prod_4': {
    overrideGroups: {
      'addons': { title: 'Choose Your Drizzle' }
    }
  },
  // Assorted Cookies — no quantity choice (it's already an assortment)
  'prod_11': {
    overrideGroups: {
      'qty': { title: 'Choose Your Assortment Size' }
    }
  },
  // Mug Cake Mix — simpler product, only quantity
  'prod_18': {
    removeGroups: ['addons']
  },
};

/** Checks if the product has actual data to render for this group */
function hasDataForGroup(group: ConfigGroupSchema, product: Product): boolean {
  if (group.type === 'inline') return true; // Inline data is in the schema, not the product
  if (group.type === 'message') return true; // Message doesn't need source data arrays
  
  if (group.sourceField) {
    const data = product[group.sourceField as keyof Product];
    if (Array.isArray(data)) {
      return data.length > 0;
    }
  }
  return false;
}

/** Merges category defaults with product overrides to produce the final schema */
export function getConfigForProduct(product: Product): ConfigGroupSchema[] {
  // 1. Get category defaults
  const categoryConfig = categoryConfigs[product.categoryName];
  if (!categoryConfig) {
    // Fallback: quantity + addons (safe default)
    return fallbackConfig.groups.filter(g => hasDataForGroup(g, product));
  }

  // 2. Apply product-specific overrides (if any)
  const overrides = productOverrides[product.id];
  if (!overrides) {
    return categoryConfig.groups.filter(g => hasDataForGroup(g, product));
  }

  let groups = [...categoryConfig.groups];

  // Remove groups
  if (overrides.removeGroups) {
    const toRemove = overrides.removeGroups;
    groups = groups.filter(g => !toRemove.includes(g.id));
  }

  // Override group properties
  if (overrides.overrideGroups) {
    const groupOverrides = overrides.overrideGroups;
    groups = groups.map(g => {
      const override = groupOverrides[g.id];
      return override ? { ...g, ...override } : g;
    });
  }

  // Add groups
  if (overrides.addGroups) {
    groups = [...groups, ...overrides.addGroups];
  }

  // Filter out groups whose source data is empty/missing on the product
  return groups.filter(g => hasDataForGroup(g, product));
}
