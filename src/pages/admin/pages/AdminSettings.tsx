import React from 'react'
import { 
  Calendar, ChevronDown, Store, Settings, CreditCard, Truck,
  Percent, Mail, MessageSquare, Bell, Shield, Cloud, Code,
  Wrench, Upload, Eye, MapPin, Globe, Clock, User
} from 'lucide-react'
import logoImg from '../../../assets/brand/logo.png'
import styles from './AdminSettings.module.css'
import { AdminSettingsSkeleton } from '../components/AdminSettingsSkeleton';

import { 
  AdminProfileForm,
  StoreInformationForm,
  GeneralSettingsForm,
  PaymentSettingsForm,
  ShippingSettingsForm,
  TaxSettingsForm,
  EmailSettingsForm,
  SMSSettingsForm,
  NotificationSettingsForm,
  SecuritySettingsForm,
  BackupRestoreForm,
  APISettingsForm,
  MaintenanceModeForm
} from '../components/settings/AdminSettingsForms';

const navItems = [
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'store', label: 'Store Information', icon: Store },
  { id: 'general', label: 'General Settings', icon: Settings },
  { id: 'payment', label: 'Payment Settings', icon: CreditCard },
  { id: 'shipping', label: 'Shipping Settings', icon: Truck },
  { id: 'tax', label: 'Tax Settings', icon: Percent },
  { id: 'email', label: 'Email Settings', icon: Mail },
  { id: 'sms', label: 'SMS Settings', icon: MessageSquare },
  { id: 'notification', label: 'Notification Settings', icon: Bell },
  { id: 'security', label: 'Security Settings', icon: Shield },
  { id: 'backup', label: 'Backup & Restore', icon: Cloud },
  { id: 'api', label: 'API Settings', icon: Code },
  { id: 'maintenance', label: 'Maintenance Mode', icon: Wrench },
];

export function AdminSettings() {
  const [activeTab, setActiveTab] = React.useState('profile');
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <AdminSettingsSkeleton />;
  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Settings</h1>
          <p className={styles.subtitle}>Manage your store and system preferences.</p>
        </div>

      </div>

      <div className={styles.workspace}>
        {/* Left Nav */}
        <div className={styles.navPanel}>
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button 
                key={item.id} 
                className={`${styles.navItem} ${activeTab === item.id ? styles.active : ''}`}
                onClick={() => setActiveTab(item.id)}
                style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
              >
                <Icon size={16} strokeWidth={2.5} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>

        {/* Center Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
          {activeTab === 'profile' && <AdminProfileForm />}
          {activeTab === 'store' && <StoreInformationForm />}
          {activeTab === 'general' && <GeneralSettingsForm />}
          {activeTab === 'payment' && <PaymentSettingsForm />}
          {activeTab === 'shipping' && <ShippingSettingsForm />}
          {activeTab === 'tax' && <TaxSettingsForm />}
          {activeTab === 'email' && <EmailSettingsForm />}
          {activeTab === 'sms' && <SMSSettingsForm />}
          {activeTab === 'notification' && <NotificationSettingsForm />}
          {activeTab === 'security' && <SecuritySettingsForm />}
          {activeTab === 'backup' && <BackupRestoreForm />}
          {activeTab === 'api' && <APISettingsForm />}
          {activeTab === 'maintenance' && <MaintenanceModeForm />}
        </div>


      </div>
    </div>
  )
}
