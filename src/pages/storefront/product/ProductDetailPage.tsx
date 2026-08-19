import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronRight, ShoppingBag, Tag, Info } from 'lucide-react'
import { productData } from '@/features/products'
import { reviewData } from '@/features/reviews'
import { Product } from '@/types/product'

import styles from './ProductDetailPage.module.css'
import { Container } from '@/components/layout/Container'
import { Accordion } from '@/components/ui/Accordion'
import { usePDPState } from '@/features/products/hooks/usePDPState'

import {
  PDPSkeleton,
  ProductGallery,
  ProductInfo,
  QuantitySelector,
  AddOnSelector,
  CouponsSection,
  PurchaseActions,
  StickyMobileCTA,
  IngredientsAndNutrition,
  RelatedProducts
} from '@/features/products'

import { ReviewsSection } from '@/features/reviews'

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()

  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use centralized state for PDP logic
  const { state, actions } = usePDPState(product || undefined)

  useEffect(() => {
    // Simulate API fetch
    setIsLoading(true)
    setError(null)

    setTimeout(() => {
      const found = productData.getProducts().find(p => p.slug === id || p.id === id)
      if (found) {
        setProduct(found)
        document.title = `${found.name} | CakePopRush`
      } else {
        setError("We couldn't find the sweet treat you're looking for.")
      }
      setIsLoading(false)
    }, 800) // Simulate network delay for skeleton preview

    // Cleanup scroll to top on mount
    window.scrollTo(0, 0)
  }, [id])

  if (isLoading) return <PDPSkeleton />
  if (error || !product) {
    return (
      <Container className={styles.errorContainer}>
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <h2>Product Not Found</h2>
          <p>{error || "Something went a little sideways."}</p>
          <Link to="/shop" style={{ color: 'var(--color-brand-pink)', textDecoration: 'underline' }}>Return to Shop</Link>
        </div>
      </Container>
    )
  }

  const isOutOfStock = false // Hardcoded for now, could be in product data
  const relatedProds = productData.getRelatedProducts(product.id)

  return (
    <div className={styles.productPage}>
      <Container>
        {/* Breadcrumbs */}
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <ChevronRight size={14} />
          <Link to="/shop">Shop</Link>
          <ChevronRight size={14} />
          <Link to={`/shop?category=${product.categoryName}`}>{product.categoryName}</Link>
          <ChevronRight size={14} />
          <span aria-current="page">{product.name}</span>
        </nav>

        <div className={styles.productGrid}>
          {/* LEFT: Gallery */}
          <div className={styles.galleryColumn}>
            <ProductGallery
              images={product.images}
              productName={product.name}
              isBestseller={true}
              isEggless={true}
            />
          </div>

          {/* RIGHT: Info & Customization */}
          <div className={styles.infoColumn}>
            <div className={styles.stickyPanel}>
              {/* Header Info */}
              <ProductInfo
                product={product}
                calculatedTotal={state.calculatedTotal}
                mascotMessage={state.mascotMessage}
              />

              <CouponsSection currentTotal={state.calculatedTotal} />

              <div className={styles.customizationArea}>

                {product.quantities && (
                  <Accordion
                    title="1. Choose Quantity / Box Size"
                    icon={<ShoppingBag size={14} />}
                    isRequired
                    isDefaultOpen={true}
                  >
                    <QuantitySelector
                      quantities={product.quantities}
                      selectedId={state.selectedQuantityId}
                      onChange={actions.setSelectedQuantityId}
                      basePrice={product.basePrice + (product.flavours?.find(f => f.id === state.selectedFlavourId)?.priceModifier || 0)}
                    />
                  </Accordion>
                )}

                {product.addOns && (
                  <Accordion
                    title="2. Add-ons"
                    icon={<Tag size={14} />}
                  >
                    <AddOnSelector
                      addOns={product.addOns}
                      selectedAddOns={state.selectedAddOns}
                      onToggle={actions.toggleAddOn}
                    />
                  </Accordion>
                )}


                <Accordion
                  title="Ingredients & Nutrition"
                  icon={<Info size={14} />}
                  isDefaultOpen={true}
                  hideStatus={true}
                >
                  <IngredientsAndNutrition
                    ingredients={product.ingredients}
                    allergens={product.allergens}
                    dietaryInfo={product.dietaryInfo}
                    nutrition={product.nutrition}
                  />
                </Accordion>

              </div>




              <div className={styles.purchaseActionsWrapper}>
                <PurchaseActions
                  onAddToCart={actions.addToCart}
                  onToggleSave={actions.toggleWishlist}
                  isSaved={state.isWishlisted}
                  isOutOfStock={isOutOfStock}
                />
              </div>
            </div>
          </div>
        </div>
      </Container>



      <ReviewsSection
        rating={product.rating}
        reviewCount={product.reviewCount}
        reviews={reviewData.getReviewsByProductId(product.id)}
        productSlug={product.slug}
      />


      <RelatedProducts products={relatedProds} />

      {/* Temporarily hidden per user request */}
      {false && (
        <StickyMobileCTA
          totalPrice={state.calculatedTotal}
          onAddToCart={actions.addToCart}
          onBuyNow={() => { }}
        />
      )}
    </div>
  )
}
