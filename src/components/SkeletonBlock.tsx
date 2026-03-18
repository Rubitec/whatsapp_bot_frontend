export function SkeletonBlock({ width, height }: { width: string | number; height: number }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 6,
        backgroundColor: '#f3f4f6',
        animation: 'pulse 1.5s ease-in-out infinite',
      }}
    />
  );
}
