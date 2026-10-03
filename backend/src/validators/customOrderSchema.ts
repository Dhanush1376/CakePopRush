import { z } from 'zod';

export const safeUrlSchema = z
  .string()
  .trim()
  .max(10 * 1024 * 1024, 'Image or attachment URL exceeds 10MB limit')
  .refine(
    (url) =>
      !url ||
      url.startsWith('https://') ||
      url.startsWith('http://') ||
      url.startsWith('/') ||
      url.startsWith('data:image/'),
    {
      message: 'Image or attachment URL must start with http, https, relative path, or data:image/',
    }
  );

const emailSchema = z
  .string()
  .trim()
  .email('Invalid email address')
  .optional()
  .or(z.literal(''))
  .transform((val) => (val === '' ? undefined : val));

export const safeCustomDetailsSchema = z
  .record(z.any())
  .optional()
  .default({})
  .refine(
    (details) => {
      if (!details || typeof details !== 'object') return true;
      const keys = Object.getOwnPropertyNames(details);
      if (keys.length > 60) return false;
      for (const k of keys) {
        if (k.startsWith('$')) return false;
        if (k === '__proto__' || k === 'constructor' || k === 'prototype') return false;
        if (k.length > 120) return false;
      }
      if (Object.prototype.hasOwnProperty.call(details, '__proto__')) return false;
      if (Object.prototype.hasOwnProperty.call(details, 'constructor')) return false;
      if (Object.prototype.hasOwnProperty.call(details, 'prototype')) return false;
      return true;
    },
    {
      message:
        'Invalid customization details: keys cannot contain $ or prototype properties and must be under 120 characters',
    }
  )
  .transform((details) => {
    if (!details || typeof details !== 'object') return {};
    const sanitized: Record<string, any> = {};
    for (const [k, v] of Object.entries(details)) {
      const safeKey = k.replace(/\./g, '_');
      if (typeof v === 'string') {
        sanitized[safeKey] = v.slice(0, 5000).trim();
      } else if (typeof v === 'number' || typeof v === 'boolean') {
        sanitized[safeKey] = v;
      } else if (Array.isArray(v)) {
        sanitized[safeKey] = v.slice(0, 50).map((item) =>
          typeof item === 'string' ? item.slice(0, 500).trim() : item
        );
      } else if (v === null) {
        sanitized[safeKey] = null;
      }
    }
    return sanitized;
  });

const attachmentItemSchema = z.object({
  url: safeUrlSchema,
  originalName: z.string().trim().max(255).optional(),
  mimeType: z
    .string()
    .trim()
    .max(100)
    .refine(
      (val) =>
        !val ||
        val.startsWith('image/') ||
        val === 'application/pdf' ||
        val === 'application/msword' ||
        val === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      { message: 'Invalid or unsupported attachment MIME type' }
    )
    .optional(),
  size: z.number().max(10 * 1024 * 1024, 'Attachment file size exceeds 10MB').optional(),
});

export const createCustomOrderSchema = z.object({
  occasionDescription: z
    .string({ required_error: 'Occasion description / vision is required' })
    .trim()
    .min(3, 'Description must be at least 3 characters')
    .max(5000, 'Description must be at most 5000 characters'),
  targetDate: z
    .string({ required_error: 'Target date is required' })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Target date must be a valid date',
    }),
  quantity: z
    .union([z.number(), z.string()])
    .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val))
    .pipe(z.number().int().min(1, 'Quantity must be at least 1').max(10000, 'Quantity cannot exceed 10,000 units')),
  mobileNumber: z.string().trim().max(35).optional().default(''),
  customerPhone: z.string().trim().max(35).optional(),
  customerName: z.string().trim().max(120).optional(),
  customerEmail: emailSchema,
  occasion: z.string().trim().max(100).optional().default('Custom'),
  budget: z.union([z.string().trim().max(50), z.number()]).optional(),
  designImage: safeUrlSchema.optional(),
  attachments: z.array(attachmentItemSchema).max(10, 'Cannot exceed 10 attachments').optional().default([]),
  productId: z
    .string()
    .trim()
    .max(100)
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
  customizationDetails: safeCustomDetailsSchema,
  formVersion: z.number().int().min(1).optional(),
});

export const updateCustomOrderSchema = z.object({
  occasionDescription: z
    .string()
    .trim()
    .min(3, 'Description must be at least 3 characters')
    .max(5000, 'Description must be at most 5000 characters')
    .optional(),
  targetDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Target date must be a valid date',
    })
    .optional(),
  quantity: z
    .union([z.number(), z.string()])
    .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val))
    .pipe(z.number().int().min(1, 'Quantity must be at least 1').max(10000, 'Quantity cannot exceed 10,000 units'))
    .optional(),
  mobileNumber: z.string().trim().max(35).optional(),
  customerPhone: z.string().trim().max(35).optional(),
  customerName: z.string().trim().max(120).optional(),
  customerEmail: emailSchema,
  occasion: z.string().trim().max(100).optional(),
  budget: z.union([z.string().trim().max(50), z.number()]).optional(),
  designImage: safeUrlSchema.optional(),
  attachments: z.array(attachmentItemSchema).max(10, 'Cannot exceed 10 attachments').optional(),
  customizationDetails: safeCustomDetailsSchema.optional(),
});

export const adminUpdateCustomOrderStatusSchema = z.object({
  status: z.enum(
    [
      'Pending Quote',
      'Quoted',
      'Approved',
      'In Progress',
      'Completed',
      'Rejected',
    ],
    {
      errorMap: () => ({
        message:
          "Status must be one of: 'Pending Quote', 'Quoted', 'Approved', 'In Progress', 'Completed', 'Rejected'",
      }),
    }
  ),
  note: z.string().trim().max(1000).optional(),
});

export const adminUpdateCustomOrderNotesSchema = z.object({
  adminNotes: z.string().trim().max(10000).optional(),
  internalNote: z.string().trim().max(5000).optional(),
});

export const customOrderConfigTypeSchema = z.object({
  id: z.string().trim().min(1).max(100),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional().default(''),
  icon: z.string().trim().max(50).optional().default('cake'),
  enabled: z.boolean().default(true),
  steps: z
    .array(
      z.object({
        id: z.string().trim().min(1).max(100),
        title: z.string().trim().min(1).max(120),
        description: z.string().trim().max(500).optional().default(''),
        order: z.number().default(0),
        isHidden: z.boolean().default(false),
        fields: z
          .array(
            z.object({
              id: z.string().trim().min(1).max(100),
              type: z.string().trim().max(50),
              label: z.string().trim().min(1).max(150),
              placeholder: z.string().trim().max(200).optional().default(''),
              helpText: z.string().trim().max(300).optional().default(''),
              required: z.boolean().default(false),
              options: z
                .array(
                  z.object({
                    value: z.string().trim().max(150),
                    label: z.string().trim().max(150),
                  })
                )
                .optional(),
              whatsappNumber: z.string().trim().max(35).optional().default(''),
              whatsappMessage: z.string().trim().max(500).optional().default(''),
              order: z.number().default(0),
            })
          )
          .default([]),
      })
    )
    .default([]),
});

export const adminCustomOrderConfigSchema = z.object({
  types: z.array(customOrderConfigTypeSchema).min(1, 'At least one customization type is required'),
});
