import { ActionDropdown } from '@/features/admin/components/ActionDropdown'
import React, { useState } from 'react'
import { Search, Download, ChevronDown, Filter, Calendar, Bell, Mail, Eye, Gift, Heart, AlertTriangle, Smartphone, MoreVertical, Edit2, ChevronLeft, ChevronRight, Archive } from 'lucide-react'
import { CustomSelect } from '@/features/admin/components/CustomSelect'
import { ViewToggle } from '@/features/admin/components/ViewToggle'
import styles from './AdminNotifications.module.css'
import { AdminNotificationsSkeleton } from '@/features/admin/components/AdminNotificationsSkeleton';

import { adminNotificationData } from '@/features/admin/api/mockAdminDataProvider'

const statsData = adminNotificationData.getStats();
const notificationsData = adminNotificationData.getNotifications();

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
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All Notifications');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <AdminNotificationsSkeleton />;

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
        </div>
      </div>

      <div className={styles.stickyWrapper}>
        <div className={styles.toolbar}>
          <div className={styles.searchWrapper}>
            <Search size={16} className={styles.searchIcon} />
            <input type="text" placeholder="Search notifications by title or message..." className={styles.searchInput} />
          </div>
  
          <div className={styles.filtersScrollContainer}>
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
          </div>
  
          <div className={styles.actionButtons}>
            <button className={styles.btnOutline} title="Filter">
              <Filter className={styles.btnIcon} /> <span className={styles.hideMobile}>Filter</span>
            </button>
            <button className={styles.btnOutline} title="Export">
              <Download className={styles.btnIcon} /> <span className={styles.hideMobile}>Export</span>
            </button>
            <div style={{ flexShrink: 0 }}>
              <ViewToggle view={view} onViewChange={setView} />
            </div>
          </div>
        </div>
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

        <div className={styles.tableWrapper} style={{ display: view === 'grid' ? 'none' : '' }}>
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
                        <ActionDropdown actions={[
      { label: 'Mark as Unread', icon: Bell },
      { label: 'Archive', icon: Archive, variant: 'danger' }
    ]} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className={styles.mobileCards} style={{ display: view === 'list' ? 'none' : '' }}>
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
                    <ActionDropdown actions={[
      { label: 'Mark as Unread', icon: Bell },
      { label: 'Archive', icon: Archive, variant: 'danger' }
    ]} />
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
