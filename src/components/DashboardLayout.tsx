import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';

export function DashboardLayout() {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar />
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          backgroundColor: '#f9fafb',
          minWidth: 0,
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
