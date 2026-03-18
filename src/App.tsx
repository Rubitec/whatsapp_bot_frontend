import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { AuthGuard } from '@/components/AuthGuard';
import { DashboardLayout } from '@/components/DashboardLayout';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { OverviewPage } from '@/pages/OverviewPage';
import { ConversationsPage } from '@/pages/ConversationsPage';
import { ChatPage } from '@/pages/ChatPage';
import { ContactsPage } from '@/pages/ContactsPage';
import { SettingsLayout } from '@/pages/settings/SettingsLayout';
import { CompanySettingsPage } from '@/pages/settings/CompanySettingsPage';
import { ApiKeysPage } from '@/pages/settings/ApiKeysPage';
import { ProfileSettingsPage } from '@/pages/settings/ProfileSettingsPage';
import { TeamPage } from '@/pages/settings/TeamPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route
            element={
              <AuthGuard>
                <DashboardLayout />
              </AuthGuard>
            }
          >
            <Route index element={<OverviewPage />} />
            <Route path="conversations" element={<ConversationsPage />} />
            <Route path="conversations/:conversationId" element={<ChatPage />} />
            <Route path="contacts" element={<ContactsPage />} />
            <Route path="settings" element={<SettingsLayout />}>
              <Route index element={<CompanySettingsPage />} />
              <Route path="team" element={<TeamPage />} />
              <Route path="api-keys" element={<ApiKeysPage />} />
              <Route path="profile" element={<ProfileSettingsPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
