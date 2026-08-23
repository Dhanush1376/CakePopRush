/** Types of configuration groups the system supports */
export type ConfigGroupType =
  | 'quantity'    // Box size / piece count selection
  | 'flavour'     // Product flavor or coating selection (uses Product.flavours)
  | 'addon'       // Add-on toggles (uses Product.addOns)
  | 'occasion'    // Occasion selection (uses Product.occasions)
  | 'message'     // Personal message input
  | 'inline';     // Presentation-only options defined inline in the schema

/** A single inline option (for 'inline' type groups) */
export interface InlineOption {
  id: string;
  label: string;
  priceDelta: number;  // in paise. 0 = included.
  colorHex?: string;
  description?: string;
}

/** Schema for one configuration group */
export interface ConfigGroupSchema {
  id: string;
  title: string;
  subtitle?: string;        // Friendly microcopy ("Pick your coating")
  type: ConfigGroupType;
  required: boolean;
  icon: string;             // Lucide icon name
  sourceField?: 'quantities' | 'flavours' | 'addOns' | 'occasions' | 'message';
  inlineOptions?: InlineOption[];  // Only for type: 'inline'
  multiSelect?: boolean;    // For inline groups: allow multiple selections
}

/** Category-level default configuration */
export interface CategoryConfigSchema {
  categoryName: string;
  groups: ConfigGroupSchema[];
}

/** Product-level overrides (optional, stored in seed data) */
export interface ProductConfigOverride {
  /** Group IDs to remove from category defaults */
  removeGroups?: string[];
  /** Groups to add (appended after category defaults) */
  addGroups?: ConfigGroupSchema[];
  /** Override specific group properties by ID */
  overrideGroups?: Record<string, Partial<ConfigGroupSchema>>;
}
