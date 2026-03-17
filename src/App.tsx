import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthGuard } from '@/components/AuthGuard';
import { LoginPage } from '@/pages/LoginPage';
import { ConversationsPage } from '@/pages/ConversationsPage';
import { ChatPage } from '@/pages/ChatPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <AuthGuard>
              <ConversationsPage />
            </AuthGuard>
          }
        />
        <Route
          path="/chat/:conversationId"
          element={
            <AuthGuard>
              <ChatPage />
            </AuthGuard>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
