import { useNavigate } from 'react-router-dom'
import { ArrowRight, Star, Gift, Wand2, Truck, Heart } from 'lucide-react'
import styles from './HomePage.module.css'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'
import { Balloon } from '@/components/decorative/Balloon'
import { Bunting } from '@/components/decorative/Bunting'
import { ConfettiDots } from '@/components/decorative/ConfettiDots'

export const HeroSection = () => {
  const navigate = useNavigate()

  return (
    <section className={styles.heroSection}>
      {/* Decorative Elements */}
      <div className={styles.heroDecorations}>
        <div className={styles.balloonLeft}>
          <Balloon color="turquoise" size={120} />
        </div>
        <div className={styles.balloonRight}>
          <Balloon color="yellow" size={160} />
        </div>
        <div className={styles.buntingTopRight}>
          <Bunting />
        </div>
        <ConfettiDots density={20} className={styles.confetti} />
      </div>

      <Container>
        <div className={styles.heroGrid}>
          {/* Content Column */}
          <div className={styles.heroContent}>
            <p className={styles.heroEyebrow}>SMALL BITES. BIG CELEBRATIONS.</p>
            <h1 className={styles.heroHeading}>
              <span className={styles.textBrown}>Delight in</span><br />
              <span className={styles.textPink}>every</span>{' '}
              <span className={styles.textTurquoise}>pop!</span>
            </h1>
            <p className={styles.heroSubtext}>
              Handcrafted cake pops and desserts made with love for every occasion.
            </p>
            
            <Button size="lg" variant="primary" className={styles.heroCta} onClick={() => navigate('/shop')}>
              SHOP NOW
              <span className={styles.ctaIconWrapper}>
                <ArrowRight size={16} color="var(--color-brand-pink)" />
              </span>
            </Button>
          </div>

          {/* Image Column */}
          <div className={styles.heroImageWrapper}>
            <img 
              src="/images/Products/asorted flavours of cookies.jpeg" 
              alt="Assorted Cake Pops in a mug" 
              className={styles.heroImage}
              loading="eager"
            />
            {/* Freshly Made Stamp (simplified with CSS for now) */}
            <div className={styles.freshlyMadeStamp}>
              <svg viewBox="0 0 100 100" width="100" height="100">
                <path id="curve" d="M 50,50 m -40,0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0" fill="transparent" />
                <text className={styles.stampText}>
                  <textPath href="#curve" startOffset="0%">
                    FRESHLY MADE • WITH LOVE •
                  </textPath>
                </text>
              </svg>
              <div className={styles.stampHeart}><Heart size={20} fill="currentColor" strokeWidth={0} /></div>
            </div>
          </div>
        </div>
      </Container>
      
      {/* Bottom Wave to transition to next section */}
      <div className={styles.heroWaveBottom}>
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,0 C320,120 420,120 720,60 C1020,0 1120,0 1440,60 L1440,120 L0,120 Z" fill="var(--color-cream)" />
        </svg>
      </div>
    </section>
  )
}

export const USPBar = () => {
  return (
    <div className={styles.uspContainerWrapper}>
      <Container>
        <div className={styles.uspBar}>
          <div className={styles.uspItem}>
            <div className={`${styles.uspIcon} ${styles.uspIconPink}`}>
              <Star size={24} color="white" />
            </div>
            <div className={styles.uspText}>
              <h4>PREMIUM INGREDIENTS</h4>
              <p>We use the finest ingredients always.</p>
            </div>
          </div>

          <div className={styles.uspItem}>
            <div className={`${styles.uspIcon} ${styles.uspIconYellow}`}>
              <Gift size={24} color="white" />
            </div>
            <div className={styles.uspText}>
              <h4>PERFECT FOR EVERY OCCASION</h4>
              <p>Birthdays, Weddings, Festivals & more.</p>
            </div>
          </div>

          <div className={styles.uspItem}>
            <div className={`${styles.uspIcon} ${styles.uspIconTurquoise}`}>
              <Wand2 size={24} color="white" />
            </div>
            <div className={styles.uspText}>
              <h4>CUSTOM MADE JUST FOR YOU</h4>
              <p>Personalize your cake pops your way.</p>
            </div>
          </div>

          <div className={styles.uspItem}>
            <div className={`${styles.uspIcon} ${styles.uspIconPink}`}>
              <Truck size={24} color="white" />
            </div>
            <div className={styles.uspText}>
              <h4>SAFE & ON-TIME DELIVERY</h4>
              <p>Freshness delivered to your doorstep.</p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
