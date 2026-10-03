import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, Plus, Download, Eye, ChevronLeft, ChevronRight, 
  Trash2, AlertTriangle, X, Printer, ArrowUp, ArrowDown, 
  ShoppingBag, Clock, Package, Truck, CheckCircle, SlidersHorizontal, ArrowUpDown, RotateCcw,
  CheckCircle2, XCircle, ChevronDown, ChevronUp, Phone, MapPin, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { Link, useNavigate } from 'react-router-dom';
import styles from './AdminOrders.module.css';
import deleteBtnStyles from '@/features/admin/components/AdminDeleteButton.module.css';
import { ViewToggle } from '@/features/admin/components/ViewToggle';
import { CustomSelect } from '@/features/admin/components/CustomSelect';
import { OrderStatusDropdown } from '@/features/admin/components/OrderStatusDropdown';
import { AdminFilterModal } from '@/features/admin/components/AdminFilterModal';
import filterModalStyles from '@/features/admin/components/AdminFilterModal.module.css';
import { AdminOrdersSkeleton } from '@/features/admin/components/AdminOrdersSkeleton';
import { InvoiceViewer } from '@/components/invoice/InvoiceViewer';
import { mapOrderToInvoiceData } from '@/lib/invoiceMapper';
import { exportToExcel } from '@/features/admin/utils/exportUtils';
import { adminOrderData } from '@/features/admin/api/adminDataProvider';
import { useToast } from '@/components/ui/ToastContext';

interface OrderFilterState {
  status: string;
  paymentStatus: string;
  date: string;
  amount: string;
  items: string;
  sortBy: string;
}

const defaultFilters: OrderFilterState = {
  status: 'all',
  paymentStatus: 'all',
  date: 'all',
  amount: 'all',
  items: 'all',
  sortBy: 'newest',
};

const orderExportColumns = [
  { key: 'orderNumber', label: 'Order ID' },
  { key: 'customerName', label: 'Customer Name' },
  { key: 'customerEmail', label: 'Customer Email' },
  { key: 'customerPhone', label: 'Customer Phone' },
  { key: 'status', label: 'Status' },
  { key: 'totalFormatted', label: 'Total Amount' },
  { key: 'paymentMethod', label: 'Payment Method' },
  { key: 'paymentStatus', label: 'Payment Status' },
  { key: 'itemsCount', label: 'Items Count' },
  { key: 'orderDate', label: 'Order Date' },
];

export function AdminOrders() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [invoiceOrder, setInvoiceOrder] = useState<any | null>(null);

  const [statsData, setStatsData] = useState<any[]>([
    { id: 1, label: 'TOTAL ORDERS', value: '0', trend: '0%', isPositive: true, comparison: 'real-time', icon: ShoppingBag, color: 'var(--admin-pink, #F20D6F)', bg: '#FFF0F5' },
    { id: 2, label: 'PENDING', value: '0', trend: '0%', isPositive: true, comparison: 'requires action', icon: Clock, color: '#F59E0B', bg: '#FFF8E1' },
    { id: 3, label: 'PROCESSING', value: '0', trend: '0%', isPositive: true, comparison: 'in kitchen/pack', icon: Package, color: '#0284C7', bg: '#E0F2FE' },
    { id: 4, label: 'SHIPPED', value: '0', trend: '0%', isPositive: true, comparison: 'on the road', icon: Truck, color: 'var(--admin-cyan, #06B6D4)', bg: '#E0FAFC' },
    { id: 5, label: 'DELIVERED', value: '0', trend: '0%', isPositive: true, comparison: 'completed', icon: CheckCircle, color: '#5C3317', bg: '#F5F5DC' },
  ]);
  const [ordersData, setOrdersData] = useState<any[]>([]);
  const [availableAgents, setAvailableAgents] = useState<any[]>([]);
  const [pendingModalOrder, setPendingModalOrder] = useState<any | null>(null);
  const [dispatchModalOrder, setDispatchModalOrder] = useState<any | null>(null);
  const [dispatchAgentId, setDispatchAgentId] = useState<string>('');
  const [isDispatching, setIsDispatching] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [stats, orders, agents] = await Promise.all([
        adminOrderData.getStats(),
        adminOrderData.getOrders(),
        adminOrderData.getDeliveryAgents(),
      ]);
      if (Array.isArray(stats)) {
        setStatsData(stats);
      } else if (stats && typeof stats === 'object') {
        const s = stats as any;
        setStatsData([
          { id: 1, label: 'TOTAL ORDERS', value: (s.totalOrders ?? 0).toLocaleString(), trend: '18.6%', isPositive: true, comparison: 'vs last 7 days', icon: ShoppingBag, color: 'var(--admin-pink, #F20D6F)', bg: '#FFF0F5' },
          { id: 2, label: 'PENDING', value: (s.pending ?? 0).toLocaleString(), trend: '8.2%', isPositive: true, comparison: 'requires action', icon: Clock, color: '#F59E0B', bg: '#FFF8E1' },
          { id: 3, label: 'PROCESSING', value: (s.processing ?? 0).toLocaleString(), trend: '16.3%', isPositive: true, comparison: 'in kitchen/pack', icon: Package, color: '#0284C7', bg: '#E0F2FE' },
          { id: 4, label: 'SHIPPED', value: ((s.confirmed ?? 0) + (s.shipped ?? 0)).toLocaleString(), trend: '12.7%', isPositive: true, comparison: 'on the road', icon: Truck, color: 'var(--admin-cyan, #06B6D4)', bg: '#E0FAFC' },
          { id: 5, label: 'DELIVERED', value: (s.delivered ?? 0).toLocaleString(), trend: '10.1%', isPositive: true, comparison: 'completed', icon: CheckCircle, color: '#5C3317', bg: '#F5F5DC' },
        ]);
      }
      if (Array.isArray(orders)) {
        setOrdersData(orders);
      }
      if (Array.isArray(agents)) {
        setAvailableAgents(agents.filter((a: any) => a.isActive !== false));
      }
    } catch (err) {
      console.error('Failed to load admin orders data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState('');
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [expandedCardIds, setExpandedCardIds] = useState<Set<string>>(new Set());
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const smoothScrollCardIntoView = (elementOrId: string | HTMLElement, bottomOffset = 100) => {
    if (typeof window === 'undefined') return;
    setTimeout(() => {
      const el = typeof elementOrId === 'string'
        ? document.getElementById(elementOrId)
        : elementOrId;
      if (!el) return;

      // Find the actual scrollable container in AdminLayout (e.g. main.pageContent)
      let scrollContainer: HTMLElement | null = el.closest('main') || null;
      if (!scrollContainer) {
        let parent = el.parentElement;
        while (parent && parent !== document.body) {
          const style = window.getComputedStyle(parent);
          if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
            scrollContainer = parent;
            break;
          }
          parent = parent.parentElement;
        }
      }

      const rect = el.getBoundingClientRect();
      const visibleBottom = window.innerHeight - bottomOffset;

      if (rect.bottom > visibleBottom - 60) {
        const scrollNeeded = Math.max(rect.bottom - visibleBottom + 45, 130);
        if (scrollContainer) {
          scrollContainer.scrollBy({ top: scrollNeeded, behavior: 'smooth' });
        }
        window.scrollBy({ top: scrollNeeded, behavior: 'smooth' });
      }
    }, 180);
  };

  const toggleExpandCard = (orderId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedCardIds(prev => {
      const next = new Set(prev);
      const isExpanding = !next.has(orderId);
      if (isExpanding) {
        next.add(orderId);
        smoothScrollCardIntoView(`order-card-${orderId}`);
      } else {
        next.delete(orderId);
      }
      return next;
    });
  };

  const handleSingleStatusUpdate = async (orderId: string, newStatus: string, e?: React.MouseEvent | React.ChangeEvent) => {
    if (e) e.stopPropagation();
    const targetOrder = ordersData.find(o => (o.id || o._id) === orderId);
    const norm = (newStatus || '').toLowerCase();

    // If order is PENDING, trigger the pending approval modal unless cancelling
    if ((targetOrder?.status || '').toLowerCase() === 'pending') {
      if (norm === 'cancelled') {
        await handleCancelPendingOrder(targetOrder);
        return;
      }
      setPendingModalOrder(targetOrder);
      return;
    }

    // If moving to Dispatched, ensure a delivery agent is assigned
    if (norm === 'dispatched' || norm === 'shipped') {
      const hasAgent = Boolean(targetOrder?.delivery?.agentId || targetOrder?.deliveryAgent);
      if (!hasAgent) {
        setDispatchModalOrder(targetOrder);
        setDispatchAgentId('');
        return;
      }
    }

    setUpdatingStatusId(orderId);
    try {
      if (norm === 'approve' || norm === 'confirmed' || norm === 'being baked') {
        await adminOrderData.approveOrder(orderId);
        showToast('Order approved! Moved to Being Baked.', 'success');
      } else {
        await adminOrderData.updateOrder(orderId, { status: newStatus as any });
        showToast(`Order status updated to ${newStatus}`, 'success');
      }
      await loadData();
    } catch (err: any) {
      console.error('Failed to update status:', err);
      showToast(err.response?.data?.message || err.message || 'Failed to update status', 'error');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleApprovePendingOrder = async (targetOrder: any) => {
    if (!targetOrder) return;
    const orderId = targetOrder.id || targetOrder._id;
    setUpdatingStatusId(orderId);
    try {
      await adminOrderData.approveOrder(orderId);
      showToast('Order approved! Moved to Being Baked.', 'success');
      setPendingModalOrder(null);
      await loadData();
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Failed to approve order', 'error');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleCancelPendingOrder = async (targetOrder: any) => {
    if (!targetOrder) return;
    const orderId = targetOrder.id || targetOrder._id;
    setUpdatingStatusId(orderId);
    try {
      await adminOrderData.updateOrder(orderId, { status: 'Cancelled' as any });
      showToast('Order cancelled.', 'error');
      setPendingModalOrder(null);
      await loadData();
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Failed to cancel order', 'error');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleConfirmDispatch = async () => {
    if (!dispatchModalOrder || !dispatchAgentId) return;
    const orderId = dispatchModalOrder.id || dispatchModalOrder._id;
    setIsDispatching(true);
    try {
      await adminOrderData.updateOrder(orderId, {
        status: 'Dispatched',
        agentId: dispatchAgentId,
      } as any);
      const agent = availableAgents.find(a => (a.id || a._id) === dispatchAgentId);
      showToast(`Order #${dispatchModalOrder.orderNumber || orderId} dispatched with ${agent?.name || 'delivery partner'}!`, 'success');
      setDispatchModalOrder(null);
      setDispatchAgentId('');
      await loadData();
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Failed to dispatch order', 'error');
    } finally {
      setIsDispatching(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'delivered' || s === 'completed' || s === 'otp_verified') {
      return { label: 'Delivered', style: styles.statusPillSuccess, pulse: false };
    }
    if (s === 'cancelled') {
      return { label: 'Cancelled', style: styles.statusPillDanger, pulse: false };
    }
    if (s === 'dispatched' || s === 'shipped' || s === 'picked_up' || s === 'out_for_delivery') {
      return { label: 'Dispatched', style: styles.statusPillInfo, pulse: true };
    }
    if (s === 'being baked' || s === 'processing' || s === 'ready_for_pickup') {
      return { label: 'Being Baked', style: styles.statusPillInfo, pulse: true };
    }
    if (s === 'confirmed' || s === 'order confirmed') {
      return { label: 'Confirmed', style: styles.statusPillInfo, pulse: false };
    }
    return { label: 'Pending', style: styles.statusPillWarning, pulse: true };
  };

  const getCardBorderClass = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'delivered' || s === 'completed' || s === 'otp_verified') return styles.cardDelivered;
    if (s === 'cancelled') return styles.cardCancelled;
    if (s === 'pending') return styles.cardPending;
    return styles.cardActive;
  };

  const getRowBorderClass = (order: any) => {
    const rawStatus = (order.status || order.orderStatus || '').toLowerCase();
    const paymentStatus = (order.paymentStatus || order.payment?.status || '').toLowerCase();
    
    if (['cancelled', 'rejected'].includes(rawStatus)) {
      return styles.tableRowDanger;
    }
    if (['delivered', 'completed', 'otp_verified'].includes(rawStatus) || paymentStatus === 'paid' || paymentStatus === 'completed') {
      return styles.tableRowPaid;
    }
    if (['dispatched', 'shipped', 'being baked', 'processing'].includes(rawStatus)) {
      return styles.tableRowActive;
    }
    return styles.tableRowPending;
  };

  useEffect(() => {
    const checkView = () => {
      if (typeof window !== 'undefined') {
        setView(window.innerWidth <= 768 ? 'grid' : 'list');
      }
    };
    checkView();
    window.addEventListener('resize', checkView);
    return () => window.removeEventListener('resize', checkView);
  }, []);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdvFilterOpen, setIsAdvFilterOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<OrderFilterState>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<OrderFilterState>(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const activeFilterCount = useMemo(() => {
    return Object.entries(appliedFilters).filter(([k, v]) => k !== 'sortBy' && v !== 'all').length;
  }, [appliedFilters]);

  const handleApplyAdvFilters = () => {
    setAppliedFilters(draftFilters);
    setIsAdvFilterOpen(false);
    setCurrentPage(1);
  };

  const handleResetAdvFilters = () => {
    setDraftFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setCurrentPage(1);
  };

  const handleResetAllFilters = () => {
    setSearchTerm('');
    setDraftFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setCurrentPage(1);
  };

  // Close action menus on outside click
  useEffect(() => {
    if (!activeActionMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(`.${styles.actionMenuWrapper}`) && !target.closest(`.${styles.mcActions}`)) {
        setActiveActionMenu(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeActionMenu]);

  // Live count calculations for the header
  const totalCount = statsData.find(s => s.id === 1)?.value ?? ordersData.length;
  const pendingCount = statsData.find(s => s.id === 2)?.value ?? ordersData.filter(o => {
    const s = (o.status || o.orderStatus || '').toLowerCase();
    return s === 'pending' || s === 'order confirmed' || s === 'confirmed';
  }).length;
  const dispatchedCount = statsData.find(s => s.id === 4)?.value ?? ordersData.filter(o => {
    const s = (o.status || o.orderStatus || '').toLowerCase();
    return ['dispatched', 'shipped', 'picked_up', 'out_for_delivery'].includes(s);
  }).length;
  const deliveredCount = statsData.find(s => s.id === 5)?.value ?? ordersData.filter(o => {
    const s = (o.status || o.orderStatus || '').toLowerCase();
    return ['delivered', 'completed', 'otp_verified'].includes(s);
  }).length;

  // Filter & sort data
  const filteredData = useMemo(() => {
    return ordersData.filter(order => {
      // 1. Search Query
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const idMatch = (order.id || order.orderNumber || order._id || '').toLowerCase().includes(q);
        const nameMatch = (order.customerName || order.customer?.name || order.shippingAddress?.recipientName || '').toLowerCase().includes(q);
        const emailMatch = (order.customerEmail || order.customer?.email || '').toLowerCase().includes(q);
        const phoneMatch = (order.customerPhone || order.customer?.phone || order.shippingAddress?.phone || '').toLowerCase().includes(q);
        const statusMatch = (order.status || order.orderStatus || '').toLowerCase().includes(q);
        if (!idMatch && !nameMatch && !emailMatch && !phoneMatch && !statusMatch) {
          return false;
        }
      }

      // 2. Status filter
      if (appliedFilters.status !== 'all') {
        const s = (order.status || order.orderStatus || '').toLowerCase();
        const t = appliedFilters.status.toLowerCase();
        if (t === 'pending') {
          if (!['pending', 'order confirmed', 'confirmed'].includes(s)) return false;
        } else if (t === 'processing') {
          if (!['processing', 'being baked', 'preparing', 'ready_for_pickup'].includes(s)) return false;
        } else if (t === 'shipped') {
          if (!['dispatched', 'shipped', 'picked_up', 'out_for_delivery'].includes(s)) return false;
        } else if (t === 'delivered') {
          if (!['delivered', 'completed', 'otp_verified'].includes(s)) return false;
        } else if (t === 'cancelled') {
          if (s !== 'cancelled') return false;
        } else if (s !== t) {
          return false;
        }
      }

      // 3. Payment Status filter
      if (appliedFilters.paymentStatus !== 'all') {
        const pStatus = (order.paymentStatus || order.payment?.status || '').toLowerCase();
        const method = (order.paymentMethod || order.payment?.method || '').toLowerCase();
        if (appliedFilters.paymentStatus === 'cod') {
          if (method !== 'cod') return false;
        } else if (appliedFilters.paymentStatus === 'paid') {
          if (pStatus !== 'paid' && pStatus !== 'completed' && pStatus !== 'success') return false;
        } else if (appliedFilters.paymentStatus === 'unpaid') {
          if (pStatus === 'paid' || pStatus === 'completed' || pStatus === 'success') return false;
        } else if (appliedFilters.paymentStatus === 'refunded') {
          if (pStatus !== 'refunded') return false;
        }
      }

      // 4. Date Range filter
      if (appliedFilters.date !== 'all') {
        const orderDate = new Date(order.createdAt || order.date || Date.now());
        const now = new Date();
        if (appliedFilters.date === 'today') {
          if (orderDate.toDateString() !== now.toDateString()) return false;
        } else if (appliedFilters.date === '7days') {
          const diffDays = (now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24);
          if (diffDays > 7) return false;
        } else if (appliedFilters.date === '30days') {
          const diffDays = (now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24);
          if (diffDays > 30) return false;
        }
      }

      // 5. Amount Range filter
      if (appliedFilters.amount !== 'all') {
        const numTotal = typeof order.total === 'number' ? order.total : parseFloat(String(order.total || 0).replace(/[^0-9.]/g, ''));
        if (appliedFilters.amount === '0-500' && numTotal > 500) return false;
        if (appliedFilters.amount === '500-2000' && (numTotal < 500 || numTotal > 2000)) return false;
        if (appliedFilters.amount === '2000+' && numTotal < 2000) return false;
      }

      // 6. Items count filter
      if (appliedFilters.items !== 'all') {
        const count = order.items?.length || 1;
        if (appliedFilters.items === '1' && count !== 1) return false;
        if (appliedFilters.items === '2-5' && (count < 2 || count > 5)) return false;
        if (appliedFilters.items === '6+' && count < 6) return false;
      }

      return true;
    }).sort((a, b) => {
      if (appliedFilters.sortBy === 'oldest') {
        return new Date(a.createdAt || a.date || 0).getTime() - new Date(b.createdAt || b.date || 0).getTime();
      }
      if (appliedFilters.sortBy === 'highest') {
        const valA = typeof a.total === 'number' ? a.total : parseFloat(String(a.total || 0).replace(/[^0-9.]/g, ''));
        const valB = typeof b.total === 'number' ? b.total : parseFloat(String(b.total || 0).replace(/[^0-9.]/g, ''));
        return valB - valA;
      }
      if (appliedFilters.sortBy === 'lowest') {
        const valA = typeof a.total === 'number' ? a.total : parseFloat(String(a.total || 0).replace(/[^0-9.]/g, ''));
        const valB = typeof b.total === 'number' ? b.total : parseFloat(String(b.total || 0).replace(/[^0-9.]/g, ''));
        return valA - valB;
      }
      return new Date(b.createdAt || b.date || 0).getTime() - new Date(a.createdAt || a.date || 0).getTime();
    });
  }, [ordersData, searchTerm, appliedFilters]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const pageInfo = filteredData.length > 0
    ? `Showing ${(currentPage - 1) * pageSize + 1} to ${Math.min(currentPage * pageSize, filteredData.length)} of ${filteredData.length} orders`
    : '0 orders found';

  // Export handlers
  const handleExport = () => {
    if (filteredData.length === 0) {
      showToast('No orders to export', 'error');
      return;
    }
    const dateStr = new Date().toISOString().split('T')[0];
    const exportRows = filteredData.map((o: any) => ({
      ...o,
      orderNumber: o.orderNumber || o.id || o._id,
      customerName: o.customerName || o.customer?.name || o.shippingAddress?.recipientName || 'Customer',
      customerEmail: o.customerEmail || o.customer?.email || '—',
      customerPhone: o.customerPhone || o.customer?.phone || o.shippingAddress?.phone || '—',
      status: (o.status || o.orderStatus || 'Confirmed').toUpperCase(),
      totalFormatted: `₹${(typeof o.total === 'number' ? o.total : parseFloat(String(o.total || 0).replace(/[^0-9.]/g, ''))).toLocaleString('en-IN')}`,
      paymentMethod: (o.paymentMethod || o.payment?.method || 'Online').toUpperCase(),
      paymentStatus: (o.paymentStatus || o.payment?.status || 'Pending').toUpperCase(),
      itemsCount: o.items?.length || 1,
      orderDate: o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : (o.date || '—'),
    }));
    exportToExcel(exportRows, `CakePopRush-Orders-${dateStr}`, orderExportColumns, 'Orders');
    showToast(`Exported ${exportRows.length} orders to Excel (.xlsx)`, 'success');
  };

  const handleExportSelected = () => {
    const sel = ordersData.filter(o => selectedOrders.includes(o.id || o._id));
    if (sel.length === 0) {
      showToast('Please select orders to export', 'error');
      return;
    }
    const dateStr = new Date().toISOString().split('T')[0];
    const exportRows = sel.map((o: any) => ({
      ...o,
      orderNumber: o.orderNumber || o.id || o._id,
      customerName: o.customerName || o.customer?.name || o.shippingAddress?.recipientName || 'Customer',
      customerEmail: o.customerEmail || o.customer?.email || '—',
      customerPhone: o.customerPhone || o.customer?.phone || o.shippingAddress?.phone || '—',
      status: (o.status || o.orderStatus || 'Confirmed').toUpperCase(),
      totalFormatted: `₹${(typeof o.total === 'number' ? o.total : parseFloat(String(o.total || 0).replace(/[^0-9.]/g, ''))).toLocaleString('en-IN')}`,
      paymentMethod: (o.paymentMethod || o.payment?.method || 'Online').toUpperCase(),
      paymentStatus: (o.paymentStatus || o.payment?.status || 'Pending').toUpperCase(),
      itemsCount: o.items?.length || 1,
      orderDate: o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : (o.date || '—'),
    }));
    exportToExcel(exportRows, `CakePopRush-Orders-Selected-${dateStr}`, orderExportColumns, 'Selected Orders');
    showToast(`Exported ${exportRows.length} selected orders to Excel (.xlsx)`, 'success');
  };

  // Bulk Actions
  const handleExecuteConfirmAction = async () => {
    setIsConfirmModalOpen(false);
    if (!confirmAction) return;

    try {
      if (confirmAction === 'delete') {
        for (const id of selectedOrders) {
          await adminOrderData.updateOrder(id, { status: 'Cancelled' as any });
        }
        showToast(`Cancelled ${selectedOrders.length} selected orders`, 'success');
      } else {
        const statusMap: Record<string, string> = {
          pending: 'Pending',
          processing: 'Being Baked',
          shipped: 'Dispatched',
          delivered: 'Delivered',
          cancelled: 'Cancelled',
        };
        const targetStatus = statusMap[confirmAction] || confirmAction;
        for (const id of selectedOrders) {
          await adminOrderData.updateOrder(id, { status: targetStatus as any });
        }
        showToast(`Updated ${selectedOrders.length} orders to ${targetStatus}`, 'success');
      }
      setSelectedOrders([]);
      await loadData();
    } catch (err) {
      console.error('Failed to execute bulk action:', err);
      showToast('Bulk update failed. Please try again.', 'error');
    } finally {
      setConfirmAction('');
    }
  };

  if (isLoading) {
    return <AdminOrdersSkeleton />;
  }

  return (
    <div className={styles.container}>
      {/* ─── Header & Live Subtitle Badges (Matching Customers, Custom Orders & Admins UI) ─── */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Orders</h1>
          <div className={styles.statsSubtitle}>
            <span className={styles.statItemTotal}>
              {totalCount} Total Order{totalCount !== 1 ? 's' : ''}
            </span>
            <span className={styles.statDotBadge}>
              <span className={styles.dotAmber} />
              <span className={styles.statItemPending}>{pendingCount} Pending</span>
            </span>
            <span className={styles.statDotBadge}>
              <span className={styles.dotPink} />
              <span className={styles.statItemDispatched}>{dispatchedCount} Dispatched</span>
            </span>
            <span className={styles.statDotBadge}>
              <span className={styles.dotEmerald} />
              <span className={styles.statItemCompleted}>{deliveredCount} Delivered</span>
            </span>
          </div>
        </div>
      </div>

      {/* ─── Sticky Search & Actions Bar (Matching Customers, Custom Orders & Admins UI) ─── */}
      <div className={styles.stickyWrapper}>
        {selectedOrders.length > 0 ? (
          /* Bulk Action Toolbar */
          <div className={styles.bulkToolbarRow}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <span style={{ fontWeight: 600, color: 'var(--admin-pink)', whiteSpace: 'nowrap' }}>
                {selectedOrders.length}{' '}
                <span className={styles.hideMobile}>
                  order{selectedOrders.length > 1 ? 's' : ''} selected
                </span>
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                justifyContent: 'flex-end',
                flexWrap: 'nowrap',
              }}
            >
              <CustomSelect
                placeholder="Update Status..."
                value=""
                onChange={(val) => {
                  if (val) {
                    setConfirmAction(val);
                    setIsConfirmModalOpen(true);
                  }
                }}
                options={[
                  { value: 'pending', label: 'Mark as Pending' },
                  { value: 'processing', label: 'Mark as Being Baked' },
                  { value: 'shipped', label: 'Mark as Dispatched' },
                  { value: 'delivered', label: 'Mark as Delivered' },
                  { value: 'cancelled', label: 'Mark as Cancelled' },
                ]}
              />
              <button
                type="button"
                className={styles.exportBtn}
                title="Export Selected"
                onClick={handleExportSelected}
              >
                <Download size={16} />{' '}
                <span className={styles.hideMobile}>Export Selected</span>
              </button>
              <button
                type="button"
                className={styles.exportBtn}
                onClick={() => setSelectedOrders([])}
                title="Clear Selection"
              >
                <span className={styles.hideMobile}>Clear Selection</span>
                <X size={16} className={styles.showMobileInline} />
              </button>
              <button
                type="button"
                className={styles.btnDanger}
                title="Cancel Selected"
                onClick={() => {
                  setConfirmAction('delete');
                  setIsConfirmModalOpen(true);
                }}
              >
                <Trash2 size={16} />{' '}
                <span className={styles.hideMobile}>Cancel Selected</span>
              </button>
            </div>
          </div>
        ) : (
          /* Single Row: Search Input + Filters Button + Export Button + ViewToggle */
          <div className={styles.searchActionsBar}>
            <div className={styles.searchWrapper}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search orders by ID, customer name, email, phone, status..."
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className={styles.clearSearchBtn}
                  title="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className={styles.actionControlsGroup}>
              <button
                type="button"
                className={`${styles.filterBtn} ${
                  activeFilterCount > 0 ? styles.filterBtnActive : ''
                }`}
                title="Filters"
                onClick={() => setIsAdvFilterOpen(true)}
              >
                <SlidersHorizontal size={16} />
                <span className={styles.filterBtnText}>
                  {activeFilterCount > 0 ? `${activeFilterCount} Filters` : 'Filters'}
                </span>
                {activeFilterCount > 0 && (
                  <span className={styles.filterBadge}>{activeFilterCount}</span>
                )}
              </button>

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
        )}

        {/* Active Filter Chips Row */}
        {(activeFilterCount > 0 || searchTerm) && (
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
            {appliedFilters.status !== 'all' && (
              <span className={styles.filterChip}>
                Status: {appliedFilters.status}
                <button type="button" onClick={() => setAppliedFilters(prev => ({ ...prev, status: 'all' }))}>
                  <X size={12} />
                </button>
              </span>
            )}
            {appliedFilters.paymentStatus !== 'all' && (
              <span className={styles.filterChip}>
                Payment: {appliedFilters.paymentStatus}
                <button type="button" onClick={() => setAppliedFilters(prev => ({ ...prev, paymentStatus: 'all' }))}>
                  <X size={12} />
                </button>
              </span>
            )}
            {appliedFilters.date !== 'all' && (
              <span className={styles.filterChip}>
                Date: {appliedFilters.date}
                <button type="button" onClick={() => setAppliedFilters(prev => ({ ...prev, date: 'all' }))}>
                  <X size={12} />
                </button>
              </span>
            )}
            {appliedFilters.amount !== 'all' && (
              <span className={styles.filterChip}>
                Amount: {appliedFilters.amount}
                <button type="button" onClick={() => setAppliedFilters(prev => ({ ...prev, amount: 'all' }))}>
                  <X size={12} />
                </button>
              </span>
            )}
            {appliedFilters.items !== 'all' && (
              <span className={styles.filterChip}>
                Items: {appliedFilters.items}
                <button type="button" onClick={() => setAppliedFilters(prev => ({ ...prev, items: 'all' }))}>
                  <X size={12} />
                </button>
              </span>
            )}
            <button
              type="button"
              className={styles.clearAllFiltersBtn}
              onClick={handleResetAllFilters}
            >
              Clear all
            </button>
          </div>
        )}
      </div>


      {/* ─── Orders Table & Grid ─── */}
      {view === 'list' && (
        <div className={styles.tableCard}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>
                  <input 
                    type="checkbox" 
                    className={styles.checkbox}
                    checked={selectedOrders.length === paginatedData.length && paginatedData.length > 0}
                    onChange={(e) => setSelectedOrders(e.target.checked ? paginatedData.map(o => o.id || o._id) : [])}
                  />
                </th>
                <th style={{ width: '130px' }}>ORDER ID</th>
                <th>CUSTOMER</th>
                <th>ITEMS</th>
                <th>AMOUNT</th>
                <th>PAYMENT</th>
                <th>STATUS</th>
                <th>DATE</th>
                <th style={{ textAlign: 'right', width: '120px' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: 0, border: 'none' }}>
                    <div className={styles.emptyStateContainer}>
                      <div className={styles.emptyStateIconRing}>
                        {searchTerm || activeFilterCount > 0 ? (
                          <Search size={28} strokeWidth={1.8} />
                        ) : (
                          <ShoppingBag size={28} strokeWidth={1.8} />
                        )}
                      </div>
                      {searchTerm || activeFilterCount > 0 ? (
                        <>
                          <h4 className={styles.emptyStateTitle}>No matching orders found</h4>
                          <p className={styles.emptyStateSubtext}>
                            No customer orders match your active search or filter criteria. Try adjusting your query or clear filters.
                          </p>
                          <button
                            type="button"
                            className={styles.emptyStateClearBtn}
                            onClick={handleResetAllFilters}
                          >
                            <RotateCcw size={15} /> Clear All Filters
                          </button>
                        </>
                      ) : (
                        <>
                          <h4 className={styles.emptyStateTitle}>No customer orders yet</h4>
                          <p className={styles.emptyStateSubtext}>
                            When orders are placed through the storefront, they will appear here in real time.
                          </p>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((order, idx) => {
                  const orderId = order.id || order._id;
                  const firstItem = order.items?.[0];
                  const rawStatus = (order.status || order.orderStatus || 'Pending');
                  const isChecked = selectedOrders.includes(orderId);
                  const statusInfo = getStatusBadge(rawStatus);
                  const rowBorderClass = getRowBorderClass(order);

                  const numTotal = typeof order.total === 'number' 
                    ? order.total 
                    : parseFloat(String(order.total || 0).replace(/[^0-9.]/g, '')) || 0;
                  const paymentMethod = (order.paymentMethod || order.payment?.method || 'Online').toLowerCase();
                  const paymentStatus = (order.paymentStatus || order.payment?.status || 'pending').toLowerCase();
                  const isPaid = paymentStatus === 'paid' || paymentStatus === 'completed' || paymentStatus === 'success';

                  const customerPhone = order.customerPhone || order.customer?.phone || order.shippingAddress?.phone || '';
                  const recipientName = order.customerName || order.customer?.name || order.shippingAddress?.recipientName || 'Customer';
                  const addressObj = order.shippingAddress;
                  const addressText = typeof addressObj === 'string' 
                    ? addressObj 
                    : [addressObj?.street || addressObj?.addressLine1, addressObj?.city, addressObj?.state, addressObj?.postalCode || addressObj?.pincode].filter(Boolean).join(', ');

                  return (
                    <tr key={orderId || idx} className={`${styles.tableRow} ${rowBorderClass}`}>
                      <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          className={styles.checkbox}
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedOrders(prev => [...prev, orderId]);
                            } else {
                              setSelectedOrders(prev => prev.filter(id => id !== orderId));
                            }
                          }}
                        />
                      </td>
                      <td onClick={() => navigate(`/admin/orders/${encodeURIComponent(orderId)}`)} style={{ cursor: 'pointer' }}>
                        <div className={styles.orderIdCell}>
                          <span className={styles.orderIdText}>
                            #{order.orderNumber || orderId}
                          </span>
                          <span className={styles.orderTypeBadge}>
                            {paymentMethod.toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.tableCustomerCell}>
                          <span 
                            className={styles.tableCustomerName}
                            onClick={() => navigate(`/admin/orders/${encodeURIComponent(orderId)}`)}
                            title={recipientName}
                          >
                            {recipientName}
                          </span>
                          {customerPhone && (
                            <span className={styles.tableCustomerMeta}>
                              <Phone size={11} color="#059669" />
                              {customerPhone}
                            </span>
                          )}
                          {addressText && (
                            <span className={styles.tableCustomerMeta} title={addressText}>
                              <MapPin size={11} color="var(--admin-pink, #F20D6F)" />
                              {addressText}
                            </span>
                          )}
                        </div>
                      </td>
                      <td onClick={() => navigate(`/admin/orders/${encodeURIComponent(orderId)}`)} style={{ cursor: 'pointer' }}>
                        <div className={styles.tableItemsCell}>
                          <div className={styles.tableItemThumbWrapper}>
                            <img 
                              src={firstItem?.image || (order as any).productImage || '/images/placeholder.jpg'} 
                              alt={firstItem?.name || (order as any).productName || 'Order'} 
                              className={styles.tableItemThumb} 
                            />
                            {order.items && order.items.length > 1 && (
                              <span className={styles.tableItemCountBadge}>+{order.items.length - 1}</span>
                            )}
                          </div>
                          <div className={styles.tableItemDetails}>
                            <span className={styles.tableItemTitle} title={firstItem?.name || (order as any).productName}>
                              {firstItem?.name || (order as any).productName || 'Assorted Cake Pops'}
                              <span style={{ color: 'var(--color-text-muted, #524037)', fontWeight: 500, marginLeft: '4px' }}>
                                (x{firstItem?.quantity || 1})
                              </span>
                            </span>
                            <span className={styles.tableItemSubtext}>
                              {order.items?.length || 1} {(order.items?.length || 1) === 1 ? 'item' : 'items'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={styles.tableAmountCell}>
                          <span className={styles.tableAmountValue}>₹{numTotal.toLocaleString('en-IN')}</span>
                          <span className={styles.cellSubtext}>{order.items?.length || 1} item{order.items?.length !== 1 ? 's' : ''}</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.tablePaymentCell}>
                          <span className={`${styles.paymentBadge} ${isPaid ? styles.paymentPaid : styles.paymentPending}`}>
                            {isPaid ? 'PAID' : (paymentMethod === 'cod' ? 'PENDING COD' : 'PENDING')}
                          </span>
                          <span className={styles.tablePaymentMethod}>{paymentMethod}</span>
                        </div>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <OrderStatusDropdown
                          value={order.status || 'Pending'}
                          onChange={(newStatus) => handleSingleStatusUpdate(orderId, newStatus)}
                          disabled={updatingStatusId === orderId || (order.status || '').toLowerCase() === 'pending'}
                          isLoading={updatingStatusId === orderId}
                          onPendingClick={() => setPendingModalOrder(order)}
                          variant="badge"
                        />
                      </td>
                      <td>
                        <div className={styles.cellText} style={{ fontSize: '13px' }}>
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : (order.date || '—')}
                        </div>
                        <div className={styles.cellSubtext}>
                          {order.createdAt ? new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : (order.time || '')}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.tableActionsGroup}>
                          <button 
                            type="button"
                            className={styles.tableActionBtn}
                            onClick={() => navigate(`/admin/orders/${encodeURIComponent(orderId)}`)}
                            title="View Order Details"
                            aria-label="View Details"
                          >
                            <Eye size={15} />
                          </button>
                          <button 
                            type="button"
                            className={`${styles.tableActionBtn} ${styles.tableActionBtnPrimary}`}
                            onClick={() => setInvoiceOrder(order)}
                            title="View Invoice"
                            aria-label="Invoice"
                          >
                            <FileText size={15} />
                          </button>
                          <button 
                            type="button"
                            className={`${styles.tableActionBtn} ${styles.tableActionBtnDanger}`} 
                            aria-label="Cancel Order"
                            title="Cancel Order"
                            onClick={() => {
                              setSelectedOrders([orderId]);
                              setConfirmAction('delete');
                              setIsConfirmModalOpen(true);
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            </table>
          </div>
          {filteredData.length > 0 && totalPages > 1 && (
            <div className={styles.pagination}>
              <span className={styles.paginationText}>{pageInfo}</span>
              <div className={styles.pageControls}>
                <button 
                  type="button"
                  className={styles.pageBtn} 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                >
                  <ChevronLeft size={16} />
                </button>
                
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button 
                    key={i}
                    type="button"
                    className={`${styles.pageBtn} ${currentPage === i + 1 ? styles.active : ''}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}

                <button 
                  type="button"
                  className={styles.pageBtn} 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {view === 'grid' && (
        <>
          <div className={styles.gridWrapper}>
          {filteredData.length === 0 ? (
            <div style={{ gridColumn: '1 / -1' }}>
              <div className={styles.emptyStateContainer}>
                <div className={styles.emptyStateIconRing}>
                  {searchTerm || activeFilterCount > 0 ? (
                    <Search size={28} strokeWidth={1.8} />
                  ) : (
                    <ShoppingBag size={28} strokeWidth={1.8} />
                  )}
                </div>
                {searchTerm || activeFilterCount > 0 ? (
                  <>
                    <h4 className={styles.emptyStateTitle}>No matching orders found</h4>
                    <p className={styles.emptyStateSubtext}>
                      No customer orders match your active search or filter criteria. Try adjusting your query or clear filters.
                    </p>
                    <button
                      type="button"
                      className={styles.emptyStateClearBtn}
                      onClick={handleResetAllFilters}
                    >
                      <RotateCcw size={15} /> Clear All Filters
                    </button>
                  </>
                ) : (
                  <>
                    <h4 className={styles.emptyStateTitle}>No customer orders yet</h4>
                    <p className={styles.emptyStateSubtext}>
                      When orders are placed through the storefront, they will appear here in real time.
                    </p>
                  </>
                )}
              </div>
            </div>
          ) : (
            paginatedData.map((order, idx) => {
              const orderId = order.id || order._id;
              const firstItem = order.items?.[0];
              const rawStatus = (order.status || order.orderStatus || 'Pending');
              const isChecked = selectedOrders.includes(orderId);
              const isExpanded = expandedCardIds.has(orderId);
              const statusInfo = getStatusBadge(rawStatus);
              const borderClass = getCardBorderClass(rawStatus);

              const numTotal = typeof order.total === 'number' 
                ? order.total 
                : parseFloat(String(order.total || 0).replace(/[^0-9.]/g, '')) || 0;
              const paymentMethod = (order.paymentMethod || order.payment?.method || 'Online').toLowerCase();
              const paymentStatus = (order.paymentStatus || order.payment?.status || 'pending').toLowerCase();
              const isPaid = paymentStatus === 'paid' || paymentStatus === 'completed' || paymentStatus === 'success';

              const customerPhone = order.customerPhone || order.customer?.phone || order.shippingAddress?.phone || '';
              const cleanPhone = customerPhone.replace(/\D/g, '');
              const waPhone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;
              const recipientName = order.customerName || order.customer?.name || order.shippingAddress?.recipientName || 'Customer';
              const addressObj = order.shippingAddress;
              const addressText = typeof addressObj === 'string' 
                ? addressObj 
                : [addressObj?.street || addressObj?.addressLine1, addressObj?.city, addressObj?.state, addressObj?.postalCode || addressObj?.pincode].filter(Boolean).join(', ');

              const normUpper = rawStatus.toUpperCase();
              const isPending = normUpper === 'PENDING' || normUpper === 'CONFIRMED' || normUpper === 'ORDER CONFIRMED';

              return (
                <div 
                  key={orderId || idx} 
                  id={`order-card-${orderId}`}
                  className={`${styles.orderCard} ${borderClass}`}
                  onClick={() => toggleExpandCard(orderId)}
                >
                  {/* Card Header: Checkbox + Customer + Monospace Order ID + Payment Method + Status Pill */}
                  <div className={styles.cardHeader}>
                    <div className={styles.cardHeaderLeft}>
                      <div className={styles.cardCustomerRow}>
                        <input 
                          type="checkbox" 
                          className={styles.checkbox}
                          checked={isChecked}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedOrders(prev => [...prev, orderId]);
                            } else {
                              setSelectedOrders(prev => prev.filter(id => id !== orderId));
                            }
                          }}
                        />
                        <span 
                          className={styles.cardCustomerName}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/orders/${encodeURIComponent(orderId)}`);
                          }}
                          title={recipientName}
                        >
                          {recipientName}
                        </span>
                      </div>
                      <div className={styles.cardMetaRow}>
                        <span className={styles.cardOrderCode}>#{order.orderNumber || orderId}</span>
                        <span className={styles.cardMethodBadge}>{paymentMethod.toUpperCase()}</span>
                      </div>
                    </div>

                    <div className={`${styles.statusPill} ${statusInfo.style}`}>
                      <span className={`${styles.statusPillDot} ${statusInfo.pulse ? styles.pulseDot : ''}`} />
                      {statusInfo.label}
                    </div>
                  </div>

                  {/* Product Box */}
                  <div 
                    className={styles.cardProductBox} 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/admin/orders/${encodeURIComponent(orderId)}`);
                    }}
                  >
                    <img 
                      src={firstItem?.image || (order as any).productImage || '/images/placeholder.jpg'} 
                      alt={firstItem?.name || (order as any).productName || 'Order'} 
                      className={styles.cardProductImg} 
                    />
                    <div className={styles.cardProductInfo}>
                      <div className={styles.cardProductHeader}>
                        <span className={styles.cardProductTag}>ORDER ITEM</span>
                        {order.items && order.items.length > 1 && (
                          <span className={styles.cardMoreBadge}>+{order.items.length - 1} more</span>
                        )}
                      </div>
                      <div className={styles.cardProductTitle} title={firstItem?.name || (order as any).productName}>
                        {firstItem?.name || (order as any).productName || 'Assorted Cake Pops'}
                        <span className={styles.cardProductQty}>(x{firstItem?.quantity || 1})</span>
                      </div>
                      <span className={styles.cardProductSubtext}>
                        {order.items?.length || 1} {(order.items?.length || 1) === 1 ? 'item' : 'items'} in this order
                      </span>
                    </div>
                  </div>

                  {/* Financial Strip: Total Amount & Payment Badge */}
                  <div className={styles.cardFinancialStrip}>
                    <div className={styles.cardTotalGroup}>
                      <span className={styles.cardTotalLabel}>Total:</span>
                      <span className={styles.cardTotalValue}>₹{numTotal.toLocaleString('en-IN')}</span>
                    </div>
                    <span className={`${styles.paymentBadge} ${isPaid ? styles.paymentPaid : styles.paymentPending}`}>
                      {isPaid ? 'PAID' : (paymentMethod === 'cod' ? 'PENDING COD' : 'PENDING')}
                    </span>
                  </div>

                  {/* Action Section */}
                  <div className={styles.cardActionSection} onClick={(e) => e.stopPropagation()}>
                    {isPending ? (
                      <>
                        <button
                          type="button"
                          className={styles.approveBtn}
                          disabled={updatingStatusId === orderId}
                          onClick={() => handleApprovePendingOrder(order)}
                          title="Approve order and start baking"
                        >
                          {updatingStatusId === orderId ? (
                            <span className={styles.spinner} />
                          ) : (
                            <>
                              <CheckCircle2 size={14} />
                              Approve Order
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          className={styles.cancelBtn}
                          disabled={updatingStatusId === orderId}
                          onClick={() => handleCancelPendingOrder(order)}
                          title="Cancel order"
                        >
                          <XCircle size={14} />
                          Cancel
                        </button>
                        <button
                          type="button"
                          className={`${styles.detailsToggleBtn} ${isExpanded ? styles.detailsToggleBtnActive : ''}`}
                          onClick={(e) => toggleExpandCard(orderId, e)}
                          aria-label="Toggle details"
                        >
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </>
                    ) : (
                      <>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <OrderStatusDropdown
                            value={order.status || 'Pending'}
                            onChange={(newStatus) => handleSingleStatusUpdate(orderId, newStatus)}
                            disabled={updatingStatusId === orderId}
                            isLoading={updatingStatusId === orderId}
                            onPendingClick={() => setPendingModalOrder(order)}
                            variant="card"
                          />
                        </div>
                        <button
                          type="button"
                          className={`${styles.detailsToggleBtn} ${isExpanded ? styles.detailsToggleBtnActive : ''}`}
                          onClick={(e) => toggleExpandCard(orderId, e)}
                          aria-label="Toggle details"
                        >
                          {isExpanded ? 'Hide' : 'Details'}
                          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>
                      </>
                    )}
                  </div>

                  {/* Expandable Panel */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className={styles.cardExpandedPanel}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Contact info: Phone & WhatsApp */}
                        <div className={styles.cardContactGrid}>
                          {customerPhone ? (
                            <a 
                              href={`tel:${customerPhone}`} 
                              onClick={(e) => e.stopPropagation()} 
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--admin-brown, #381E10)', textDecoration: 'none', fontWeight: 600 }}
                            >
                              <Phone size={12} color="#059669" />
                              <span>{customerPhone}</span>
                            </a>
                          ) : (
                            <span style={{ color: '#94A3B8' }}>No phone</span>
                          )}
                          {cleanPhone ? (
                            <a 
                              href={`https://wa.me/${waPhone}`} 
                              target="_blank" 
                              rel="noreferrer" 
                              onClick={(e) => e.stopPropagation()} 
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#16A34A', textDecoration: 'none', fontWeight: 600 }}
                            >
                              <WhatsAppIcon size={13} />
                              <span>WhatsApp</span>
                            </a>
                          ) : (
                            <span style={{ color: '#94A3B8' }}>No WhatsApp</span>
                          )}
                        </div>

                        {/* Delivery Address */}
                        {addressText && (
                          <div className={styles.cardAddressBox}>
                            <MapPin size={13} color="var(--admin-pink, #F20D6F)" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span style={{ color: '#334155', lineHeight: 1.35 }}>{addressText}</span>
                          </div>
                        )}

                        {/* Itemized Breakdown */}
                        {order.items && order.items.length > 0 && (
                          <div className={styles.cardItemsBreakdown}>
                            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-muted, #524037)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              Order Items ({order.items.length})
                            </div>
                            {order.items.map((item: any, i: number) => (
                              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--admin-brown, #381E10)' }}>
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>
                                  {item.name || item.title || 'Item'} × {item.quantity || 1}
                                </span>
                                <span style={{ fontWeight: 600 }}>₹{(Number(item.price || item.unitPrice || 0) * (item.quantity || 1)).toLocaleString('en-IN')}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Placed Date / Time */}
                        <div className={styles.cardDateRow}>
                          <span>Placed on:</span>
                          <span style={{ fontWeight: 600, color: 'var(--admin-brown, #381E10)' }}>
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : (order.date || '—')}
                          </span>
                        </div>

                        {/* Card Action Buttons */}
                        <div className={styles.cardBtnRow}>
                          <button 
                            type="button" 
                            className={styles.cardBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/orders/${encodeURIComponent(orderId)}`);
                            }}
                          >
                            <Eye size={12} />
                            View
                          </button>
                          <button 
                            type="button" 
                            className={styles.cardBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              setInvoiceOrder(order);
                            }}
                          >
                            <FileText size={12} />
                            Invoice
                          </button>
                          <button 
                            type="button" 
                            className={`${styles.cardBtn} ${styles.cardBtnDelete}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrders([orderId]);
                              setConfirmAction('delete');
                              setIsConfirmModalOpen(true);
                            }}
                          >
                            <Trash2 size={12} />
                            Cancel
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
          </div>
        
        {filteredData.length > 0 && totalPages > 1 && (
          <div className={styles.pagination} style={{ backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', marginTop: '16px' }}>
            <span className={styles.paginationText}>{pageInfo}</span>
            <div className={styles.pageControls}>
              <button 
                type="button"
                className={styles.pageBtn} 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                <ChevronLeft size={16} />
              </button>
              
              {Array.from({ length: totalPages }).map((_, i) => (
                <button 
                  key={i}
                  type="button"
                  className={`${styles.pageBtn} ${currentPage === i + 1 ? styles.active : ''}`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button 
                type="button"
                className={styles.pageBtn} 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
        </>
      )}
      
      {/* ─── Invoice Viewer ─── */}
      <InvoiceViewer 
        isOpen={!!invoiceOrder} 
        onClose={() => setInvoiceOrder(null)} 
        data={invoiceOrder ? mapOrderToInvoiceData(invoiceOrder) : null} 
      />

      {/* ─── Confirmation Modal (Matching Customers / Admins UI) ─── */}
      {isConfirmModalOpen &&
        createPortal(
          <div
            className={deleteBtnStyles.backdrop}
            onClick={() => setIsConfirmModalOpen(false)}
          >
            <div
              className={deleteBtnStyles.modal}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={deleteBtnStyles.iconContainer}>
                <AlertTriangle size={24} className={deleteBtnStyles.warningIcon} />
              </div>
              <h3 className={deleteBtnStyles.title}>
                {confirmAction === 'delete'
                  ? `Cancel ${selectedOrders.length} selected order(s)?`
                  : `Update ${selectedOrders.length} order(s) to ${confirmAction}?`}
              </h3>
              <p className={deleteBtnStyles.message}>
                {confirmAction === 'delete'
                  ? 'This action will mark the selected orders as Cancelled.'
                  : `Are you sure you want to mark the selected order(s) as ${confirmAction}?`}
              </p>
              <div className={deleteBtnStyles.actions}>
                <button
                  type="button"
                  className={deleteBtnStyles.cancelButton}
                  onClick={() => setIsConfirmModalOpen(false)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className={
                    confirmAction === 'delete'
                      ? deleteBtnStyles.confirmButton
                      : deleteBtnStyles.primaryButton
                  }
                  onClick={handleExecuteConfirmAction}
                >
                  {confirmAction === 'delete' ? 'Confirm Cancellation' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ─── Pending Approval Gate Modal ─── */}
      {pendingModalOrder &&
        createPortal(
          <div
            className={styles.modalBackdrop}
            onClick={() => setPendingModalOrder(null)}
          >
            <div
              className={styles.modalCard}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <div className={`${styles.modalIconWrap} ${styles.modalIconAmber}`}>
                  <Clock size={22} />
                </div>
                <div>
                  <h3 className={styles.modalTitle}>Order Pending Approval</h3>
                  <p className={styles.modalSubtitle}>
                    Order #{pendingModalOrder.orderNumber || pendingModalOrder.id || pendingModalOrder._id} requires admin approval before kitchen processing.
                  </p>
                </div>
              </div>

              <div className={styles.modalOrderInfoCard}>
                <div className={styles.modalOrderInfoRow}>
                  <span className={styles.modalInfoKey}>Customer</span>
                  <span className={styles.modalInfoVal}>
                    {pendingModalOrder.customerName || pendingModalOrder.customer?.name || pendingModalOrder.shippingAddress?.recipientName || 'Customer'}
                  </span>
                </div>
                <div className={styles.modalOrderInfoRow}>
                  <span className={styles.modalInfoKey}>Total Amount</span>
                  <span className={styles.modalInfoVal}>
                    ₹{(typeof pendingModalOrder.total === 'number' ? pendingModalOrder.total : parseFloat(String(pendingModalOrder.total || 0).replace(/[^0-9.]/g, ''))).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className={styles.modalOrderInfoRow}>
                  <span className={styles.modalInfoKey}>Payment Method</span>
                  <span className={styles.modalInfoVal}>
                    {(pendingModalOrder.paymentMethod || pendingModalOrder.payment?.method || 'Online').toUpperCase()}
                  </span>
                </div>
              </div>

              <div className={`${styles.modalNotice} ${styles.modalNoticeAmber}`}>
                <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  All operational dropdowns are guarded while an order is pending. Approving moves the order directly to <strong>Being Baked</strong>. Cancelling immediately terminates the order.
                </span>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.modalBtnDismiss}
                  onClick={() => setPendingModalOrder(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className={styles.modalBtnCancel}
                  onClick={() => handleCancelPendingOrder(pendingModalOrder)}
                  disabled={updatingStatusId === (pendingModalOrder.id || pendingModalOrder._id)}
                >
                  <XCircle size={15} />
                  Cancel Order
                </button>
                <button
                  type="button"
                  className={styles.modalBtnApprove}
                  onClick={() => handleApprovePendingOrder(pendingModalOrder)}
                  disabled={updatingStatusId === (pendingModalOrder.id || pendingModalOrder._id)}
                >
                  <CheckCircle2 size={15} />
                  Approve (Start Baking)
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ─── Mandatory Dispatch & Agent Selection Modal ─── */}
      {dispatchModalOrder &&
        createPortal(
          <div
            className={styles.modalBackdrop}
            onClick={() => !isDispatching && setDispatchModalOrder(null)}
          >
            <div
              className={styles.modalCard}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <div className={`${styles.modalIconWrap} ${styles.modalIconPink}`}>
                  <Truck size={22} />
                </div>
                <div>
                  <h3 className={styles.modalTitle}>Dispatch Order & Assign Partner</h3>
                  <p className={styles.modalSubtitle}>
                    Order #{dispatchModalOrder.orderNumber || dispatchModalOrder.id || dispatchModalOrder._id} — Delivery partner assignment is mandatory to dispatch.
                  </p>
                </div>
              </div>

              <div className={styles.modalOrderInfoCard}>
                <div className={styles.modalOrderInfoRow}>
                  <span className={styles.modalInfoKey}>Recipient</span>
                  <span className={styles.modalInfoVal}>
                    {dispatchModalOrder.customerName || dispatchModalOrder.customer?.name || dispatchModalOrder.shippingAddress?.recipientName || 'Customer'}
                  </span>
                </div>
                <div className={styles.modalOrderInfoRow}>
                  <span className={styles.modalInfoKey}>Delivery Destination</span>
                  <span className={styles.modalInfoVal} style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {typeof dispatchModalOrder.shippingAddress === 'string'
                      ? dispatchModalOrder.shippingAddress
                      : [dispatchModalOrder.shippingAddress?.street, dispatchModalOrder.shippingAddress?.city, dispatchModalOrder.shippingAddress?.pincode].filter(Boolean).join(', ') || 'Address on file'}
                  </span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Select Delivery Agent *
                </label>
                <CustomSelect
                  value={dispatchAgentId}
                  onChange={(val) => setDispatchAgentId(val)}
                  placeholder="Select Delivery Agent (Mandatory)..."
                  options={availableAgents.map((ag) => ({
                    value: ag.id || ag._id,
                    label: `${ag.name} (${ag.phone || 'Phone on file'}) • ${ag.activeOrders || 0} active`,
                  }))}
                  variant="pink"
                />
              </div>

              <div className={`${styles.modalNotice} ${styles.modalNoticeBlue}`}>
                <Truck size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  Confirming dispatch will assign this delivery partner, change the order status to <strong>DISPATCHED</strong>, generate the customer's secure 6-digit delivery OTP, and activate live GPS tracking.
                </span>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.modalBtnDismiss}
                  onClick={() => setDispatchModalOrder(null)}
                  disabled={isDispatching}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.modalBtnDispatch}
                  onClick={handleConfirmDispatch}
                  disabled={!dispatchAgentId || isDispatching}
                >
                  {isDispatching ? (
                    <span className={styles.spinner} />
                  ) : (
                    <>
                      <Truck size={15} />
                      Confirm & Dispatch
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ─── Advanced Filter Modal (Matching Customers / Admins UI) ─── */}
      <AdminFilterModal
        isOpen={isAdvFilterOpen}
        onClose={() => {
          setIsAdvFilterOpen(false);
          setDraftFilters(appliedFilters);
        }}
        onApply={handleApplyAdvFilters}
        onReset={handleResetAdvFilters}
      >
        {/* Order Status */}
        <div className={filterModalStyles.filterGroup}>
          <span className={filterModalStyles.filterLabel}>Order Status</span>
          <div className={filterModalStyles.bracketGrid}>
            {[
              { value: 'all', label: 'All Statuses' },
              { value: 'pending', label: 'Pending' },
              { value: 'processing', label: 'In Kitchen' },
              { value: 'shipped', label: 'Dispatched' },
              { value: 'delivered', label: 'Delivered' },
              { value: 'cancelled', label: 'Cancelled' },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`${filterModalStyles.bracketBtn} ${draftFilters.status === opt.value ? filterModalStyles.active : ''}`}
                onClick={() => setDraftFilters(prev => ({ ...prev, status: opt.value }))}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Status */}
        <div className={filterModalStyles.filterGroup}>
          <span className={filterModalStyles.filterLabel}>Payment Status</span>
          <div className={filterModalStyles.bracketGrid}>
            {[
              { value: 'all', label: 'All Payments' },
              { value: 'paid', label: 'Paid' },
              { value: 'unpaid', label: 'Unpaid' },
              { value: 'cod', label: 'COD' },
              { value: 'refunded', label: 'Refunded' },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`${filterModalStyles.bracketBtn} ${draftFilters.paymentStatus === opt.value ? filterModalStyles.active : ''}`}
                onClick={() => setDraftFilters(prev => ({ ...prev, paymentStatus: opt.value }))}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div className={filterModalStyles.filterGroup}>
          <span className={filterModalStyles.filterLabel}>Order Date</span>
          <div className={filterModalStyles.bracketGrid}>
            {[
              { value: 'all', label: 'All Time' },
              { value: 'today', label: 'Today' },
              { value: '7days', label: 'Last 7 Days' },
              { value: '30days', label: 'Last 30 Days' },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`${filterModalStyles.bracketBtn} ${draftFilters.date === opt.value ? filterModalStyles.active : ''}`}
                onClick={() => setDraftFilters(prev => ({ ...prev, date: opt.value }))}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Amount Range */}
        <div className={filterModalStyles.filterGroup}>
          <span className={filterModalStyles.filterLabel}>Amount Range</span>
          <div className={filterModalStyles.bracketGrid}>
            {[
              { value: 'all', label: 'Any Amount' },
              { value: '0-500', label: 'Up to ₹500' },
              { value: '500-2000', label: '₹500 - ₹2,000' },
              { value: '2000+', label: 'Over ₹2,000' },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`${filterModalStyles.bracketBtn} ${draftFilters.amount === opt.value ? filterModalStyles.active : ''}`}
                onClick={() => setDraftFilters(prev => ({ ...prev, amount: opt.value }))}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Items Count */}
        <div className={filterModalStyles.filterGroup}>
          <span className={filterModalStyles.filterLabel}>Items Count</span>
          <div className={filterModalStyles.bracketGrid}>
            {[
              { value: 'all', label: 'Any Items' },
              { value: '1', label: '1 Item' },
              { value: '2-5', label: '2 - 5 Items' },
              { value: '6+', label: '6+ Items' },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`${filterModalStyles.bracketBtn} ${draftFilters.items === opt.value ? filterModalStyles.active : ''}`}
                onClick={() => setDraftFilters(prev => ({ ...prev, items: opt.value }))}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Results By */}
        <div className={filterModalStyles.filterGroup}>
          <span className={filterModalStyles.filterLabel}>Sort Results By</span>
          <div className={filterModalStyles.bracketGrid}>
            {[
              { value: 'newest', label: 'Newest First' },
              { value: 'highest', label: 'Highest Amount' },
              { value: 'lowest', label: 'Lowest Amount' },
              { value: 'oldest', label: 'Oldest First' },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`${filterModalStyles.bracketBtn} ${draftFilters.sortBy === opt.value ? filterModalStyles.active : ''}`}
                onClick={() => setDraftFilters(prev => ({ ...prev, sortBy: opt.value }))}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </AdminFilterModal>
    </div>
  );
}
