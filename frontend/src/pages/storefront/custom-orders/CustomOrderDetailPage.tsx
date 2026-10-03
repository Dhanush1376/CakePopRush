import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, MessageCircle, Clock, CheckCircle2, Image, ShieldCheck, Phone, Video, MoreVertical, Calendar, X } from 'lucide-react';
import { CustomOrderDetailSkeleton } from './components/CustomOrderStep1Skeleton';
import { Button } from '@/components/ui/Button';
import { customOrderService, CustomOrderDto } from '@/services/api/customOrderService';
import { CUSTOM_ORDER_STATUS_THEME } from './constants/customOrderTheme';
import { FrostingCorner } from './components/FrostingCorner';
import styles from './CustomOrderDetailPage.module.css';

const STATUS_CONFIG = CUSTOM_ORDER_STATUS_THEME;

const WhatsAppDoubleCheck: React.FC = () => (
  <svg
    viewBox="0 0 16 11"
    width="15"
    height="10"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={styles.readReceipt}
    aria-label="Read receipts"
  >
    <path
      d="M11.071 0.929L4.999 7.001L2.428 4.43L1 5.858L4.999 9.858L12.5 2.357L11.071 0.929Z"
      fill="#53BDEB"
    />
    <path
      d="M14.571 0.929L8.5 7.001L7.999 6.5L6.571 7.929L8.5 9.858L16 2.357L14.571 0.929Z"
      fill="#53BDEB"
    />
  </svg>
);

const OutgoingTail: React.FC = () => (
  <svg className={styles.tailOut} viewBox="0 0 8 13" width="8" height="13" aria-hidden="true">
    <path opacity="0.13" fill="#000" d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z" />
    <path fill="#D9FDD3" d="M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z" />
  </svg>
);

const IncomingTail: React.FC = () => (
  <svg className={styles.tailIn} viewBox="0 0 8 13" width="8" height="13" aria-hidden="true">
    <path opacity="0.13" fill="#000" d="M1.533 2.568L8 11.193V0H2.812C1.042 0 .474 1.156 1.533 2.568z" />
    <path fill="#FFFFFF" d="M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z" />
  </svg>
);

export const CustomOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<CustomOrderDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!id) return;

    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const res: any = await customOrderService.getById(id);
        const orderData = res?.data || res;
        if (isMounted && orderData && (orderData._id || orderData.id || orderData.orderId)) {
          setOrder(orderData);
          return;
        }
      } catch (err: any) {
        try {
          const myOrdersRes: any = await customOrderService.getMyOrders();
          const list: CustomOrderDto[] = Array.isArray(myOrdersRes?.data)
            ? myOrdersRes.data
            : Array.isArray(myOrdersRes)
            ? myOrdersRes
            : [];
          const found = list.find(
            (o: CustomOrderDto) =>
              o._id === id || o.id === id || o.orderId === id || `REQ-${o.orderId}` === id
          );
          if (isMounted && found) {
            setOrder(found);
            return;
          }
        } catch (_) {}

        if (isMounted) {
          setError(err?.message || 'Could not find this custom order request.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchOrder();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleBack = () => {
    navigate('/custom-orders?tab=track');
  };

  const cfg = (order?.status && STATUS_CONFIG[order.status]) || {
    label: (order?.status || 'PENDING').toUpperCase(),
    color: '#D97706',
    bg: '#FEF3C7',
    border: '#FDE68A',
  };

  const prod = order?.productSnapshot || order?.product;

  const formattedTargetDate =
    order?.targetDate ||
    (order?.targetDateRaw
      ? new Date(order.targetDateRaw).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : 'Flexible');

  const formattedCreatedDate = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent';

  const formattedTime = order?.createdAt
    ? new Date(order.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const whatsappMessage = order
    ? encodeURIComponent(
        `Hi CakePopRush Team! I'm inquiring about my custom order request #${order.orderId} (${order.occasion ? String(order.occasion).replace(/_/g, ' ') : 'Custom Order'}, ${order.quantity} units).`
      )
    : '';

  const fallbackThumb =
    'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=400&q=80';

  const displayImage = order?.designImage || prod?.image || fallbackThumb;

  const categoryTag = `#${order?.orderId || (order as any)?._id?.slice(-4) || '0843'} • ${
    order?.source === 'PRODUCT' ? 'Custom Product' : 'Custom Order'
  }`;

  const title = (() => {
    if (prod?.name) return prod.name;
    if (order?.occasion && order.occasion !== 'other') {
      const cleanOcc = String(order.occasion)
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
      return `${cleanOcc} Special`;
    }
    if ((order as any)?.theme) {
      return `${String((order as any).theme)} Collection`;
    }
    if ((order as any)?.flavor) {
      return `${String((order as any).flavor)} Assortment`;
    }
    const qty = order?.quantity || 1;
    return `Bespoke Set × ${qty}`;
  })();

  const detailsText = (() => {
    const qty = `Qty: ${order?.quantity || 1} units`;
    if (order?.occasion && order.occasion !== 'other') {
      const occ = String(order.occasion).replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
      return `${occ} Occasion • ${qty}`;
    }
    if (order?.occasionDescription && order.occasionDescription.trim().length > 0) {
      const cleanDesc = order.occasionDescription.trim().replace(/\s+/g, ' ');
      const snippet = cleanDesc.length > 35 ? `${cleanDesc.slice(0, 35)}…` : cleanDesc;
      return `"${snippet}" • ${qty}`;
    }
    return `Custom Artisan Request • ${qty}`;
  })();

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Navigation Top Header */}
        <header className={styles.header}>
          <button type="button" onClick={handleBack} className={styles.backBtn}>
            <ChevronLeft size={18} strokeWidth={2.5} />
            <span>BACK TO REQUESTS</span>
          </button>

          <a
            href={`https://wa.me/1234567890?text=${whatsappMessage || 'Hi%20CakePopRush%20Team!'}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.helpBtn}
          >
            <MessageCircle size={15} strokeWidth={2.5} />
            <span>NEED HELP?</span>
          </a>
        </header>

        {isLoading ? (
          <CustomOrderDetailSkeleton />
        ) : error || !order ? (
          <div className={styles.emptyState}>
            <h3 className={styles.emptyTitle}>Request Not Found</h3>
            <p className={styles.emptyText}>{error || "We couldn't locate this custom order request."}</p>
            <Button variant="primary" onClick={handleBack}>
              Return to Requests
            </Button>
          </div>
        ) : (
          <>
            {/* 1. Request Overview Card (Matching Custom Order Card on track tab) */}
            <div className={styles.minimalCard}>
              <div className={styles.minimalHeader}>
                <div className={styles.minimalStatus}>
                  <Clock size={15} color={cfg.color} strokeWidth={2.2} />
                  <span className={styles.minimalStatusText} style={{ color: cfg.color }}>
                    {cfg.label}
                  </span>
                </div>
                <span className={styles.minimalDate}>{formattedCreatedDate}</span>
              </div>

              <div className={styles.minimalBody}>
                <div className={styles.minimalImageContainer}>
                  <img src={displayImage} alt={title} className={styles.minimalImage} />
                </div>
                <div className={styles.minimalContent}>
                  <span className={styles.minimalBrand}>{categoryTag}</span>
                  <h4 className={styles.minimalItemName}>{title}</h4>
                  <p className={styles.minimalVariant}>{detailsText}</p>
                  <div className={styles.minimalFooterRow}>
                    <div className={styles.minimalTargetChip}>
                      <Calendar size={12} className={styles.chipIcon} />
                      <span>Target: {formattedTargetDate}</span>
                    </div>
                    {(order?.customerPhone || (order as any)?.phone) && (
                      <div className={styles.minimalTargetChip}>
                        <Phone size={12} className={styles.chipIcon} />
                        <span>{order?.customerPhone || (order as any)?.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. WhatsApp-Style Conversational Consultation Feed */}
            <div className={styles.chatSection}>
              {/* WhatsApp App Bar Header */}
              <div className={styles.chatSectionHeader}>
                <div className={styles.chatHeaderLeft}>
                  <div className={styles.avatarWrapper}>
                    <div className={styles.chatAvatar}>
                      <img
                        src="/metalogo.png"
                        alt="CakePopRush"
                        className={styles.chatAvatarImg}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    <span className={styles.onlineStatusDot} />
                  </div>
                  <div className={styles.headerInfo}>
                    <div className={styles.chatTitleRow}>
                      <span className={styles.chatTitle}>CakePopRush</span>
                      <span className={styles.verifiedBadge} title="Verified">
                        <CheckCircle2 size={13} strokeWidth={2.5} />
                      </span>
                    </div>
                    <div className={styles.chatSubtitle}>
                      <span className={styles.onlineText}>online</span>
                      <span className={styles.dotSeparator}>•</span>
                      <span>Order Consultation</span>
                    </div>
                  </div>
                </div>

                <div className={styles.headerRight}>
                  {/* WhatsApp Video Call Icon */}
                  <a
                    href={`https://wa.me/1234567890?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.headerIconBtn}
                    title="Video Call on WhatsApp"
                    aria-label="Video Call on WhatsApp"
                  >
                    <Video size={18} strokeWidth={2.2} />
                  </a>

                  {/* WhatsApp Audio / Phone Call Icon */}
                  <a
                    href={`https://wa.me/1234567890?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.headerIconBtn}
                    title="Audio Call on WhatsApp"
                    aria-label="Audio Call on WhatsApp"
                  >
                    <Phone size={17} strokeWidth={2.2} />
                  </a>

                  {/* WhatsApp 3 Dots Menu */}
                  <div className={styles.moreMenuWrapper}>
                    <button
                      type="button"
                      onClick={() => setIsMenuOpen((prev) => !prev)}
                      className={styles.headerIconBtn}
                      title="More options"
                      aria-label="More options"
                    >
                      <MoreVertical size={18} strokeWidth={2.2} />
                    </button>

                    {isMenuOpen && (
                      <>
                        <div className={styles.menuBackdrop} onClick={() => setIsMenuOpen(false)} />
                        <div className={styles.headerDropdown}>
                          <div className={styles.dropdownStatusRow}>
                            <span className={styles.dropdownStatusLabel}>Order Status</span>
                            <span
                              className={styles.dropdownStatusBadge}
                              style={{
                                color: cfg.color,
                                backgroundColor: cfg.bg,
                                borderColor: cfg.border,
                              }}
                            >
                              {cfg.label}
                            </span>
                          </div>
                          <div className={styles.dropdownDivider} />
                          <a
                            href={`https://wa.me/1234567890?text=${whatsappMessage}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.dropdownItem}
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <MessageCircle size={15} />
                            <span>Chat on WhatsApp</span>
                          </a>

                          <button
                            type="button"
                            className={styles.dropdownItem}
                            onClick={() => {
                              setIsMenuOpen(false);
                              handleBack();
                            }}
                          >
                            <ChevronLeft size={15} />
                            <span>All Custom Orders</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Chat Feed Area with WhatsApp Wallpaper */}
              <div className={styles.chatFeed}>
                {/* System Consultation Notice Pill (like WhatsApp encryption notice) */}
                <div className={styles.systemNotice}>
                  <ShieldCheck size={13} className={styles.noticeIcon} />
                  <span>
                    Official Order Consultation • Messages & quotes are coordinated directly with our pastry chefs via WhatsApp.
                  </span>
                </div>

                {/* Date separator */}
                <div className={styles.dateSeparator}>
                  <span>{formattedCreatedDate}</span>
                </div>

                {/* Customer Message (Right aligned, WhatsApp Outgoing Green Bubble with Tail) */}
                <div className={styles.customerMessageRow}>
                  <div className={styles.customerBubble}>
                    <OutgoingTail />

                    <div className={styles.bubbleHeader}>
                      <span className={styles.senderLabel}>You (Customer)</span>
                    </div>

                    {/* Uploaded Reference Image thumbnail */}
                    {order.designImage && (
                      <div
                        className={styles.attachmentBox}
                        onClick={() => setIsImageModalOpen(true)}
                        title="Click to view reference image full size"
                      >
                        <img
                          src={order.designImage}
                          alt="Your reference design"
                          className={styles.attachmentImg}
                        />
                        <div className={styles.attachmentCaption}>
                          <Image size={12} />
                          <span>Reference Design Attached</span>
                        </div>
                      </div>
                    )}

                    <p className={styles.customerText}>
                      {order.occasionDescription || 'No additional note provided.'}
                    </p>

                    <div className={styles.metaRow}>
                      {formattedTime && <span className={styles.messageTimestamp}>{formattedTime}</span>}
                      <WhatsAppDoubleCheck />
                    </div>
                  </div>
                </div>

                {/* Pastry Team Response (Left aligned, WhatsApp Incoming White Bubble with Tail) */}
                <div className={styles.teamMessageRow}>
                  <div className={styles.teamAvatarMini}>
                    <img src="/metalogo.png" alt="CakePopRush" className={styles.teamAvatarImg} />
                  </div>
                  <div className={styles.teamBubble}>
                    <IncomingTail />

                    <div className={styles.bubbleHeader}>
                      <span className={styles.teamSenderLabel}>CakePopRush Artisan Team</span>
                    </div>

                    <p className={styles.teamText}>
                      Hello! We have received your custom order inquiry. Our pastry chefs are reviewing your
                      design reference, flavor pairings, and delivery timeline.
                    </p>
                    <p className={styles.teamText}>
                      Our team will reach out directly on WhatsApp or phone shortly to discuss your custom options
                      and provide your tailored quote!
                    </p>

                    <div className={styles.teamMetaRow}>
                      <span className={styles.teamTimestamp}>Just now</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. WhatsApp-Themed Action & Quick Reply Input Bar */}
              <div className={styles.chatActionFooter}>
                <a
                  href={`https://wa.me/1234567890?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.fakeInputBar}
                  title="Reply or discuss on WhatsApp"
                >
                  <MessageCircle size={18} className={styles.inputBarIcon} />
                  <span className={styles.inputBarText}>
                    Reply or discuss on WhatsApp...
                  </span>
                  <span className={styles.sendFab} aria-label="Send message on WhatsApp">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.66-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a5.8 5.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                    </svg>
                  </span>
                </a>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Lightbox Modal */}
      {isImageModalOpen && order?.designImage && (
        <div className={styles.lightboxBackdrop} onClick={() => setIsImageModalOpen(false)}>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <img src={order.designImage} alt="Design Reference" className={styles.lightboxImg} />
            <button
              type="button"
              className={styles.lightboxCloseBtn}
              onClick={() => setIsImageModalOpen(false)}
              aria-label="Close image modal"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}

      {/* Turquoise Frosting Corner bottom-left */}
      <FrostingCorner position="bottomLeft" variant="turquoise" className={styles.bottomFrosting} />
    </div>
  );
};
