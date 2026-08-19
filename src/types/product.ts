import React from 'react';

export interface ProductImage {
  id: string
  url: string
  alt: string
}

export interface ProductVariant {
  id: string
  name: string
  price: number
}

export interface Flavour {
  id: string
  name: string
  priceModifier: number
  colorHex?: string
  imageUrl?: string
}

export interface QuantityOption {
  id: string
  label: string
  pieces: number
  priceModifier: number
}

export interface AddOn {
  id: string
  name: string
  price: number
}

export interface NutritionInfo {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface FAQ {
  question: string
  answer: string
}

export interface Product {
  id: string
  slug: string
  name: string
  categoryName: string
  images: ProductImage[]
  basePrice: number
  compareAtPrice?: number
  isBestSeller?: boolean
  isCustomizable?: boolean
  isNew?: boolean
  isLimitedEdition?: boolean
  isVeg?: boolean
  isEggless?: boolean
  description?: string
  packSize?: string
  ingredients?: string
  allergens?: string[]
  dietaryInfo?: string[]
  nutrition?: NutritionInfo
  preparationTime?: string
  shelfLife?: string
  storage?: string
  deliveryInfo?: string
  flavours?: Flavour[]
  quantities?: QuantityOption[]
  addOns?: AddOn[]
  occasions?: string[]
  story?: string
  faqs?: FAQ[]
  variants?: ProductVariant[] // legacy, keep for compatibility
  rating?: number
  reviewCount?: number
  relatedProducts?: string[] // IDs of related products
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image?: string | null;
  items?: number;
  products: number;
  status: string;
  created: string;
  icon?: React.ElementType;
  color?: string;
  bg?: string;
}
