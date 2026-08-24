import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, UploadCloud, ChevronLeft, ChevronRight } from 'lucide-react'
import styles from './HomePage.module.css'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'
import { ProductCard } from '@/components/commerce/ProductCard'
import { productData, Category } from '@/features/products'
import { Product } from '@/types/product'
import { CustomOrderQuickModal } from '@/components/commerce/CustomOrderQuickModal'
import { useToast } from '@/components/ui/ToastContext'

const CATEGORY_IMAGES: Record<string, string> = {
  'cake-pops': '/images/Products/White choclate cakepops.jpeg',
  'cupcakes': '/images/Products/biscoff filled chocolate cupcakes.jpeg',
  'cookies': '/images/Products/Choclate chip cookies.jpeg',
  'brownies': '/images/Products/Chocolate gooey brownie.jpeg',
  'desserts': '/images/Products/nutella biscoff sandwich.jpeg',
  'cakes': '/images/Products/mini valentine cake.jpeg',
  'macarons': '/images/Products/pista flavoured rainbow chips.jpeg',
  'cake-jars': '/images/Products/chocolate nutella cake jar.jpeg',
  'gift-boxes': '/images/Products/asorted flavours of cookies.jpeg',
}

export const ShopByCategorySection = () => {
  const navigate = useNavigate()
  const [categories, setCategories] = React.useState<Category[]>([])
  const [products, setProducts] = React.useState<Product[]>([])

  React.useEffect(() => {
    Promise.all([
      productData.getCategories(),
      productData.getProducts()
    ]).then(([cats, prods]) => {
      setCategories(cats)
      setProducts(prods)
    })
  }, [])

  const scrollRef = React.useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <section className={styles.section}>
      <Container>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Shop by Category</h2>
          <button onClick={() => navigate('/shop')} style={{ background: 'none', border: 'none', borderBottom: '1px solid var(--color-chocolate)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px', padding: 0, paddingBottom: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-chocolate)', fontWeight: 600 }}>
            VIEW ALL
            <ArrowRight size={10} strokeWidth={2} />
          </button>
        </div>
        <div className={styles.scrollContainerWrapper}>
          <button
            className={`${styles.scrollButton} ${styles.scrollLeft}`}
            onClick={() => scroll('left')}
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} />
          </button>

          <div className={styles.categoryGrid} ref={scrollRef}>
            {categories.slice(1).map((category) => {
              const imageUrl = CATEGORY_IMAGES[category.id] || products.find(p => p.categoryName === category.name)?.images[0]?.url || '/images/Products/White choclate cakepops.jpeg';
              return (
                <div
                  key={category.id}
                  className={styles.categoryCardImage}
                  onClick={() => navigate(`/shop?category=${category.id}`)}
                >
                  <div className={styles.categoryImageWrapper}>
                    <img src={imageUrl} alt={category.name} className={styles.categoryImage} loading="lazy" decoding="async" />
                    <div className={styles.categoryImageOverlay} />
                  </div>
                  <h3 className={styles.categoryImageTitle}>{category.name}</h3>
                </div>
              )
            })}
          </div>

          <button
            className={`${styles.scrollButton} ${styles.scrollRight}`}
            onClick={() => scroll('right')}
            aria-label="Scroll right"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </Container>
    </section>
  )
}

export const NewLaunchSection = () => {
  const navigate = useNavigate()
  const [newLaunches, setNewLaunches] = React.useState<Product[]>([])

  React.useEffect(() => {
    productData.getProducts().then(products => {
      setNewLaunches(products.filter(p => p.isNew))
    })
  }, [])

  if (newLaunches.length === 0) return null;

  return (
    <section className={styles.section}>
      <Container>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>New Launches</h2>
          <button onClick={() => navigate('/shop?filter=new')} style={{ background: 'none', border: 'none', borderBottom: '1px solid var(--color-chocolate)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px', padding: 0, paddingBottom: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-chocolate)', fontWeight: 600 }}>
            VIEW ALL
            <ArrowRight size={10} strokeWidth={2} />
          </button>
        </div>
        <div className={styles.productHorizontalScroll}>
          {newLaunches.map(product => (
            <div key={product.id} className={styles.horizontalScrollItem}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

export const BestSellersSection = () => {
  const navigate = useNavigate()
  const [bestSellers, setBestSellers] = React.useState<Product[]>([])

  React.useEffect(() => {
    productData.getBestSellingProducts(8).then(setBestSellers)
  }, [])
  return (
    <section className={styles.section}>
      <Container>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Our Best Sellers</h2>
          <button onClick={() => navigate('/shop')} style={{ background: 'none', border: 'none', borderBottom: '1px solid var(--color-chocolate)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px', padding: 0, paddingBottom: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-chocolate)', fontWeight: 600 }}>
            VIEW ALL
            <ArrowRight size={10} strokeWidth={2} />
          </button>
        </div>
        <div className={styles.productGrid}>
          {bestSellers.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>
    </section>
  )
}

export const OccasionSection = () => {
  const navigate = useNavigate()

  return (
    <section className={styles.occasionSection}>
      <Container>
        <div className={styles.occasionContent}>
          <p className={styles.occasionEyebrow}>MAKE IT MEMORABLE</p>
          <h2 className={styles.occasionTitle}>Celebrate with Cake Pops</h2>
          <p className={styles.occasionDesc}>
            From intimate birthdays to grand weddings, our custom creations bring a pop of joy to every celebration.
          </p>
          <Button variant="primary" onClick={() => navigate('/shop')}>
            Explore Occasions
          </Button>
        </div>
      </Container>
    </section>
  )
}

export const FestiveOccasionsSection = () => {
  const navigate = useNavigate()

  const occasions = [
    { id: 'diwali', name: 'Diwali', image: '/images/Products/asorted flavours of cookies.jpeg' },
    { id: 'rakhi', name: 'Rakhi', image: '/images/Products/Milk choclate cakepops.jpeg' },
    { id: 'birthdays', name: 'Birthdays', image: '/images/Products/Dark choclate cakepops.jpeg' },
    { id: 'christmas', name: 'Christmas', image: '/images/Products/Red velvet cookies.jpeg' },
    { id: 'weddings', name: 'Weddings', image: '/images/Products/White choclate cakepops.jpeg' },
    { id: 'valentines', name: 'Valentines', image: '/images/Products/mini valentine cake.jpeg' },
    { id: 'baby-showers', name: 'Baby Showers', image: '/images/Products/Oreo pops.jpeg' },
  ]

  return (
    <section className={styles.section}>
      <Container>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Shop by Occasion</h2>
          <button onClick={() => navigate('/shop')} style={{ background: 'none', border: 'none', borderBottom: '1px solid var(--color-chocolate)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px', padding: 0, paddingBottom: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-chocolate)', fontWeight: 600 }}>
            VIEW ALL
            <ArrowRight size={10} strokeWidth={2} />
          </button>
        </div>
        <div className={styles.asymmetricalScroll}>
          {occasions.map((occasion) => (
            <div
              key={occasion.id}
              className={styles.asymmetricalCard}
              onClick={() => navigate(`/shop?occasion=${occasion.id}`)}
            >
              <img src={occasion.image} alt={occasion.name} className={styles.asymmetricalImage} loading="lazy" decoding="async" />
              <span className={styles.asymmetricalTitle}>{occasion.name}</span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

export const BrandStorySection = () => {
  return (
    <section className={styles.section}>
      <Container>
        <div className={styles.brandStoryGrid}>
          <div className={styles.brandStoryImageWrapper}>
            <img
              src="/images/Products/Oreo pops.jpeg"
              alt="Handcrafting cake pops"
              className={styles.brandStoryImage}
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className={styles.brandStoryContent}>
            <h2 className={styles.sectionTitle}>Handcrafted with Love</h2>
            <p className={styles.brandStoryText}>
              At CakePopRush, we believe that the best things come in small packages.
              Every single pop is baked fresh, hand-rolled, and carefully dipped by our artisan bakers
              using only the finest ingredients.
            </p>
            <p className={styles.brandStoryText}>
              No shortcuts. Just pure, bite-sized happiness.
            </p>
          </div>
        </div>
      </Container>
    </section>
  )
}

export const CustomOrderSection = () => {
  const [design, setDesign] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleInitialSubmit = () => {
    if (!design) {
      setError('Please upload a design inspiration image.');
      return;
    }
    if (!description.trim()) {
      setError('Please provide a description.');
      return;
    }
    setError('');
    setIsModalOpen(true);
  };

  const handleFinalSubmit = (data: any) => {
    setIsModalOpen(false);
    toast({
      title: 'Custom request submitted!',
      type: 'success',
      duration: 3000
    });
    setDesign(null);
    setDescription('');
  };

  return (
    <section className={styles.customOrderSection}>
      <Container>
        <div className={styles.customOrderHeader}>
          <h2 className={styles.customOrderTitle}>Want Something Unique?</h2>
          <p className={styles.customOrderSubtitle}>Request a custom order in 2 simple steps</p>
        </div>

        <div className={styles.customOrderFlow}>
          <div className={styles.flowStep}>
            <div className={styles.flowCard}>
              <div className={styles.stepIndicator}>Step 1 of 2</div>
              <div
                className={`${styles.uploadArea} ${design ? styles.hasImage : ''}`}
                onClick={() => document.getElementById('home-design-upload')?.click()}
                style={design ? { padding: 0, borderStyle: 'solid', borderWidth: '1px', borderColor: 'var(--color-brand-pink)', backgroundColor: '#fff', overflow: 'hidden' } : {}}
              >
                {design ? (
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <img
                      src={URL.createObjectURL(design)}
                      alt="Design preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '15px' }}
                    />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px', background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)', pointerEvents: 'none', borderBottomLeftRadius: '15px', borderBottomRightRadius: '15px' }}></div>
                    <div style={{ position: 'absolute', bottom: '12px', left: 0, width: '100%', textAlign: 'center', fontSize: '0.8rem', color: 'white', fontWeight: 600, zIndex: 2, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                      Click to change image
                    </div>
                  </div>
                ) : (
                  <>
                    <UploadCloud className={styles.uploadIcon} size={32} strokeWidth={1.5} />
                    <span className={styles.uploadText}>Click to upload or drag & drop</span>
                    <span className={styles.uploadSubtext}>PNG, JPG or GIF (max. 5MB)</span>
                  </>
                )}
                <input
                  id="home-design-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setDesign(e.target.files[0]);
                      setError('');
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className={styles.flowArrow}>
            <ArrowRight size={32} strokeWidth={1.5} />
          </div>

          <div className={styles.flowStep}>
            <div className={styles.flowCard}>
              <div className={styles.stepIndicator}>Step 2 of 2</div>
              <textarea
                className={styles.textArea}
                placeholder="E.g., It's for a baby shower. I need 2 dozen cake pops in pastel pink and white with vanilla flavor..."
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setError('');
                }}
              />

              {error && <span style={{ color: 'var(--color-error)', fontSize: '12px', marginTop: '8px', display: 'block' }}>{error}</span>}

              <div className={styles.stepNavTwo}>
                <Button variant="primary" style={{ flex: 1, marginTop: '16px' }} onClick={handleInitialSubmit}>
                  Submit Request
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Container>

      <CustomOrderQuickModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFinalSubmit}
      />
    </section>
  )
}
