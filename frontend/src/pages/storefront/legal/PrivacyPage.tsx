import React, { useEffect } from 'react'
import { Container } from '@/components/layout/Container'
import styles from './LegalPage.module.css'

export function PrivacyPage() {
  useEffect(() => {
    document.title = 'Privacy Policy | Cake Pop Rush'
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className={styles.page}>
      <Container>
        <div className={styles.header}>
          <h1 className={styles.title}>Privacy Policy</h1>
          <p className={styles.subtitle}>How we collect, use, and protect your information.</p>
        </div>

        <div className={styles.content}>
          <p className={styles.lastUpdated}>Last Updated: August 2026</p>

          <h2>1. Information We Collect</h2>
          <p>
            At Cake Pop Rush, we respect your privacy and are committed to protecting your personal data. When you interact with our website, place an order, or subscribe to our newsletter, we may collect the following types of information:
          </p>
          <ul>
            <li><strong>Personal Details:</strong> Name, email address, phone number, and delivery address.</li>
            <li><strong>Payment Information:</strong> We use secure third-party payment gateways. We do not store your credit card or sensitive payment details directly on our servers.</li>
            <li><strong>Usage Data:</strong> Information about how you navigate and interact with our website (e.g., IP addresses, browser types, and cookies).</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>
            We use the collected information for various purposes to provide a seamless and sweet experience for our customers, including:
          </p>
          <ul>
            <li>Processing and fulfilling your orders.</li>
            <li>Communicating with you regarding your order status, delivery, or support queries.</li>
            <li>Sending promotional offers, newsletters, and updates (only if you have opted in).</li>
            <li>Improving our website, products, and customer service.</li>
          </ul>

          <h2>3. Cookies and Tracking Technologies</h2>
          <p>
            We use cookies and similar tracking technologies to track activity on our website and hold certain information. Cookies help us enhance your browsing experience, remember your cart items, and analyze site traffic. You can instruct your browser to refuse all cookies, but this may affect certain functionalities of the site.
          </p>

          <h2>4. Data Sharing and Security</h2>
          <p>
            We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties except to trusted third parties who assist us in operating our website, conducting our business, or delivering your orders, so long as those parties agree to keep this information confidential.
          </p>
          <p>
            We implement industry-standard security measures to maintain the safety of your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
          </p>

          <h2>5. Your Rights</h2>
          <p>
            You have the right to request access to the personal data we hold about you. You may also request that we correct or delete your personal information by contacting our support team. If you are subscribed to our marketing emails, you can unsubscribe at any time using the link provided in those emails.
          </p>

          <h2>6. Changes to this Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any significant changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </p>

          <h2>7. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <p>
            <strong>Email:</strong> <a href="mailto:privacy@cakepoprush.com">privacy@cakepoprush.com</a><br/>
            <strong>Address:</strong> 123 Sweet Street, Bakery District, India
          </p>
        </div>
      </Container>
    </div>
  )
}
