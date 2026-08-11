import React, { useState } from 'react'
import { 
  Search, Plus, Download, ChevronDown, Filter, Calendar,
  Send, Bell, Mail, Eye, Gift, Heart, AlertTriangle, Smartphone,
  MoreVertical, Edit2, ChevronLeft, ChevronRight 
} from 'lucide-react'
import { CustomSelect } from '../components/CustomSelect'
import styles from './AdminNotifications.module.css'
import { AdminNotificationsSkeleton } from '../components/AdminNotificationsSkeleton';

const statsData = [
  { id: 1, label: 'TOTAL NOTIFICATIONS', value: '128', trend: '12.5%', isPositive: true, comparison: 'vs last 7 days', icon: Send, color: 'var(--admin-pink)', bg: '#FFF0F5' },
  { id: 2, label: 'SENT', value: '104', trend: '18.6%', isPositive: true, comparison: 'vs last 7 days', icon: Bell, color: '#F59E0B', bg: '#FFF8E1' },
  { id: 3, label: 'DELIVERED', value: '98', trend: '15.4%', isPositive: true, comparison: 'vs last 7 days', icon: Mail, color: 'var(--admin-cyan)', bg: '#E0FAFC' },
  { id: 4, label: 'READ', value: '68', trend: '13.2%', isPositive: true, comparison: 'vs last 7 days', icon: Eye, color: 'var(--admin-pink)', bg: '#FFF0F5' },
  { id: 5, label: 'CLICK-THROUGH RATE', value: '12.8%', trend: '3.6%', isPositive: true, comparison: 'vs last 7 days', icon: Mail, color: '#5C3317', bg: '#F5F5DC' },
];

const notificationsData = [
  { id: 1, title: 'Weekend Special Offer', message: 'Enjoy Flat 20% OFF on all Cake Pops!', type: 'Promotional', channels: ['bell', 'mail', 'sms'], audience: 'All Customers', users: '2,450 users', status: 'Sent', date: 'May 24, 2025', time: '10:30 AM', delivered: 92, ctr: 14.6 },
  { id: 2, title: 'New Arrivals Alert', message: 'Check out our latest cake pop flavors.', type: 'Informational', channels: ['bell', 'mail', 'sms'], audience: 'Subscribed Users', users: '1,832 users', status: 'Sent', date: 'May 22, 2025', time: '09:15 AM', delivered: 89, ctr: 11.3 },
  { id: 3, title: 'Order Confirmed', message: 'Your order #CPR1256 has been confirmed.', type: 'Transactional', channels: ['mail', 'sms'], audience: 'Specific Users', users: '1 user', status: 'Sent', date: 'May 21, 2025', time: '06:45 PM', delivered: 100, ctr: 28.4 },
  { id: 4, title: 'We Miss You!', message: 'Come back and get 15% OFF.', type: 'Promotional', channels: ['mail', 'sms'], audience: 'Inactive Users', users: '652 users', status: 'Scheduled', date: 'May 28, 2025', time: '11:00 AM', delivered: null, ctr: null },
  { id: 5, title: 'Happy Birthday!', message: "Here's 25% OFF on your special day.", type: 'Occasional', channels: ['mail', 'sms'], audience: 'Birthday Users', users: '120 users', status: 'Scheduled', date: 'May 30, 2025', time: '08:00 AM', delivered: null, ctr: null },
  { id: 6, title: 'Payment Failed', message: "We couldn't process your payment.", type: 'Transactional', channels: ['mail', 'sms'], audience: 'Specific Users', users: '3 users', status: 'Failed', date: 'May 20, 2025', time: '02:20 PM', delivered: null, ctr: null, error: true },
];

const tabs = ['All Notifications', 'Scheduled', 'Sent', 'Drafts', 'Failed'];

const typeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'promotional', label: 'Promotional' },
  { value: 'transactional', label: 'Transactional' },
  { value: 'informational', label: 'Informational' }
];

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'sent', label: 'Sent' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'failed', label: 'Failed' }
];

const channelOptions = [
  { value: 'all', label: 'All Channels' },
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'push', label: 'Push Notification' }
];

export function AdminNotifications() {
  const [activeTab, setActiveTab] = useState('All Notifications');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Notifications</h1>
          <p className={styles.subtitle}>Create, manage and send notifications to your customers.</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.dateRange}>
            <Calendar size={14} className={styles.dateIcon} />
            <span>May 18 - May 24, 2025</span>
            <ChevronDown size={14} className={styles.dateIcon} />
          </div>
          <button className={styles.addBtn}>
            <Plus size={18} strokeWidth={2.5} />
            Send New Notification
          </button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input type="text" placeholder="Search notifications by title or message..." className={styles.searchInput} />
        </div>
        
        <CustomSelect
          options={typeOptions}
          value={typeFilter}
          onChange={setTypeFilter}
          className={styles.filterSelect}
          variant="yellow"
        />
        <CustomSelect
          options={statusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
          className={styles.filterSelect}
          variant="pink"
        />
        <CustomSelect
          options={channelOptions}
          value={channelFilter}
          onChange={setChannelFilter}
          className={styles.filterSelect}
          variant="turquoise"
        />

        <button className={styles.btnOutline}>
          <Filter size={14} /> Filter
        </button>
        <button className={styles.btnOutline}>
          <Download size={14} /> Export
        </button>
      </div>

      <div className={styles.statsGrid}>
        {statsData.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.id} className={styles.statCard}>
              <div className={styles.statIconWrapper} style={{ backgroundColor: stat.bg, color: stat.color }}>
                <Icon size={20} strokeWidth={2.5} />
              </div>
              <div className={styles.statLabel}>{stat.label}</div>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statTrend}>
                <span className={stat.isPositive ? styles.positive : styles.negative}>
                  {stat.isPositive ? '↑' : '↓'} {stat.trend}
                </span>
                <span className={styles.statTrendText}>{stat.comparison}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tabs}>
          {tabs.map((tab) => (
            <div 
              key={tab} 
              className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </div>
          ))}
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '25%' }}>TITLE</th>
                <th>TYPE</th>
                <th>CHANNEL</th>
                <th>AUDIENCE</th>
                <th>STATUS</th>
                <th>SENT / SCHEDULED</th>
                <th>PERFORMANCE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {notificationsData.map((notif) => {
                const typeClass = styles[notif.type.toLowerCase()] || '';
                const statusClass = styles[notif.status.toLowerCase()] || '';
                
                let TitleIcon = Bell;
                let iconColor = 'var(--admin-pink)';
                let iconBg = '#FFF0F5';
                let progressColor = 'var(--admin-pink)';

                if (notif.type === 'Promotional') {
                  TitleIcon = Gift;
                } else if (notif.type === 'Informational') {
                  TitleIcon = Bell;
                  iconColor = '#F59E0B';
                  iconBg = '#FFF8E1';
                  progressColor = '#F59E0B';
                } else if (notif.type === 'Transactional') {
                  if (notif.error) {
                    TitleIcon = AlertTriangle;
                    iconColor = 'var(--admin-pink)';
                    progressColor = 'var(--color-error)';
                  } else {
                    TitleIcon = Calendar;
                    iconColor = 'var(--admin-cyan)';
                    iconBg = '#E0FAFC';
                    progressColor = 'var(--admin-cyan)';
                  }
                } else if (notif.type === 'Occasional') {
                  TitleIcon = Heart;
                  iconColor = '#F59E0B';
                  iconBg = '#FFF8E1';
                }

                return (
                  <tr key={notif.id}>
                    <td>
                      <div className={styles.titleCell}>
                        <div className={styles.titleIconWrapper} style={{ backgroundColor: iconBg, color: iconColor }}>
                          <TitleIcon size={18} strokeWidth={2.5} />
                        </div>
                        <div>
                          <div className={styles.titleText}>{notif.title}</div>
                          <div className={styles.titleSubtext}>{notif.message}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.typeBadge} ${typeClass}`}>
                        {notif.type}
                      </span>
                    </td>
                    <td>
                      <div className={`${styles.channels} ${typeClass}`}>
                        {notif.channels.includes('bell') && <Bell size={16} />}
                        {notif.channels.includes('mail') && <Mail size={16} />}
                        {notif.channels.includes('sms') && <Smartphone size={16} />}
                      </div>
                    </td>
                    <td>
                      <div className={styles.cellText}>{notif.audience}</div>
                      <div className={styles.cellSubtext}>{notif.users}</div>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${statusClass}`}>
                        {notif.status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.cellText}>{notif.date}</div>
                      <div className={styles.cellSubtext}>{notif.time}</div>
                    </td>
                    <td>
                      <div className={styles.performanceCol}>
                        {notif.status === 'Sent' ? (
                          <>
                            <div className={styles.perfRow}>
                              <span>Delivered</span>
                              <span className={styles.perfValue}>{notif.delivered}%</span>
                            </div>
                            <div className={styles.progressBarContainer}>
                              <div className={styles.progressBar} style={{ width: `${notif.delivered}%`, backgroundColor: progressColor }} />
                            </div>
                            <div className={styles.perfRow}>
                              <span>CTR {notif.ctr}%</span>
                            </div>
                          </>
                        ) : notif.status === 'Scheduled' ? (
                          <>
                            <div className={styles.perfRow}><span>—</span></div>
                            <div className={styles.perfRow}><span>—</span></div>
                          </>
                        ) : (
                          <>
                            <div className={styles.errorText}>Failed to send</div>
                            <div className={styles.errorText} style={{ textDecoration: 'underline', cursor: 'pointer' }}>View Error</div>
                          </>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className={styles.actionsCell}>
                        {notif.status === 'Scheduled' ? (
                          <button className={styles.actionBtn} aria-label="Edit Notification"><Edit2 size={16} /></button>
                        ) : (
                          <button className={styles.actionBtn} aria-label="View Notification"><Eye size={16} /></button>
                        )}
                        <button className={styles.actionBtn} aria-label="More Actions"><MoreVertical size={16} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className={styles.mobileCards}>
          {notificationsData.map((notif) => {
            const typeClass = styles[notif.type.toLowerCase()] || '';
            const statusClass = styles[notif.status.toLowerCase()] || '';
            
            let TitleIcon = Bell;
            let iconColor = 'var(--admin-pink)';
            let iconBg = '#FFF0F5';
            let progressColor = 'var(--admin-pink)';

            if (notif.type === 'Promotional') {
              TitleIcon = Gift;
            } else if (notif.type === 'Informational') {
              TitleIcon = Bell;
              iconColor = '#F59E0B';
              iconBg = '#FFF8E1';
              progressColor = '#F59E0B';
            } else if (notif.type === 'Transactional') {
              if (notif.error) {
                TitleIcon = AlertTriangle;
                iconColor = 'var(--admin-pink)';
                progressColor = 'var(--color-error)';
              } else {
                TitleIcon = Calendar;
                iconColor = 'var(--admin-cyan)';
                iconBg = '#E0FAFC';
                progressColor = 'var(--admin-cyan)';
              }
            } else if (notif.type === 'Occasional') {
              TitleIcon = Heart;
              iconColor = '#F59E0B';
              iconBg = '#FFF8E1';
            }

            return (
              <div key={notif.id} className={styles.mobileCard}>
                <div className={styles.mobileCardHeader}>
                  <div className={styles.titleCell}>
                    <div className={styles.titleIconWrapper} style={{ backgroundColor: iconBg, color: iconColor }}>
                      <TitleIcon size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                      <div className={styles.titleText}>{notif.title}</div>
                      <div className={styles.titleSubtext}>{notif.message}</div>
                    </div>
                  </div>
                </div>
                
                <div className={styles.mobileCardRow}>
                  <span className={styles.mobileCardLabel}>Type / Channel:</span>
                  <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                    <span className={`${styles.typeBadge} ${typeClass}`}>{notif.type}</span>
                    <div className={`${styles.channels} ${typeClass}`}>
                      {notif.channels.includes('bell') && <Bell size={14} />}
                      {notif.channels.includes('mail') && <Mail size={14} />}
                      {notif.channels.includes('sms') && <Smartphone size={14} />}
                    </div>
                  </div>
                </div>

                <div className={styles.mobileCardRow}>
                  <span className={styles.mobileCardLabel}>Audience / Status:</span>
                  <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                      <span className={styles.cellText}>{notif.audience}</span>
                      <span className={styles.cellSubtext}>{notif.users}</span>
                    </div>
                    <span className={`${styles.statusBadge} ${statusClass}`}>{notif.status}</span>
                  </div>
                </div>

                <div className={styles.mobileCardRow}>
                  <span className={styles.mobileCardLabel}>Performance:</span>
                  <div className={styles.performanceCol}>
                    {notif.status === 'Sent' ? (
                      <>
                        <div className={styles.perfRow}>
                          <span>Delivered</span>
                          <span className={styles.perfValue}>{notif.delivered}%</span>
                        </div>
                        <div className={styles.progressBarContainer}>
                          <div className={styles.progressBar} style={{ width: `${notif.delivered}%`, backgroundColor: progressColor }} />
                        </div>
                        <div className={styles.perfRow}>
                          <span>CTR {notif.ctr}%</span>
                        </div>
                      </>
                    ) : notif.status === 'Scheduled' ? (
                      <>
                        <div className={styles.cellText}>{notif.date}</div>
                        <div className={styles.cellSubtext}>{notif.time}</div>
                      </>
                    ) : (
                      <>
                        <div className={styles.errorText}>Failed to send</div>
                        <div className={styles.errorText} style={{ textDecoration: 'underline' }}>View Error</div>
                      </>
                    )}
                  </div>
                </div>

                <div className={styles.mobileCardRow}>
                  <span className={styles.mobileCardLabel}>Actions:</span>
                  <div className={styles.actionsCell}>
                    {notif.status === 'Scheduled' ? (
                      <button className={styles.actionBtn} aria-label="Edit Notification"><Edit2 size={16} /></button>
                    ) : (
                      <button className={styles.actionBtn} aria-label="View Notification"><Eye size={16} /></button>
                    )}
                    <button className={styles.actionBtn} aria-label="More Actions"><MoreVertical size={16} /></button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className={styles.pagination}>
          <div className={styles.paginationText}>Showing 1 to 6 of 128 notifications</div>
          <div className={styles.pageControls}>
            <button className={styles.pageBtn} aria-label="Previous page"><ChevronLeft size={16} /></button>
            <button className={`${styles.pageBtn} ${styles.active}`}>1</button>
            <button className={styles.pageBtn}>2</button>
            <button className={styles.pageBtn}>3</button>
            <span className={styles.pageEllipsis}>...</span>
            <button className={styles.pageBtn}>22</button>
            <button className={styles.pageBtn} aria-label="Next page"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  )
}
