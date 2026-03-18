import { SkeletonBlock } from '@/components/SkeletonBlock';

export function StatCardSkeleton() {
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
        <SkeletonBlock width={36} height={36} />
        <SkeletonBlock width={100} height={16} />
      </div>
      <SkeletonBlock width={80} height={36} />
    </div>
  );
}
