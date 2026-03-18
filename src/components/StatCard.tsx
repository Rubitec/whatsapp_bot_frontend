interface StatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string | number;
}

export function StatCard({ icon, iconBg, label, value }: StatCardProps) {
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 12,
        border: '1px solid #e5e7eb',
        padding: 20,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div
          style={{
            padding: 8,
            borderRadius: 8,
            backgroundColor: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </div>
        <span style={{ fontSize: 14, fontWeight: 500, color: '#6b7280' }}>{label}</span>
      </div>
      <p style={{ fontSize: 30, fontWeight: 600, color: '#111827' }}>{value}</p>
    </div>
  );
}
