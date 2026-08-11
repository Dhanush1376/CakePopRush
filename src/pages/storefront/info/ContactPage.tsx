import React, { useState } from 'react';
import { User, Mail, Phone, Tag, MessageSquare, Send, ChevronDown, MapPin, Clock } from 'lucide-react';
import styles from './ContactPage.module.css';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastContext';

export const ContactPage = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        type: 'success',
        title: 'Message Sent!',
        message: 'We received your message. We will get back to you soon!',
      });
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 1500);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.header}>
          <h1 className={styles.title}>Contact Us</h1>
          <div className={styles.underline}></div>
          <p className={styles.subtitle}>
            Fill out the form and we'll get back to you as soon as possible.
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <div className={styles.inputGroup}>
              <User className={styles.inputIcon} size={20} strokeWidth={1.5} />
              <input
                type="text"
                name="name"
                className={styles.input}
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <Mail className={styles.inputIcon} size={20} strokeWidth={1.5} />
              <input
                type="email"
                name="email"
                className={styles.input}
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <Phone className={styles.inputIcon} size={20} strokeWidth={1.5} />
            <input
              type="tel"
              name="phone"
              className={styles.input}
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className={styles.inputGroup}>
            <Tag className={styles.inputIcon} size={20} strokeWidth={1.5} />
            <select
              name="subject"
              className={`${styles.input} ${styles.select}`}
              value={formData.subject}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Subject</option>
              <option value="custom_order">Custom Order</option>
              <option value="feedback">Feedback</option>
              <option value="other">Other</option>
            </select>
            <ChevronDown className={styles.selectIcon} size={20} strokeWidth={1.5} />
          </div>

          <div className={`${styles.inputGroup} ${styles.textareaGroup}`}>
            <MessageSquare className={styles.textareaIcon} size={20} strokeWidth={1.5} />
            <textarea
              name="message"
              className={styles.textarea}
              placeholder="Your Message"
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <Button
            type="submit"
            className={styles.submitBtn}
            isLoading={isSubmitting}
            rightIcon={<Send size={18} strokeWidth={1.5} />}
          >
            Send Message
          </Button>
        </form>

        <div className={styles.divider}>
          <span>OR CONTACT US DIRECTLY</span>
        </div>

        <div className={styles.cardsGrid}>
          <div className={styles.card}>
            <div className={`${styles.iconCircle} ${styles.pinkCircle}`}>
              <Phone size={28} strokeWidth={1.5} />
            </div>
            <h3 className={styles.cardTitle}>Call Us</h3>
            <p className={styles.cardText}>+91 98765 43210</p>
            <p className={styles.cardSubtext}>Mon - Sat, 10AM - 7PM</p>
          </div>

          <div className={styles.card}>
            <div className={`${styles.iconCircle} ${styles.yellowCircle}`}>
              <Mail size={28} strokeWidth={1.5} />
            </div>
            <h3 className={styles.cardTitle}>Email Us</h3>
            <p className={styles.cardText}>hello@cakepoprush.com</p>
            <p className={styles.cardSubtext}>We reply within 24 hrs</p>
          </div>

          <div className={styles.card}>
            <div className={`${styles.iconCircle} ${styles.tealCircle}`}>
              <MapPin size={28} strokeWidth={1.5} />
            </div>
            <h3 className={styles.cardTitle}>Visit Us</h3>
            <p className={styles.cardText}>123, Cake Pop Street,</p>
            <p className={styles.cardSubtext}>Sweet City, Mumbai<br/>400001, India</p>
          </div>

          <div className={styles.card}>
            <div className={`${styles.iconCircle} ${styles.purpleCircle}`}>
              <Clock size={28} strokeWidth={1.5} />
            </div>
            <h3 className={styles.cardTitle}>Working Hours</h3>
            <p className={styles.cardText}>Mon - Sat: 10AM - 7PM</p>
            <p className={styles.cardSubtext}>Sunday: 11AM - 5PM</p>
          </div>
        </div>
      </div>
    </div>
  );
};
