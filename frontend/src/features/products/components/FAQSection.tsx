import React, { useState } from 'react'
import { Container } from '@/components/layout/Container'
import { FAQ } from '@/types/product'
import { ChevronDown, ChevronUp } from 'lucide-react'
import styles from './FAQSection.module.css'

interface FAQSectionProps {
  faqs?: FAQ[]
}

export const FAQSection = ({ faqs }: FAQSectionProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  if (!faqs || faqs.length === 0) return null

  return (
    <div className={styles.section}>
      <Container>
        <h2 className={styles.title}>Frequently Asked Questions</h2>
        
        <div className={styles.faqList}>
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            
            return (
              <div key={index} className={styles.faqItem}>
                <button 
                  className={styles.question}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                >
                  <span className={styles.qText}>{faq.question}</span>
                  {isOpen ? <ChevronUp size={20} className={styles.icon} /> : <ChevronDown size={20} className={styles.icon} />}
                </button>
                
                {isOpen && (
                  <div className={styles.answer}>
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Container>
    </div>
  )
}
