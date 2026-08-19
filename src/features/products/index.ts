import { mockProductDataProvider } from './api/mockProductDataProvider';
export type { ProductDataProvider, Category } from './api/productDataProvider';

// Provide a stable domain data-access object backed by the current active provider
export const productData = mockProductDataProvider;

// Domain components
export { PDPSkeleton } from './components/PDPSkeleton';
export { ProductGallery } from './components/ProductGallery';
export { ProductInfo } from './components/ProductInfo';
export { FlavourSelector } from './components/FlavourSelector';
export { QuantitySelector } from './components/QuantitySelector';
export { AddOnSelector } from './components/AddOnSelector';
export { PersonalizationSection } from './components/PersonalizationSection';
export { DeliverySection } from './components/DeliverySection';
export { CouponsSection } from './components/CouponsSection';
export { OrderSummary } from './components/OrderSummary';
export { PurchaseActions } from './components/PurchaseActions';
export { CustomThemeCTA } from './components/CustomThemeCTA';
export { StickyMobileCTA } from './components/StickyMobileCTA';
export { IngredientsAndNutrition } from './components/IngredientsAndNutrition';
export { RelatedProducts } from './components/RelatedProducts';
