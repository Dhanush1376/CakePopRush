import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { 
  Truck, UserPlus, Search, Phone, Mail, CheckCircle2, XCircle, 
  Clock, ShieldCheck, X, Loader2, Download, Eye, ChevronRight,
  Copy, Check, Calendar, Sparkles, ExternalLink, Trash2, AlertTriangle, ArrowLeft, RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './AdminDeliveryAgents.module.css';
import { adminOrderData } from '@/features/admin/api/adminDataProvider';
import { apiClient } from '@/lib/api/client';
import { useToast } from '@/components/ui/ToastContext';
import { ViewToggle } from '@/features/admin/components/ViewToggle';
import { CustomSelect } from '@/features/admin/components/CustomSelect';
import { exportToExcel } from '@/features/admin/utils/exportUtils';
import { ResponsiveModal } from '@/components/ui/ResponsiveModal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AdminDeliveryAgentsSkeleton } from '@/features/admin/components/AdminDeliveryAgentsSkeleton';

interface DeliveryAgentItem {
  id: string;
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  city?: string;
  isActive: boolean;
  activeOrders: number;
  deliveredOrders: number;
  createdAt: string;
}

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active on Duty' },
  { value: 'inactive', label: 'Inactive' },
];

export function AdminDeliveryAgents() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [agents, setAgents] = useState<DeliveryAgentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [view, setView] = useState<'list' | 'grid'>(() => 
    typeof window !== 'undefined' && window.innerWidth <= 768 ? 'grid' : 'list'
  );

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setView('grid');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Inspection Drawer
  const [selectedAgent, setSelectedAgent] = useState<DeliveryAgentItem | null>(null);
  const [agentToDelete, setAgentToDelete] = useState<DeliveryAgentItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedField, setCopiedField] = useState<'email' | 'phone' | null>(null);
  const [failedAvatars, setFailedAvatars] = useState<Record<string, boolean>>({});


  const handleDeleteAgent = async (agent: DeliveryAgentItem) => {
    try {
      setIsDeleting(true);
      await adminOrderData.deleteDeliveryAgent(agent.id || agent._id);
    } catch (err: any) {
      console.warn('Backend delete error or mock fallback:', err);
    } finally {
      setAgents((prev) => prev.filter((a) => (a.id || a._id) !== (agent.id || agent._id)));
      if (selectedAgent && (selectedAgent.id === agent.id || selectedAgent._id === agent._id)) {
        setSelectedAgent(null);
      }
      setAgentToDelete(null);
      setIsDeleting(false);
      toast({
        type: 'success',
        title: 'Partner Removed',
        message: `${agent.name} has been removed from the delivery roster.`,
      });
    }
  };

  const copyToClipboard = (text: string, field: 'email' | 'phone') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({
      type: 'success',
      title: 'Copied',
      message: `${field === 'email' ? 'Email' : 'Phone number'} copied to clipboard`,
    });
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Lock body scroll and listen for Escape key when drawer is open
  useEffect(() => {
    if (!selectedAgent) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedAgent(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedAgent]);
  

  const loadAgents = async () => {
    try {
      setIsLoading(true);
      const data = await adminOrderData.getDeliveryAgents();
      setAgents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load delivery agents:', err);
      setAgents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  const handleToggleStatus = async (agent: DeliveryAgentItem) => {
    const newStatus = !agent.isActive;
    try {
      await adminOrderData.toggleDeliveryAgentStatus(agent.id || agent._id, newStatus);
      setAgents((prev) =>
        prev.map((a) => (a.id === agent.id ? { ...a, isActive: newStatus } : a))
      );
      if (selectedAgent && (selectedAgent.id === agent.id || selectedAgent._id === agent._id)) {
        setSelectedAgent((prev) => (prev ? { ...prev, isActive: newStatus } : null));
      }
      toast({
        type: 'success',
        title: 'Status Updated',
        message: `${agent.name} is now ${newStatus ? 'Active' : 'Inactive'}`,
      });
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Update Failed',
        message: err.response?.data?.message || err.message || 'Failed to update agent status',
      });
    }
  };


  const filteredAgents = useMemo(() => {
    return agents.filter((ag) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        ag.name.toLowerCase().includes(q) ||
        ag.email.toLowerCase().includes(q) ||
        (ag.phone && ag.phone.includes(q));

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && ag.isActive) ||
        (statusFilter === 'inactive' && !ag.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [agents, searchTerm, statusFilter]);

  const totalAgents = agents.length;
  const activeCount = agents.filter((a) => a.isActive).length;
  const activeOrdersSum = agents.reduce((sum, a) => sum + (a.activeOrders || 0), 0);
  const deliveredOrdersSum = agents.reduce((sum, a) => sum + (a.deliveredOrders || 0), 0);

  const handleExport = () => {
    if (agents.length === 0) {
      toast({ type: 'error', title: 'Export Failed', message: 'No delivery agents to export.' });
      return;
    }
    const exportData = filteredAgents.map((a) => ({
      'Agent Name': a.name,
      'Email': a.email,
      'Phone': a.phone || 'N/A',
      'Duty Status': a.isActive ? 'Active' : 'Inactive',
      'Active Deliveries': a.activeOrders || 0,
      'Completed Deliveries': a.deliveredOrders || 0,
      'Joined Date': a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-IN') : '',
    }));

    exportToExcel(exportData, `Delivery_Agents_${new Date().toISOString().split('T')[0]}`);
    toast({
      type: 'success',
      title: 'Export Complete',
      message: 'Delivery agents roster exported to Excel successfully.',
    });
  };

  if (isLoading) {
    return <AdminDeliveryAgentsSkeleton view={view} />;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Delivery Agents</h1>
          <div className={styles.statsSubtitle}>
            <span className={styles.statItemTotal}>
              {totalAgents} Total Agent{totalAgents !== 1 ? 's' : ''}
            </span>
            <span className={styles.statDotBadge}>
              <span className={styles.dotEmerald} />
              <span>{activeCount} Active</span>
            </span>
            <span className={styles.statDotBadge}>
              <span className={styles.dotAmber} />
              <span>{activeOrdersSum} In Transit</span>
            </span>
            <span className={styles.statDotBadge}>
              <span className={styles.dotPink} />
              <span>{deliveredOrdersSum} Delivered</span>
            </span>
          </div>
        </div>
      </div>

      {/* Sticky Toolbar */}
      <div className={styles.stickyWrapper}>
        <div className={styles.searchActionsBar}>
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search delivery agents by name, email, phone..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className={styles.clearSearchBtn}
                onClick={() => setSearchTerm('')}
                title="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className={styles.actionControlsGroup}>
            <div className={styles.statusSelectWrapper}>
              <CustomSelect
                options={statusOptions}
                value={statusFilter}
                onChange={setStatusFilter}
                placeholder="Filter by Status"
                variant="pink"
              />
            </div>

            <button
              type="button"
              className={styles.exportBtn}
              title="Export Excel (.xlsx)"
              onClick={handleExport}
            >
              <Download size={16} />
              <span className={styles.exportBtnText}>Export</span>
            </button>

            <div className={styles.viewToggleWrapper}>
              <ViewToggle view={view} onViewChange={setView} />
            </div>
          </div>
        </div>

        {/* Active Filter Chips Row */}
        {(statusFilter !== 'all' || searchTerm) && (
          <div className={styles.activeFilterChipsRow}>
            <span className={styles.activeChipsLabel}>Active filters:</span>
            {searchTerm && (
              <span className={styles.filterChip}>
                Search: "{searchTerm}"
                <button type="button" onClick={() => setSearchTerm('')}>
                  <X size={12} />
                </button>
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className={styles.filterChip}>
                Status: {statusOptions.find((o) => o.value === statusFilter)?.label || statusFilter}
                <button type="button" onClick={() => setStatusFilter('all')}>
                  <X size={12} />
                </button>
              </span>
            )}
            <button
              type="button"
              className={styles.clearAllChipsBtn}
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
            >
              Reset all
            </button>
          </div>
        )}
      </div>

      {/* Main Content: List vs Grid */}
      {view === 'list' ? (
        /* List View (Table) */
        <div className={styles.tableCard}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Agent</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Active In-Transit</th>
                  <th style={{ textAlign: 'center' }}>Delivered (OTP)</th>
                  <th>Joined</th>
                  <th style={{ textAlign: 'center' }}>Duty</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAgents.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: 0, border: 'none' }}>
                      <div className={styles.emptyStateContainer}>
                        <div className={styles.emptyStateIconRing}>
                          {searchTerm || statusFilter !== 'all' ? (
                            <Search size={28} strokeWidth={1.8} />
                          ) : (
                            <Truck size={28} strokeWidth={1.8} />
                          )}
                        </div>
                        {searchTerm || statusFilter !== 'all' ? (
                          <>
                            <h4 className={styles.emptyStateTitle}>No matching delivery partners found</h4>
                            <p className={styles.emptyStateSubtext}>
                              No delivery agents match your active search or filter criteria. Try adjusting your query or reset filters.
                            </p>
                            <button
                              type="button"
                              className={styles.emptyStateClearBtn}
                              onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('all');
                              }}
                            >
                              <RotateCcw size={15} /> Clear All Filters
                            </button>
                          </>
                        ) : (
                          <>
                            <h4 className={styles.emptyStateTitle}>No delivery partners yet</h4>
                            <p className={styles.emptyStateSubtext}>
                              Assign delivery partners via Admin Users & Staff management to manage roster and orders in real time.
                            </p>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAgents.map((agent) => (
                    <tr
                      key={agent.id || agent._id}
                      className={styles.tableRow}
                      onClick={() => setSelectedAgent(agent)}
                    >
                      <td>
                        <div className={styles.agentInfo}>
                          <div className={styles.agentAvatar}>
                            {agent.avatar && !failedAvatars[agent.id || agent._id] ? (
                              <img
                                src={agent.avatar}
                                alt={agent.name}
                                className={styles.avatarImg}
                                onError={() => setFailedAvatars((prev) => ({ ...prev, [agent.id || agent._id]: true }))}
                              />
                            ) : (
                              agent.name ? agent.name.charAt(0).toUpperCase() : 'D'
                            )}
                          </div>
                          <div>
                            <div className={styles.cellText}>{agent.name}</div>
                            <div className={styles.cellSubtext}>{agent.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {agent.phone ? (
                          <div>
                            <div className={styles.cellText}>{agent.phone}</div>
                            <div className={styles.cellSubtext}>{agent.city || 'Bengaluru'}</div>
                          </div>
                        ) : (
                          <div className={styles.cellSubtext}>Not provided</div>
                        )}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <span className={`${styles.badge} ${agent.isActive ? styles.badgeActive : styles.badgeInactive}`}>
                          {agent.isActive ? 'Active on Duty' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div className={styles.cellText} style={{ color: agent.activeOrders > 0 ? '#B45309' : undefined }}>
                          {agent.activeOrders || 0}
                        </div>
                        <div className={styles.cellSubtext}>In-transit</div>
                      </td>
                      <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div className={styles.cellText} style={{ color: '#047857' }}>
                          {agent.deliveredOrders || 0}
                        </div>
                        <div className={styles.cellSubtext}>Completed</div>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div className={styles.cellText}>
                          {agent.createdAt ? new Date(agent.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                        </div>
                        <div className={styles.cellSubtext}>
                          {agent.createdAt ? new Date(agent.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <label className={styles.switch}>
                          <input
                            type="checkbox"
                            checked={agent.isActive}
                            onChange={() => handleToggleStatus(agent)}
                          />
                          <span className={styles.slider} />
                        </label>
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.tableActionsGroup}>
                          <button
                            type="button"
                            className={`${styles.actionBtn} ${styles.actionBtnPortal}`}
                            title={`View ${agent.name}'s Details`}
                            onClick={() => {
                              setSelectedAgent(agent);
                            }}
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            className={`${styles.actionBtn} ${styles.actionBtnDetails}`}
                            title="View Agent Details"
                            onClick={() => setSelectedAgent(agent)}
                          >
                            Details
                          </button>
                          <button
                            type="button"
                            className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                            title={`Remove ${agent.name}`}
                            onClick={() => setAgentToDelete(agent)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View (Cards) */
        filteredAgents.length === 0 ? (
          <div className={styles.emptyStateContainer} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
            <div className={styles.emptyStateIconRing}>
              {searchTerm || statusFilter !== 'all' ? (
                <Search size={28} strokeWidth={1.8} />
              ) : (
                <Truck size={28} strokeWidth={1.8} />
              )}
            </div>
            {searchTerm || statusFilter !== 'all' ? (
              <>
                <h4 className={styles.emptyStateTitle}>No matching delivery partners found</h4>
                <p className={styles.emptyStateSubtext}>
                  No delivery agents match your active search or filter criteria. Try adjusting your query or reset filters.
                </p>
                <button
                  type="button"
                  className={styles.emptyStateClearBtn}
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                >
                  <RotateCcw size={15} /> Clear All Filters
                </button>
              </>
            ) : (
              <>
                <h4 className={styles.emptyStateTitle}>No delivery partners yet</h4>
                <p className={styles.emptyStateSubtext}>
                  Assign delivery partners via Admin Users & Staff management to manage roster and orders in real time.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className={styles.gridWrapper}>
          {filteredAgents.map((agent) => (
            <div
              key={agent.id || agent._id}
              className={styles.gridCard}
              onClick={() => setSelectedAgent(agent)}
            >
              <div className={styles.gridCardHeader}>
                <div className={styles.agentInfo}>
                  <div className={styles.agentAvatar}>
                    {agent.avatar && !failedAvatars[agent.id || agent._id] ? (
                      <img
                        src={agent.avatar}
                        alt={agent.name}
                        className={styles.avatarImg}
                        onError={() => setFailedAvatars((prev) => ({ ...prev, [agent.id || agent._id]: true }))}
                      />
                    ) : (
                      agent.name ? agent.name.charAt(0).toUpperCase() : 'D'
                    )}
                  </div>
                  <div>
                    <div className={styles.agentName}>{agent.name}</div>
                    <div className={styles.agentEmail}>{agent.email}</div>
                  </div>
                </div>
                <span className={`${styles.badge} ${agent.isActive ? styles.badgeActive : styles.badgeInactive}`}>
                  {agent.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className={styles.gridStatsRow}>
                <div className={styles.gridStatBox}>
                  <span className={styles.gridStatVal} style={{ color: '#B45309' }}>{agent.activeOrders || 0}</span>
                  <span className={styles.gridStatLbl}>Active In-Transit</span>
                </div>
                <div className={styles.gridStatBox}>
                  <span className={styles.gridStatVal} style={{ color: '#047857' }}>{agent.deliveredOrders || 0}</span>
                  <span className={styles.gridStatLbl}>Delivered (OTP)</span>
                </div>
              </div>

              <div className={styles.gridCardFooter} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={agent.isActive}
                      onChange={() => handleToggleStatus(agent)}
                    />
                    <span className={styles.slider} />
                  </label>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: agent.isActive ? '#047857' : '#524037' }}>
                    {agent.isActive ? 'On Duty' : 'Off Duty'}
                  </span>
                </div>

                <div className={styles.tableActionsGroup}>
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${styles.actionBtnPortal}`}
                    title={`View ${agent.name}'s Details`}
                    onClick={() => {
                      setSelectedAgent(agent);
                    }}
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${styles.actionBtnDetails}`}
                    title="Agent Details"
                    onClick={() => setSelectedAgent(agent)}
                  >
                    Details
                  </button>
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                    title={`Remove ${agent.name}`}
                    onClick={() => setAgentToDelete(agent)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        )
      )}

      {/* Inspection Drawer (Portaled to document.body to prevent containing block clipping) */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {selectedAgent && (
              <div className={styles.drawerOverlay} onClick={() => setSelectedAgent(null)}>
                <motion.div
                  className={styles.drawer}
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 28, stiffness: 260 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Drawer Header */}
                  <div className={styles.drawerHeader}>
                    <div className={styles.drawerHeaderContent}>
                      <div className={styles.drawerTitleRow}>
                        <h2 className={styles.drawerTitle}>{selectedAgent.name}</h2>
                        <span
                          className={`${styles.badge} ${
                            selectedAgent.isActive ? styles.badgeActive : styles.badgeInactive
                          }`}
                        >
                          <span
                            className={
                              selectedAgent.isActive
                                ? styles.dotEmeraldPulsing
                                : styles.dotSlate
                            }
                          />
                          {selectedAgent.isActive ? 'Active on Duty' : 'Inactive'}
                        </span>
                      </div>
                      <div className={styles.drawerSubtitle}>
                        <span>Partner ID:</span>
                        <code>{String(selectedAgent.id || selectedAgent._id).slice(-8)}</code>
                      </div>
                    </div>
                    <button
                      className={styles.drawerCloseBtn}
                      onClick={() => setSelectedAgent(null)}
                      title="Close panel (Esc)"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Drawer Body */}
                  <div className={styles.drawerBody}>
                    {/* Profile Hero Card */}
                    <div className={styles.profileHeroCard}>
                      <div className={styles.profileHeroAvatarWrapper}>
                        <div className={styles.profileHeroAvatar}>
                          {selectedAgent.avatar && !failedAvatars[selectedAgent.id || selectedAgent._id] ? (
                            <img
                              src={selectedAgent.avatar}
                              alt={selectedAgent.name}
                              className={styles.avatarImg}
                              onError={() => setFailedAvatars((prev) => ({ ...prev, [selectedAgent.id || selectedAgent._id]: true }))}
                            />
                          ) : (
                            selectedAgent.name ? selectedAgent.name.charAt(0).toUpperCase() : 'D'
                          )}
                        </div>
                        <span
                          className={`${styles.avatarStatusIndicator} ${
                            selectedAgent.isActive ? styles.statusOnline : styles.statusOffline
                          }`}
                        />
                      </div>
                      <div className={styles.profileHeroInfo}>
                        <div className={styles.profileHeroName}>{selectedAgent.name}</div>
                        <div className={styles.profileHeroRoleChip}>
                          <Truck size={12} /> Authorized Delivery Partner
                        </div>
                        <div className={styles.profileContactList}>
                          <div className={styles.contactItem}>
                            <Mail size={13} className={styles.contactIcon} />
                            <span className={styles.contactText} title={selectedAgent.email}>
                              {selectedAgent.email}
                            </span>
                            <button
                              className={styles.copyBtn}
                              onClick={() => copyToClipboard(selectedAgent.email, 'email')}
                              title="Copy Email"
                            >
                              {copiedField === 'email' ? (
                                <Check size={12} color="#10B981" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          </div>

                          {selectedAgent.phone ? (
                            <div className={styles.contactItem}>
                              <Phone size={13} className={styles.contactIcon} />
                              <span className={styles.contactText}>{selectedAgent.phone}</span>
                              <button
                                className={styles.copyBtn}
                                onClick={() => copyToClipboard(selectedAgent.phone || '', 'phone')}
                                title="Copy Phone"
                              >
                                {copiedField === 'phone' ? (
                                  <Check size={12} color="#10B981" />
                                ) : (
                                  <Copy size={12} />
                                )}
                              </button>
                              <a
                                href={`tel:${selectedAgent.phone}`}
                                className={styles.quickActionLink}
                                title="Call Partner"
                              >
                                Call
                              </a>
                            </div>
                          ) : (
                            <div className={styles.contactItemEmpty}>
                              <Phone size={13} />
                              <span>Phone number not provided</span>
                            </div>
                          )}

                          <div className={styles.joinedDateBadge}>
                            <Calendar size={13} />
                            <span>
                              Joined{' '}
                              {selectedAgent.createdAt
                                ? new Date(selectedAgent.createdAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : 'Recent member'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* KPI Metrics Grid */}
                    <div className={styles.drawerMetricsGrid}>
                      <div className={styles.metricCard}>
                        <div className={styles.metricHeader}>
                          <div className={`${styles.metricIconWrap} ${styles.metricIconAmber}`}>
                            <Clock size={15} />
                          </div>
                          <span className={styles.metricLabel}>In Transit</span>
                        </div>
                        <div className={styles.metricValue} style={{ color: '#D97706' }}>
                          {selectedAgent.activeOrders || 0}
                        </div>
                        <span className={styles.metricSub}>Active deliveries</span>
                      </div>

                      <div className={styles.metricCard}>
                        <div className={styles.metricHeader}>
                          <div className={`${styles.metricIconWrap} ${styles.metricIconGreen}`}>
                            <ShieldCheck size={15} />
                          </div>
                          <span className={styles.metricLabel}>Delivered</span>
                        </div>
                        <div className={styles.metricValue} style={{ color: '#10B981' }}>
                          {selectedAgent.deliveredOrders || 0}
                        </div>
                        <span className={styles.metricSub}>Doorstep OTP verified</span>
                      </div>

                      <div className={styles.metricCard}>
                        <div className={styles.metricHeader}>
                          <div className={`${styles.metricIconWrap} ${styles.metricIconPink}`}>
                            <Truck size={15} />
                          </div>
                          <span className={styles.metricLabel}>Total Orders</span>
                        </div>
                        <div className={styles.metricValue} style={{ color: '#381E10' }}>
                          {(selectedAgent.activeOrders || 0) + (selectedAgent.deliveredOrders || 0)}
                        </div>
                        <span className={styles.metricSub}>Fulfillment total</span>
                      </div>
                    </div>

                    {/* Personnel Duty Controls Card */}
                    <div className={styles.controlCard}>
                      <div className={styles.controlCardHeader}>
                        <div>
                          <div className={styles.controlCardTitle}>Active Duty Status</div>
                          <div className={styles.controlCardDescription}>
                            {selectedAgent.isActive
                              ? 'Partner is currently active and eligible to receive new delivery orders.'
                              : 'Partner is inactive/off-duty. Orders cannot be assigned until activated.'}
                          </div>
                        </div>
                        <label className={styles.switchLarge}>
                          <input
                            type="checkbox"
                            checked={selectedAgent.isActive}
                            onChange={() => handleToggleStatus(selectedAgent)}
                          />
                          <span className={styles.sliderLarge} />
                        </label>
                      </div>
                    </div>

                    {/* Portal Access Information */}
                    <div className={styles.portalInfoCard}>
                      <div className={styles.portalInfoHeader}>
                        <Sparkles size={16} color="#F20D6F" />
                        <span className={styles.portalInfoTitle}>Delivery Agent Mobile Portal</span>
                      </div>
                      <p className={styles.portalInfoText}>
                        This agent can access their mobile driver dispatch portal at <code>/delivery/portal</code> using their registered email or phone with instant OTP login.
                      </p>
                      <div className={styles.portalFeaturesRow}>
                        <span className={styles.portalFeaturePill}>
                          <CheckCircle2 size={12} color="#10B981" /> Live Order Tracking
                        </span>
                        <span className={styles.portalFeaturePill}>
                          <CheckCircle2 size={12} color="#10B981" /> Doorstep OTP Verification
                        </span>
                        <span className={styles.portalFeaturePill}>
                          <CheckCircle2 size={12} color="#10B981" /> COD Cash Collection
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Drawer Footer */}
                  <div className={styles.drawerFooter}>
                    <button
                      type="button"
                      className={styles.deleteDrawerBtn}
                      onClick={() => {
                        const a = selectedAgent;
                        setSelectedAgent(null);
                        setAgentToDelete(a);
                      }}
                    >
                      <Trash2 size={15} /> Remove Agent
                    </button>
                    <button
                      type="button"
                      className={styles.primaryActionBtn}
                      onClick={() => setSelectedAgent(null)}
                    >
                      Done
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* Delete Confirmation Modal */}
      {agentToDelete && (
        <ResponsiveModal
          isOpen={Boolean(agentToDelete)}
          onClose={() => setAgentToDelete(null)}
          title="Remove Delivery Agent"
        >
          <div className={styles.confirmModalContent}>
            <div className={styles.confirmIconWrap}>
              <AlertTriangle size={24} color="#EF4444" />
            </div>
            <h4 className={styles.confirmTitle}>Remove from Delivery Roster?</h4>
            <p className={styles.confirmDesc}>
              Are you sure you want to remove <strong>{agentToDelete.name}</strong> ({agentToDelete.email}) from the active delivery team?
            </p>
            <p className={styles.confirmSubdesc}>
              They will immediately lose access to the delivery partner portal and will no longer receive order dispatches.
            </p>
            <div className={styles.confirmBtnRow}>
              <button
                type="button"
                className={styles.secondaryActionBtn}
                onClick={() => setAgentToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.dangerActionBtn}
                onClick={() => handleDeleteAgent(agentToDelete)}
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                <span>{isDeleting ? 'Removing...' : 'Confirm Remove'}</span>
              </button>
            </div>
          </div>
        </ResponsiveModal>
      )}

    </div>
  );
}

export default AdminDeliveryAgents;
