import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { ProductCard } from '@/components/commerce/ProductCard'
import { Product } from '@/types/product'
import styles from './RelatedProducts.module.css'

interface RelatedProductsProps {
  products: Product[]
}

export const RelatedProducts = ({ products }: RelatedProductsProps) => {
  if (!products || products.length === 0) return null

  return (
    <div className={styles.section}>
      <Container>
        <div className={styles.header}>
          <h2 className={styles.title}>You May Also Like</h2>
          <Link to="/shop" className={styles.viewAllBtn}>
            See all <ArrowRight size={16} />
          </Link>
        </div>
        <div className={styles.grid}>
          {products.map(product => (
            <div key={product.id} className={styles.cardWrapper}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </Container>
    </div>
  )
}
