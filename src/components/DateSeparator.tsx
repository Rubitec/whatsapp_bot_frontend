export function DateSeparator({ date }: { date: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px 0',
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: '#6b7280',
          backgroundColor: '#f3f4f6',
          padding: '4px 12px',
          borderRadius: 9999,
        }}
      >
        {date}
      </span>
    </div>
  );
}
