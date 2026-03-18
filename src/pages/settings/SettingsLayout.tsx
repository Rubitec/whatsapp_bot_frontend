import { NavLink, Outlet } from 'react-router-dom';

const tabs = [
  { to: '/settings', label: 'Company', end: true },
  { to: '/settings/api-keys', label: 'API Keys' },
  { to: '/settings/profile', label: 'Profile' },
];

export function SettingsLayout() {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', marginBottom: 24 }}>
        Settings
      </h1>

      {/* Tab navigation */}
      <div style={{ borderBottom: '1px solid #e5e7eb', marginBottom: 24 }}>
        <nav style={{ display: 'flex', gap: 24 }}>
          {tabs.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={({ isActive }) => ({
                paddingBottom: 12,
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
                borderBottom: `2px solid ${isActive ? '#E8546C' : 'transparent'}`,
                color: isActive ? '#E8546C' : '#6b7280',
                transition: 'all 0.15s',
              })}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      <Outlet />
    </div>
  );
}
