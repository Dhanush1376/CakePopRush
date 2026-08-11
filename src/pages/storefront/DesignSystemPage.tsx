import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProductCard } from '@/components/commerce/ProductCard'
import { CategoryChip } from '@/components/commerce/CategoryChip'
import { Balloon } from '@/components/decorative/Balloon'
import { Bunting } from '@/components/decorative/Bunting'
import { WavyDivider } from '@/components/decorative/WavyDivider'
import { ShoppingBag, Heart, Search, Menu, ArrowRight, Star } from 'lucide-react'
import { mockProducts } from '@/mocks/products'

export function DesignSystemPage() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
      <h1 style={{ marginBottom: '2rem', color: 'var(--color-brand-pink)' }}>Design System</h1>
      
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1rem', borderBottom: '2px solid var(--color-border)' }}>1. Buttons</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h3>Variants</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem', alignItems: 'center' }}>
              <Button variant="primary">Primary (Pink)</Button>
              <Button variant="secondary">Secondary (Yellow)</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </div>

          <div>
            <h3>Sizes</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem', alignItems: 'center' }}>
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>

          <div>
            <h3>States</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem', alignItems: 'center' }}>
              <Button disabled>Disabled</Button>
              <Button isLoading>Loading</Button>
              <Button variant="secondary" isLoading>Loading</Button>
            </div>
          </div>

          <div>
            <h3>With Icons</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem', alignItems: 'center' }}>
              <Button leftIcon={<ShoppingBag size={18} />}>Add to Bag</Button>
              <Button variant="outline" rightIcon={<Heart size={18} />}>Wishlist</Button>
            </div>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1rem', borderBottom: '2px solid var(--color-border)' }}>2. Icon Buttons & Badges</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h3>Icon Buttons</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem', alignItems: 'center' }}>
              <IconButton icon={<Menu />} />
              <IconButton variant="outline" icon={<Search />} />
              <IconButton variant="elevated" icon={<ShoppingBag />} />
              <IconButton variant="primary" icon={<ArrowRight />} />
              <IconButton disabled icon={<Heart />} />
            </div>
          </div>
          <div>
            <h3>With Badges</h3>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '1rem', alignItems: 'center' }}>
              <IconButton icon={<ShoppingBag />} badgeCount={2} />
              <IconButton variant="outline" icon={<Heart />} badgeCount={12} />
              <IconButton variant="elevated" icon={<ShoppingBag />} badgeCount={105} />
            </div>
          </div>
          <div>
            <h3>Standalone Badges</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem', alignItems: 'center' }}>
              <Badge variant="pink">Best Seller</Badge>
              <Badge variant="yellow">New</Badge>
              <Badge variant="turquoise">Customizable</Badge>
              <Badge variant="neutral">Sold Out</Badge>
            </div>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1rem', borderBottom: '2px solid var(--color-border)' }}>3. Forms</h2>
        <div style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Input label="Default Input" placeholder="Placeholder text" />
          <Input label="With Left Icon" leftIcon={<Search size={18} />} placeholder="Search products..." />
          <Input label="With Error" error="This field is required" defaultValue="Invalid value" />
          <Input label="Disabled" disabled placeholder="Cannot edit this" />
        </div>
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1rem', borderBottom: '2px solid var(--color-border)' }}>4. Skeletons</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Skeleton variant="circular" width={48} height={48} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="60%" />
            </div>
          </div>
          <Skeleton variant="rectangular" width="100%" height={200} />
          <Skeleton variant="rounded" width="100%" height={40} />
        </div>
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1rem', borderBottom: '2px solid var(--color-border)' }}>5. Empty States</h2>
        <div style={{ border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
          <EmptyState
            icon={<ShoppingBag />}
            title="Your bag is empty"
            description="Looks like you haven't added any sweet treats to your bag yet."
            action={<Button>Start Shopping</Button>}
          />
        </div>
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1rem', borderBottom: '2px solid var(--color-border)' }}>6. Commerce Components</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h3>Category Chips</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
              <CategoryChip label="All Products" isActive />
              <CategoryChip label="Cake Pops" icon={<Star size={16} />} />
              <CategoryChip label="Cupcakes" />
              <CategoryChip label="Cakesicles" />
            </div>
          </div>
          
          <div>
            <h3>Product Cards</h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
              gap: '1.5rem', 
              marginTop: '1rem' 
            }}>
              {mockProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  isWishlisted={product.id === 'prod_1'}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '3rem', position: 'relative', minHeight: '300px' }}>
        <h2 style={{ marginBottom: '1rem', borderBottom: '2px solid var(--color-border)' }}>7. Decorative Components</h2>
        
        <Bunting width="100%" />
        
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '2rem' }}>
          <Balloon color="pink" />
          <Balloon color="yellow" size={150} />
          <Balloon color="turquoise" />
        </div>
        
        <div style={{ marginTop: '2rem', backgroundColor: 'var(--color-surface-hover)', padding: '2rem 0' }}>
          <p style={{ textAlign: 'center', marginBottom: '1rem' }}>Wavy Divider Top</p>
          <WavyDivider position="top" fill="var(--color-background)" />
          
          <div style={{ height: '100px' }}></div>
          
          <WavyDivider position="bottom" fill="var(--color-background)" />
          <p style={{ textAlign: 'center', marginTop: '1rem' }}>Wavy Divider Bottom</p>
        </div>
      </section>
    </div>
  )
}
