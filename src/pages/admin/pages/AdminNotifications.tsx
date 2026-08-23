import { ActionDropdown } from '@/features/admin/components/ActionDropdown'
import React, { useState } from 'react'
import { Search, Download, ChevronDown, Filter, Calendar, Bell, Mail, Eye, Gift, Heart, AlertTriangle, Smartphone, MoreVertical, Edit2, ChevronLeft, ChevronRight, Archive } from 'lucide-react'
import { CustomSelect } from '@/features/admin/components/CustomSelect'
import { AdminFilterModal } from '@/features/admin/components/AdminFilterModal'
import filterModalStyles from '@/features/admin/components/AdminFilterModal.module.css'
import { ViewToggle } from '@/features/admin/components/ViewToggle'
import styles from './AdminNotifications.module.css'
import { AdminNotificationsSkeleton } from '@/features/admin/components/AdminNotificationsSkeleton';
import { useAdminTableState } from '@/features/admin/hooks/useAdminTableState';

import { adminNotificationData } from '@/features/admin/api/adminDataProvider'

const statsDataStatic = null;
const notificationsDataStatic = null;

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
  const [view, setView] = useState<'list' | 'grid'>(typeof window !== 'undefined' && window.innerWidth <= 768 ? 'grid' : 'list');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All Notifications');
  const [statsData, setStatsData] = useState<any[]>([]);
  const [notificationsData, setNotificationsData] = useState<any[]>([]);
  const {
    searchTerm,
    setSearchTerm,
    activeFilters,
    setFilter,
    filteredData,
    paginatedData,
    currentPage,
    setCurrentPage,
    totalPages,
    pageInfo,
    resetAll
  } = useAdminTableState({
    data: notificationsData.filter(n => activeTab === 'All Notifications' || n.status === activeTab.replace('s', '') || n.status === activeTab),
    searchFields: ['title', 'message'],
    filterFns: {
      type: (item, val) => item.type.toLowerCase() === val.toLowerCase(),
      status: (item, val) => item.status.toLowerCase() === val.toLowerCase(),
      channel: (item, val) => item.channels.includes(val.toLowerCase())
    },
    defaultPageSize: 10
  });

  const defaultAdvFilters = { dateRange: 'all', performance: 'all' };
  const [isAdvFilterOpen, setIsAdvFilterOpen] = useState(false);
  const [draftAdvFilters, setDraftAdvFilters] = useState(defaultAdvFilters);
  const [appliedAdvFilters, setAppliedAdvFilters] = useState(defaultAdvFilters);

  const activeFilterCount = Object.values(appliedAdvFilters).filter(v => v !== 'all').length;

  const handleApplyAdvFilters = () => {
    setAppliedAdvFilters(draftAdvFilters);
    setIsAdvFilterOpen(false);
  };

  const handleResetAdvFilters = () => {
    setDraftAdvFilters(defaultAdvFilters);
  };


  React.useEffect(() => {
    Promise.all([
      adminNotificationData.getStats(),
      adminNotificationData.getNotifications()
    ]).then(([stats, notifs]) => {
      setStatsData(stats);
      setNotificationsData(notifs);
    }).finally(() => {
      setIsLoading(false);
    });
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
            <input 
              type="text" 
              placeholder="Search notifications by title or message..." 
              className={styles.searchInput} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
  
          <div className={styles.filtersScrollContainer}>
            <CustomSelect
              options={typeOptions}
              value={activeFilters.type || 'all'}
              onChange={(val) => setFilter('type', val)}
              className={styles.filterSelect}
              variant="yellow"
            />
            <CustomSelect
              options={statusOptions}
              value={activeFilters.status || 'all'}
              onChange={(val) => setFilter('status', val)}
              className={styles.filterSelect}
              variant="pink"
            />
            <CustomSelect
              options={channelOptions}
              value={activeFilters.channel || 'all'}
              onChange={(val) => setFilter('channel', val)}
              className={styles.filterSelect}
              variant="turquoise"
            />
          </div>
  
          <div className={styles.actionButtons}>
            <button className={styles.btnOutline} title="Filter" onClick={() => setIsAdvFilterOpen(true)}>
              <Filter className={styles.btnIcon} /> <span className={styles.hideMobile}>Filter</span>
              {activeFilterCount > 0 && <span className={styles.filterBadge}>{activeFilterCount}</span>}
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
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1); // Reset page on tab change
              }}
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
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-text-muted)' }}>
                    {searchTerm || Object.keys(activeFilters).length > 0 ? (
                      <>
                        <p>No notifications found matching your search or filters.</p>
                        <button 
                          className={styles.btnOutline} 
                          style={{ margin: '16px auto 0' }}
                          onClick={resetAll}
                        >
                          Clear Filters
                        </button>
                      </>
                    ) : (
                      <p>No notifications available.</p>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedData.map((notif) => {
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
              })
            )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className={styles.mobileCards} style={{ display: view === 'list' ? 'none' : '' }}>
          {filteredData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-text-muted)' }}>
              {searchTerm || Object.keys(activeFilters).length > 0 ? (
                <>
                  <p>No notifications found matching your search or filters.</p>
                  <button 
                    className={styles.btnOutline} 
                    style={{ margin: '16px auto 0' }}
                    onClick={resetAll}
                  >
                    Clear Filters
                  </button>
                </>
              ) : (
                <p>No notifications available.</p>
              )}
            </div>
          ) : (
            paginatedData.map((notif) => {
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
          })
        )}
        </div>

        {totalPages > 0 && (
          <div className={styles.pagination}>
            <div className={styles.paginationText}>{pageInfo}</div>
            <div className={styles.pageControls}>
              <button 
                className={styles.pageBtn} 
                aria-label="Previous page"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                <ChevronLeft size={16} />
              </button>
              
              {Array.from({ length: totalPages }).map((_, i) => (
                <button 
                  key={i}
                  className={`${styles.pageBtn} ${currentPage === i + 1 ? styles.active : ''}`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button 
                className={styles.pageBtn} 
                aria-label="Next page"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <AdminFilterModal
        isOpen={isAdvFilterOpen}
        onClose={() => {
          setIsAdvFilterOpen(false);
          setDraftAdvFilters(appliedAdvFilters);
        }}
        onApply={handleApplyAdvFilters}
        onReset={handleResetAdvFilters}
      >
        <div className={filterModalStyles.filterGroup}>
          <span className={filterModalStyles.filterLabel}>Date Range</span>
          <div className={filterModalStyles.bracketGrid}>
            {[
              { value: 'all', label: 'All Time' },
              { value: 'today', label: 'Today' },
              { value: '7d', label: 'Last 7 Days' },
              { value: '30d', label: 'Last 30 Days' },
            ].map(opt => (
              <button
                key={opt.value}
                className={`${filterModalStyles.bracketBtn} ${draftAdvFilters.dateRange === opt.value ? filterModalStyles.active : ''}`}
                onClick={() => setDraftAdvFilters(prev => ({ ...prev, dateRange: opt.value }))}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className={filterModalStyles.filterGroup}>
          <span className={filterModalStyles.filterLabel}>Performance</span>
          <div className={filterModalStyles.bracketGrid}>
            {[
              { value: 'all', label: 'Any' },
              { value: 'high', label: 'High (>20%)' },
              { value: 'medium', label: 'Medium (5-20%)' },
              { value: 'low', label: 'Low (<5%)' },
            ].map(opt => (
              <button
                key={opt.value}
                className={`${filterModalStyles.bracketBtn} ${draftAdvFilters.performance === opt.value ? filterModalStyles.active : ''}`}
                onClick={() => setDraftAdvFilters(prev => ({ ...prev, performance: opt.value }))}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </AdminFilterModal>
    </div>
  )
}
