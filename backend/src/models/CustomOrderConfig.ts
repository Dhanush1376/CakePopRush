import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomOrderField {
  id: string;
  type:
    | 'text'
    | 'textarea'
    | 'dropdown'
    | 'radio'
    | 'checkbox'
    | 'multiselect'
    | 'file'
    | 'image'
    | 'date'
    | 'number'
    | 'email'
    | 'phone'
    | 'whatsapp_chat';
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  options?: { value: string; label: string }[];
  whatsappNumber?: string;
  whatsappMessage?: string;
  order: number;
}

export interface ICustomOrderStep {
  id: string;
  title: string;
  description?: string;
  order: number;
  isHidden?: boolean;
  fields: ICustomOrderField[];
}

export interface ICustomOrderType {
  id: string;
  name: string;
  description: string;
  icon?: string;
  enabled: boolean;
  steps: ICustomOrderStep[];
}

export interface ICustomOrderConfig extends Document {
  version: number;
  status: 'draft' | 'published';
  types: ICustomOrderType[];
  publishedAt?: Date;
  publishedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CustomOrderFieldSchema = new Schema<ICustomOrderField>(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'text',
        'textarea',
        'dropdown',
        'radio',
        'checkbox',
        'multiselect',
        'file',
        'image',
        'date',
        'number',
        'email',
        'phone',
        'whatsapp_chat',
      ],
      default: 'text',
    },
    label: { type: String, required: true, trim: true },
    placeholder: { type: String, default: '' },
    helpText: { type: String, default: '' },
    required: { type: Boolean, default: false },
    options: [
      {
        value: { type: String, required: true },
        label: { type: String, required: true },
      },
    ],
    whatsappNumber: { type: String, default: '' },
    whatsappMessage: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const CustomOrderStepSchema = new Schema<ICustomOrderStep>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 },
    isHidden: { type: Boolean, default: false },
    fields: [CustomOrderFieldSchema],
  },
  { _id: false }
);

const CustomOrderTypeSchema = new Schema<ICustomOrderType>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    icon: { type: String, default: 'cake' },
    enabled: { type: Boolean, default: true },
    steps: [CustomOrderStepSchema],
  },
  { _id: false }
);

const CustomOrderConfigSchema = new Schema<ICustomOrderConfig>(
  {
    version: { type: Number, required: true, default: 1 },
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
    types: [CustomOrderTypeSchema],
    publishedAt: { type: Date },
    publishedBy: { type: String, default: '' },
  },
  { timestamps: true }
);

CustomOrderConfigSchema.index({ status: 1, version: -1 });

export const DEFAULT_CAKEPOPRUSH_CONFIG: {
  version: number;
  status: 'draft' | 'published';
  types: ICustomOrderType[];
} = {
  version: 1,
  status: 'published',
  types: [
    {
      id: 'general',
      name: 'General Customization',
      description: 'Create a tailored custom cake pop order from scratch for your special event.',
      icon: 'cake',
      enabled: true,
      steps: [
        {
          id: 'step_occasion',
          title: 'Event & Occasion',
          description: 'Tell us about the celebration and your theme',
          order: 1,
          fields: [
            {
              id: 'field_occasion',
              type: 'dropdown',
              label: 'Occasion',
              required: true,
              order: 1,
              options: [
                { value: 'Birthday', label: 'Birthday Party' },
                { value: 'Wedding', label: 'Wedding / Reception' },
                { value: 'Corporate', label: 'Corporate Event' },
                { value: 'Baby Shower', label: 'Baby Shower' },
                { value: 'Anniversary', label: 'Anniversary' },
                { value: 'Festival', label: 'Festival / Holiday' },
                { value: 'Other', label: 'Other Special Occasion' },
              ],
            },
            {
              id: 'field_theme',
              type: 'text',
              label: 'Event Theme or Color Scheme',
              placeholder: 'e.g. Pastel Pink & Gold, Mermaid, Space, Floral',
              required: false,
              order: 2,
            },
            {
              id: 'field_date',
              type: 'date',
              label: 'Event Date / Needed By',
              required: true,
              order: 3,
            },
          ],
        },
        {
          id: 'step_details',
          title: 'Cake Pop Details',
          description: 'Flavors, quantity, and decorative specifications',
          order: 2,
          fields: [
            {
              id: 'field_quantity',
              type: 'number',
              label: 'Quantity (Pops / Dozens)',
              placeholder: 'e.g. 24',
              required: true,
              order: 1,
            },
            {
              id: 'field_flavors',
              type: 'multiselect',
              label: 'Preferred Flavors',
              required: false,
              order: 2,
              options: [
                { value: 'Chocolate', label: 'Rich Chocolate Truffle' },
                { value: 'Vanilla', label: 'Classic Vanilla Bean' },
                { value: 'Red Velvet', label: 'Velvet Dream' },
                { value: 'Strawberry', label: 'Strawberry Shortcake' },
                { value: 'Salted Caramel', label: 'Salted Caramel Delight' },
                { value: 'Cookies & Cream', label: 'Cookies & Cream' },
              ],
            },
            {
              id: 'field_description',
              type: 'textarea',
              label: 'Design Details & Special Requests',
              placeholder: 'Describe shapes, frosting drizzles, sprinkles, character toppers, or specific requests...',
              required: true,
              order: 3,
            },
            {
              id: 'field_packaging',
              type: 'radio',
              label: 'Packaging Preference',
              required: false,
              order: 4,
              options: [
                { value: 'Individually Wrapped', label: 'Individually wrapped with satin ribbon' },
                { value: 'Display Tower', label: 'Display tower ready for tabletop' },
                { value: 'Standard Bakery Box', label: 'Eco-friendly bakery transport box' },
              ],
            },
          ],
        },
        {
          id: 'step_contact',
          title: 'Photos & Contact',
          description: 'Upload references and provide delivery contact information',
          order: 3,
          fields: [
            {
              id: 'field_ref_image',
              type: 'file',
              label: 'Reference Image / Mood Board',
              required: false,
              order: 1,
            },
            {
              id: 'field_phone',
              type: 'text',
              label: 'Contact Phone Number',
              placeholder: '+91 98765 43210',
              required: true,
              order: 2,
            },
            {
              id: 'field_whatsapp_chat',
              type: 'whatsapp_chat',
              label: 'WhatsApp Quick Consultation',
              whatsappNumber: '+91 98765 43210',
              whatsappMessage: 'Hi CakePopRush, I have a question about my custom cake pop order!',
              required: false,
              order: 3,
            },
          ],
        },
      ],
    },
    {
      id: 'product',
      name: 'Product Customization',
      description: 'Personalize an existing cake pop signature design with custom coatings, sprinkles, and ribbons.',
      icon: 'sparkles',
      enabled: true,
      steps: [
        {
          id: 'step_prod_customization',
          title: 'Custom Elements',
          description: 'Tweak this signature product to match your event theme',
          order: 1,
          fields: [
            {
              id: 'field_coating',
              type: 'dropdown',
              label: 'Chocolate Coating Tint',
              required: false,
              order: 1,
              options: [
                { value: 'Default', label: 'Original Product Coating' },
                { value: 'Pastel Pink', label: 'Pastel Pink Chocolate' },
                { value: 'Baby Blue', label: 'Baby Blue Chocolate' },
                { value: 'Gold Shimmer', label: 'Ivory with Edible Gold Shimmer' },
                { value: 'Dark Ganache', label: 'Dark Velvet Ganache' },
              ],
            },
            {
              id: 'field_toppers',
              type: 'dropdown',
              label: 'Topper & Sprinkles',
              required: false,
              order: 2,
              options: [
                { value: 'Standard', label: 'Standard Signature Sprinkles' },
                { value: 'Sugar Pearls', label: 'Pearlescent Sugar Pearls' },
                { value: 'Custom Edible Monogram', label: 'Custom Edible Monogram / Initial' },
                { value: 'Gold Flakes', label: '24K Edible Gold Leaf Accents' },
              ],
            },
            {
              id: 'field_notes',
              type: 'textarea',
              label: 'Special Customization Notes',
              placeholder: 'Add any specific requirements for this flavor customization...',
              required: false,
              order: 3,
            },
          ],
        },
        {
          id: 'step_prod_event',
          title: 'Quantity & Date',
          description: 'Provide order quantity and desired delivery date',
          order: 2,
          fields: [
            {
              id: 'field_prod_quantity',
              type: 'number',
              label: 'Quantity (Pops)',
              placeholder: 'e.g. 12',
              required: true,
              order: 1,
            },
            {
              id: 'field_prod_date',
              type: 'date',
              label: 'Delivery Date',
              required: true,
              order: 2,
            },
            {
              id: 'field_prod_phone',
              type: 'text',
              label: 'Contact Phone Number',
              placeholder: '+91 98765 43210',
              required: true,
              order: 3,
            },
          ],
        },
      ],
    },
  ],
};

export const CustomOrderConfig =
  mongoose.models.CustomOrderConfig ||
  mongoose.model<ICustomOrderConfig>('CustomOrderConfig', CustomOrderConfigSchema);

export default CustomOrderConfig;
