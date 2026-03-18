import { SkeletonBlock } from '@/components/SkeletonBlock';

export function ConversationRowSkeleton() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px' }}>
      <div style={{ flex: 1 }}>
        <SkeletonBlock width={140} height={14} />
        <div style={{ marginTop: 6 }}>
          <SkeletonBlock width={200} height={12} />
        </div>
      </div>
      <div style={{ marginLeft: 16, textAlign: 'right' }}>
        <SkeletonBlock width={50} height={12} />
        <div style={{ marginTop: 6 }}>
          <SkeletonBlock width={40} height={12} />
        </div>
      </div>
    </div>
  );
}
