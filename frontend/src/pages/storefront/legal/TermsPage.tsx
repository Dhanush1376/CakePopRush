import React, { useEffect } from 'react'
import { Container } from '@/components/layout/Container'
import styles from './LegalPage.module.css'

export function TermsPage() {
  useEffect(() => {
    document.title = 'Terms & Conditions | Cake Pop Rush'
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className={styles.page}>
      <Container>
        <div className={styles.header}>
          <h1 className={styles.title}>Terms & Conditions</h1>
          <p className={styles.subtitle}>Please read these terms carefully before using our services.</p>
        </div>

        <div className={styles.content}>
          <p className={styles.lastUpdated}>Last Updated: August 2026</p>

          <h2>1. Introduction</h2>
          <p>
            Welcome to Cake Pop Rush! These Terms & Conditions govern your use of our website and services. By accessing or using our platform to order our handcrafted cake pops, you agree to comply with and be bound by these terms. If you do not agree with any part of these terms, please do not use our services.
          </p>

          <h2>2. Ordering and Payments</h2>
          <p>
            All orders are subject to availability and acceptance by Cake Pop Rush. We reserve the right to refuse or cancel any order for reasons including, but not limited to, product availability, errors in pricing, or suspicion of fraudulent activity.
          </p>
          <ul>
            <li><strong>Payment Methods:</strong> We accept major credit cards, UPI, and digital wallets. Payments are processed securely.</li>
            <li><strong>Pricing:</strong> Prices are subject to change without notice. The price displayed at checkout is the final price for your order.</li>
            <li><strong>Custom Orders:</strong> For customized orders, a minimum deposit may be required, and full payment must be made prior to preparation.</li>
          </ul>

          <h2>3. Shipping and Delivery</h2>
          <p>
            We strive to deliver your sweet treats fresh and on time. Delivery times are estimates and may be affected by external factors such as weather or traffic. 
          </p>
          <ul>
            <li>Cake Pop Rush is not liable for delays caused by third-party delivery services.</li>
            <li>Please ensure someone is available to receive the package, as our products are perishable.</li>
          </ul>

          <h2>4. Cancellations and Refunds</h2>
          <p>
            Due to the perishable nature of our products, we have a strict cancellation and refund policy:
          </p>
          <ul>
            <li><strong>Cancellations:</strong> Orders must be canceled at least 48 hours prior to the scheduled delivery date for a full refund.</li>
            <li><strong>Refunds:</strong> If you receive a damaged or incorrect product, please contact us within 12 hours of delivery with photographic evidence, and we will issue a replacement or refund.</li>
          </ul>

          <h2>5. Allergen Information</h2>
          <p>
            Our products are prepared in a facility that may handle common allergens, including dairy, eggs, wheat, soy, peanuts, and tree nuts. While we take precautions to prevent cross-contamination, we cannot guarantee that any product is entirely free of these allergens. It is the customer's responsibility to review the ingredient and allergen information provided on our website before consuming.
          </p>

          <h2>6. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Cake Pop Rush shall not be liable for any indirect, incidental, or consequential damages arising out of your use of our products or services. Our total liability for any claim shall not exceed the amount you paid for the product in question.
          </p>

          <h2>7. Contact Information</h2>
          <p>
            If you have any questions or concerns about these Terms & Conditions, please reach out to our team at:
          </p>
          <p>
            <strong>Email:</strong> <a href="mailto:hello@cakepoprush.com">hello@cakepoprush.com</a><br/>
            <strong>Phone:</strong> +91 98765 43210
          </p>
        </div>
      </Container>
    </div>
  )
}
