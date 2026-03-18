import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Settings,
  LogOut,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/conversations', icon: MessageSquare, label: 'Conversations' },
  { to: '/contacts', icon: Users, label: 'Contacts' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const { user, signOut } = useAuth();
  const displayName = user?.full_name ?? '';
  const email = user?.email ?? '';

  return (
    <aside
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: 240,
        height: '100vh',
        borderRight: '1px solid #e5e7eb',
        backgroundColor: '#ffffff',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ padding: '20px 24px' }}>
        <span
          style={{
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: '-0.025em',
            color: '#E8546C',
          }}
        >
          boundbird
        </span>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '0 12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'all 0.15s',
                backgroundColor: isActive ? 'rgba(232, 84, 108, 0.08)' : 'transparent',
                color: isActive ? '#E8546C' : '#6b7280',
              })}
            >
              <Icon style={{ width: 20, height: 20 }} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* User section */}
      <div
        style={{
          padding: '12px',
          borderTop: '1px solid #e5e7eb',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
          }}
        >
          <div style={{ minWidth: 0 }}>
            {displayName && (
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#374151',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {displayName}
              </p>
            )}
            <p
              style={{
                fontSize: 12,
                color: '#9ca3af',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {email}
            </p>
          </div>
          <button
            onClick={signOut}
            title="Sign out"
            style={{
              padding: 6,
              color: '#9ca3af',
              borderRadius: 6,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <LogOut style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </div>
    </aside>
  );
}
