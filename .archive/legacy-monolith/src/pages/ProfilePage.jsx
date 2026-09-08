import React, { useState } from 'react';
import { 
  User, 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  GraduationCap, 
  RotateCcw, 
  ChevronRight, 
  Bell, 
  HelpCircle, 
  ShieldCheck, 
  Heart, 
  LogOut, 
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { STUDENT_PROFILE } from '../data/campusFoodData';

export default function ProfilePage({ onNavigate }) {
  const { pastOrders, reorder, activeOrder, showToast } = useCart();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'addresses' | 'support' | 'settings'

  const [notificationSettings, setNotificationSettings] = useState({
    orderStatus: true,
    promoOffers: true,
    hostelLateNight: true
  });

  const toggleNotification = (key) => {
    setNotificationSettings(prev => ({ ...prev, [key]: !prev[key] }));
    showToast('Preference updated', 'info');
  };

  const handleLogout = () => {
    showToast('Logged out of demo profile. Log in anytime!', 'info');
  };

  return (
    <div className="profile-page page-container" style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px 80px' }}>
      {/* Profile Header Card */}
      <div 
        style={{
          background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
          color: 'white',
          borderRadius: 24,
          padding: '32px 28px',
          boxShadow: '0 12px 32px rgba(15, 23, 42, 0.18)',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: 32
        }}
      >
        <div 
          style={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 87, 34, 0.3) 0%, rgba(255, 87, 34, 0) 70%)',
            pointerEvents: 'none'
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          <div 
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FF5722, #FF8A65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              fontWeight: 800,
              color: 'white',
              border: '3px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 20px rgba(255, 87, 34, 0.35)'
            }}
          >
            {STUDENT_PROFILE.name.charAt(0)}
          </div>

          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>{STUDENT_PROFILE.name}</h1>
              <span 
                style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#34D399',
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '2px 10px',
                  borderRadius: 12,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <ShieldCheck size={14} /> Verified Student
              </span>
            </div>

            <div style={{ fontSize: 13, color: '#94A3B8', display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 6 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <GraduationCap size={14} color="#CBD5E1" /> {STUDENT_PROFILE.rollNo}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Mail size={14} color="#CBD5E1" /> {STUDENT_PROFILE.email}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Phone size={14} color="#CBD5E1" /> {STUDENT_PROFILE.phone}
              </span>
            </div>

            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#F97316' }}>
              <MapPin size={14} />
              <span>{STUDENT_PROFILE.campus}</span>
            </div>
          </div>
        </div>

        {/* Quick stat cards */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: 12,
            marginTop: 24,
            paddingTop: 20,
            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '12px 16px', borderRadius: 14 }}>
            <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Orders</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'white', marginTop: 2 }}>{pastOrders.length}</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '12px 16px', borderRadius: 14 }}>
            <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 }}>Campus Savings</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#10B981', marginTop: 2 }}>₹280+</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '12px 16px', borderRadius: 14 }}>
            <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 }}>Hostel Block</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'white', marginTop: 2 }}>Block B (Boys)</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div 
        style={{
          display: 'flex',
          gap: 8,
          borderBottom: '1px solid #E2E8F0',
          marginBottom: 28,
          overflowX: 'auto',
          paddingBottom: 4
        }}
      >
        {[
          { id: 'orders', label: 'Order History', icon: Clock },
          { id: 'addresses', label: 'Saved Locations', icon: MapPin },
          { id: 'settings', label: 'Notifications', icon: Bell },
          { id: 'support', label: 'Campus Support & FAQ', icon: HelpCircle }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                borderRadius: 12,
                border: 'none',
                background: isActive ? '#FFF1EB' : 'transparent',
                color: isActive ? '#FF5722' : '#64748B',
                fontWeight: isActive ? 700 : 500,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} />
              {tab.label}
              {tab.id === 'orders' && pastOrders.length > 0 && (
                <span 
                  style={{
                    background: isActive ? '#FF5722' : '#E2E8F0',
                    color: isActive ? 'white' : '#475569',
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: 10
                  }}
                >
                  {pastOrders.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: Orders */}
      {activeTab === 'orders' && (
        <div>
          {/* Active order banner if exists */}
          {activeOrder && activeOrder.currentStage < 5 && (
            <div 
              style={{
                background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
                border: '1.5px solid #93C5FD',
                borderRadius: 16,
                padding: '18px 20px',
                marginBottom: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 14
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 28 }}>🛵</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1D4ED8', textTransform: 'uppercase' }}>
                    Active Order In Progress
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#1E293B' }}>
                    Order #{activeOrder.id} • {activeOrder.items?.length} items
                  </div>
                  <div style={{ fontSize: 12, color: '#4B5563', marginTop: 2 }}>
                    Destination: {activeOrder.deliveredTo}
                  </div>
                </div>
              </div>
              <button
                onClick={() => onNavigate('tracking')}
                style={{
                  background: '#2563EB',
                  color: 'white',
                  border: 'none',
                  borderRadius: 10,
                  padding: '8px 16px',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                Track Live <ChevronRight size={16} />
              </button>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#0F172A' }}>
              Past Orders
            </h2>
            <span style={{ fontSize: 13, color: '#64748B' }}>
              Showing {pastOrders.length} completed & previous orders
            </span>
          </div>

          {pastOrders.length === 0 ? (
            <div 
              style={{
                background: 'white',
                borderRadius: 20,
                padding: '48px 20px',
                textAlign: 'center',
                border: '1px dashed #CBD5E1'
              }}
            >
              <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>🍽️</span>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1E293B', marginBottom: 6 }}>No Past Orders Yet</h3>
              <p style={{ fontSize: 14, color: '#64748B', maxWidth: 360, margin: '0 auto 20px' }}>
                You haven't ordered any food yet. Explore the campus food corners and satisfy your cravings!
              </p>
              <button
                onClick={() => onNavigate('home')}
                className="btn-primary"
                style={{ padding: '10px 24px', fontSize: 14, borderRadius: 12 }}
              >
                Browse Campus Menus
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {pastOrders.map((order) => (
                <div 
                  key={order.id}
                  style={{
                    background: 'white',
                    borderRadius: 18,
                    padding: '20px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                >
                  <div 
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 12,
                      paddingBottom: 14,
                      borderBottom: '1px solid #F1F5F9'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                          {order.vendorName || "Campus Food Corner"}
                        </h4>
                        <span 
                          style={{
                            background: '#DEF7EC',
                            color: '#03543F',
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 10,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          <CheckCircle2 size={12} /> {order.status || 'Delivered'}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: '#64748B' }}>
                        Order #{order.id} • {order.dateFormatted || order.date || 'Recent'}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
                        ₹{order.total}
                      </div>
                      <div style={{ fontSize: 11, color: '#94A3B8' }}>
                        {order.items?.length || 1} items
                      </div>
                    </div>
                  </div>

                  {/* Order items list */}
                  <div style={{ padding: '14px 0', fontSize: 13, color: '#334155', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {order.items?.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>
                          <strong style={{ color: '#0F172A' }}>{item.qty || 1}x</strong> {item.name}
                        </span>
                        <span style={{ color: '#64748B' }}>₹{item.price * (item.qty || 1)}</span>
                      </div>
                    ))}
                  </div>

                  <div 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: 14,
                      borderTop: '1px solid #F1F5F9',
                      flexWrap: 'wrap',
                      gap: 12
                    }}
                  >
                    <div style={{ fontSize: 12, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={14} color="#94A3B8" /> {order.deliveredTo || 'Hostel Block B'}
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        onClick={() => reorder(order)}
                        style={{
                          background: '#FFF1EB',
                          color: '#FF5722',
                          border: '1px solid rgba(255, 87, 34, 0.3)',
                          borderRadius: 10,
                          padding: '8px 16px',
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          transition: 'all 0.2s'
                        }}
                      >
                        <RotateCcw size={14} /> Reorder
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Saved Addresses */}
      {activeTab === 'addresses' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#0F172A' }}>
              Campus Drop-off Locations
            </h2>
            <button
              onClick={() => showToast('New campus location form opened in demo', 'info')}
              style={{
                background: 'none',
                border: 'none',
                color: '#FF5722',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer'
              }}
            >
              + Add Custom Drop-off
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {STUDENT_PROFILE.savedLocations.map((loc, idx) => (
              <div 
                key={idx}
                style={{
                  background: 'white',
                  borderRadius: 16,
                  padding: '20px',
                  border: idx === 0 ? '2px solid #FF5722' : '1px solid #E2E8F0',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  position: 'relative'
                }}
              >
                {idx === 0 && (
                  <span 
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      background: '#FFF1EB',
                      color: '#FF5722',
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 6,
                      textTransform: 'uppercase'
                    }}
                  >
                    Default
                  </span>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div 
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: '#F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#0F172A'
                    }}
                  >
                    <MapPin size={18} />
                  </div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#0F172A' }}>
                    {loc.title}
                  </h4>
                </div>
                <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                  {loc.address}
                </p>
                <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => showToast(`Selected ${loc.title} as active drop-off`)}
                    style={{
                      border: 'none',
                      background: '#F8FAFC',
                      color: '#0F172A',
                      fontSize: 12,
                      fontWeight: 600,
                      padding: '6px 12px',
                      borderRadius: 8,
                      cursor: 'pointer'
                    }}
                  >
                    Deliver Here
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Notifications */}
      {activeTab === 'settings' && (
        <div style={{ background: 'white', borderRadius: 18, padding: '24px', border: '1px solid #E2E8F0' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: '#0F172A' }}>
            Campus Alert & Notification Preferences
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A' }}>Live Order Status WhatsApp / SMS</div>
                <div style={{ fontSize: 12, color: '#64748B' }}>Receive instant alerts when vendor starts cooking and courier arrives</div>
              </div>
              <input 
                type="checkbox" 
                checked={notificationSettings.orderStatus} 
                onChange={() => toggleNotification('orderStatus')}
                style={{ width: 18, height: 18, accentColor: '#FF5722', cursor: 'pointer' }}
              />
            </div>

            <div style={{ height: 1, background: '#F1F5F9' }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A' }}>Campus Daily Deals & Free Delivery Flash Sales</div>
                <div style={{ fontSize: 12, color: '#64748B' }}>Get notified about 50% discount coupons during exam weeks and fest seasons</div>
              </div>
              <input 
                type="checkbox" 
                checked={notificationSettings.promoOffers} 
                onChange={() => toggleNotification('promoOffers')}
                style={{ width: 18, height: 18, accentColor: '#FF5722', cursor: 'pointer' }}
              />
            </div>

            <div style={{ height: 1, background: '#F1F5F9' }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A' }}>Late Night Hostel Mess Openings</div>
                <div style={{ fontSize: 12, color: '#64748B' }}>Alerts when Khaana Peena or Roll Express accept orders after 11:30 PM</div>
              </div>
              <input 
                type="checkbox" 
                checked={notificationSettings.hostelLateNight} 
                onChange={() => toggleNotification('hostelLateNight')}
                style={{ width: 18, height: 18, accentColor: '#FF5722', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Campus Support & FAQ */}
      {activeTab === 'support' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'white', borderRadius: 18, padding: '24px', border: '1px solid #E2E8F0' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#0F172A' }}>
              Campus Food Services Helpdesk
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>
                  Q: Where does the courier drop off food during hostel curfew?
                </div>
                <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                  During night hours (post 10:00 PM), couriers will meet you at the respective Hostel Block Gate Security Desk. For daytime deliveries, room-doorstep drop-off is supported!
                </div>
              </div>

              <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>
                  Q: Can I use campus Mess card or UPI?
                </div>
                <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                  Yes! We support all campus payment modes including PhonePe, Google Pay, Paytm UPI, cash on delivery at hostel gate, and student dining cards.
                </div>
              </div>

              <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>
                  Q: How do I onboard a new local vendor or food truck?
                </div>
                <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                  Vendors can apply through the campus dining partner portal. Contact the student council representatives or email vendor-support@campusbites.edu.
                </div>
              </div>
            </div>

            <div style={{ marginTop: 24, padding: '16px', background: '#FFF7ED', borderRadius: 14, border: '1px solid #FED7AA' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#C2410C', fontWeight: 700, fontSize: 14 }}>
                <AlertCircle size={18} /> Need Urgent Help with an ongoing order?
              </div>
              <div style={{ fontSize: 13, color: '#9A3412', marginTop: 4 }}>
                Contact Campus Dining Hotline: <strong>+91 78429 60252</strong> or email <strong>rajsrmap2@gmail.com</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout & Demo Notice Section */}
      <div style={{ marginTop: 40, textAlign: 'center' }}>
        <button
          onClick={handleLogout}
          style={{
            background: 'none',
            border: '1px solid #CBD5E1',
            padding: '10px 24px',
            borderRadius: 12,
            color: '#64748B',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 28,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#EF4444'; e.currentTarget.style.color = '#EF4444'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = '#64748B'; }}
        >
          <LogOut size={16} /> Sign Out Demo Account
        </button>

        {/* Required Unofficial Redesign Disclaimer */}
        <div 
          style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: 16,
            padding: '20px',
            maxWidth: 680,
            margin: '0 auto',
            fontSize: 12,
            color: '#64748B',
            lineHeight: 1.6
          }}
        >
          <div style={{ fontWeight: 700, color: '#475569', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 11 }}>
            Design Demonstration Notice
          </div>
          Unofficial UI/UX Redesign Concept. Created independently as a design and development demonstration. Not affiliated with or endorsed by any existing platform.
        </div>
      </div>
    </div>
  );
}
