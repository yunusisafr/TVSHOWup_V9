import React, { useEffect } from 'react';
import Cookies from 'js-cookie';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AdminProvider } from './contexts/AdminContext';
import { AuthPromptProvider } from './contexts/AuthPromptContext';
import { UserPreferencesProvider } from './contexts/UserPreferencesContext';
import { isAdminRoute, getLanguageFromPath, isRTLLanguage, detectBrowserLanguage } from './lib/utils';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import ContentDetailPage from './pages/ContentDetailPage';
import WatchlistPage from './pages/WatchlistPage';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';
import ShareListPage from './pages/ShareListPage';
import PublicWatchlistPage from './pages/PublicWatchlistPage';
import StaticPage from './pages/StaticPage';
import PersonDetailPage from './pages/PersonDetailPage';
import MyListsPage from './pages/MyListsPage';
import UserPublicShareListsPage from './pages/UserPublicShareListsPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminRoute from './components/AdminRoute';
import DiscoverListsPage from './pages/DiscoverListsPage';
import ScrollToTop from './components/ScrollToTop';
import AuthPromptModal from './components/AuthPromptModal';
import CookieConsentBanner from './components/CookieConsentBanner';
import LanguageRouter from './components/LanguageRouter';
import SEOWrapper from './components/SEOWrapper';
import AdminSidebar from './components/AdminSidebar';
import TranslationSync from './pages/admin/TranslationSync';
import Dashboard from './pages/admin/Dashboard';
import StaticPages from './pages/admin/StaticPages';
import AdminLogin from './pages/admin/AdminLogin';
import UserManagement from './pages/admin/UserManagement';

function RootRedirect() {
  // Get language from cookies immediately, no loading needed
  const savedLanguage = Cookies.get('user_language');
  const targetLanguage = savedLanguage || detectBrowserLanguage();

  console.log(`🏠 Root redirect: redirecting to /${targetLanguage}`);
  return <Navigate to={`/${targetLanguage}`} replace />;
}

function LegacyRouteRedirect() {
  const location = useLocation();

  // Get language from cookies immediately, no loading needed
  const savedLanguage = Cookies.get('user_language');
  const targetLanguage = savedLanguage || detectBrowserLanguage();

  const newPath = `/${targetLanguage}${location.pathname}${location.search}${location.hash}`;
  console.log(`🔄 Legacy route redirect: ${location.pathname} -> ${newPath}`);
  return <Navigate to={newPath} replace />;
}

function ResetPasswordRedirect() {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const queryString = searchParams.toString();
  const hash = window.location.hash;

  const redirectPath = `/reset-password${queryString ? `?${queryString}` : ''}${hash}`;

  console.log('🔑 Reset Password - No Language Redirect');
  console.log('   - Current path:', location.pathname);
  console.log('   - Query params:', queryString || 'none');
  console.log('   - Hash params:', hash || 'none');
  console.log('   - Keeping path without language:', redirectPath);

  return <Navigate to={redirectPath} replace />;
}

function RecoveryFlowRedirect() {
  const location = useLocation();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const hashParams = new URLSearchParams(hash.substring(1));
      const type = hashParams.get('type');
      const accessToken = hashParams.get('access_token');

      if (type === 'recovery' && accessToken) {
        const currentPath = location.pathname;
        const isAlreadyOnResetPage = currentPath.includes('/reset-password');

        console.log('🔐 Recovery Flow Handler (No Language Code)');
        console.log('   - Current path:', currentPath);
        console.log('   - Access token present:', !!accessToken);

        if (!isAlreadyOnResetPage) {
          const redirectPath = `/reset-password${hash}`;
          console.log('   - Redirecting to:', redirectPath);
          window.location.href = redirectPath;
        } else {
          console.log('   - Already on correct page, no redirect needed');
        }
      }
    }
  }, [location.pathname]);

  return null;
}

function RTLWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  useEffect(() => {
    const lang = getLanguageFromPath(location.pathname);
    const isRTL = lang && isRTLLanguage(lang);

    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang || 'en');
  }, [location.pathname]);

  return <>{children}</>;
}

function AppRoutes() {
  const isAdmin = isAdminRoute();

  console.log('🔍 Admin route check:', {
    isAdmin,
    hostname: window.location.hostname,
    pathname: window.location.pathname,
  });

  return (
    <>
      <RecoveryFlowRedirect />
      <ScrollToTop />
      <SEOWrapper />

      {/* ADMIN ROUTES */}
      {isAdmin ? (
        <Routes>
          <Route path="/login" element={<AdminLogin />} />
          <Route path="*" element={
            <div className="flex min-h-screen bg-gray-900">
              <AdminSidebar />
              <main className="flex-1">
                <Routes>
                  <Route path="/admin" element={<AdminRoute><Dashboard /></AdminRoute>} />
                  <Route path="/" element={<AdminRoute><Dashboard /></AdminRoute>} />
                  <Route path="/admin/translations" element={<AdminRoute><TranslationSync /></AdminRoute>} />
                  <Route path="/translations" element={<AdminRoute><TranslationSync /></AdminRoute>} />
                  <Route path="/admin/pages" element={<AdminRoute><StaticPages /></AdminRoute>} />
                  <Route path="/pages" element={<AdminRoute><StaticPages /></AdminRoute>} />
                  <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
                  <Route path="/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
                  <Route path="*" element={<Navigate to="/admin" replace />} />
                </Routes>
              </main>
            </div>
          } />
        </Routes>
      ) : (
        <div className="min-h-screen bg-gray-900">
          <LanguageRouter>
            <Header />
            <main className="relative pt-[120px] md:pt-16">
                        <Routes>
                          {/* Block /admin routes on main domain - redirect to admin subdomain */}
                          <Route path="/admin/*" element={<Navigate to="https://admin.tvshowup.com" replace />} />

                          {/* Language-aware Public Routes */}
                          <Route path="/:lang" element={<HomePage />} />
                          <Route path="/:lang/search" element={<SearchPage />} />
                          <Route path="/:lang/movie/:id" element={<ContentDetailPage contentType="movie" />} />
                          <Route path="/:lang/tv_show/:id" element={<ContentDetailPage contentType="tv_show" />} />
                          <Route path="/:lang/movie/:id/:slug" element={<ContentDetailPage contentType="movie" />} />
                          <Route path="/:lang/tv_show/:id/:slug" element={<ContentDetailPage contentType="tv_show" />} />
                          <Route path="/:lang/watchlist" element={<WatchlistPage />} />
                          <Route path="/:lang/login" element={<LoginPage />} />
                          <Route path="/:lang/settings" element={<SettingsPage />} />
                          <Route path="/:lang/person/:id" element={<PersonDetailPage />} />
                          <Route path="/:lang/person/:id/:slug" element={<PersonDetailPage />} />
                          <Route path="/:lang/share/:listId" element={<ShareListPage />} />
                          <Route path="/:lang/public-watchlist/:listId" element={<PublicWatchlistPage />} />
                          <Route path="/:lang/my-lists" element={<MyListsPage />} />
                          <Route path="/:lang/pages/:slug" element={<StaticPage />} />
                          <Route path="/:lang/discover-lists" element={<DiscoverListsPage />} />
                          <Route path="/:lang/u/:username/mylist" element={<PublicWatchlistPage />} />
                          <Route path="/:lang/u/:username/my-suggestion-lists" element={<UserPublicShareListsPage />} />

                          {/* Reset password route - NO language code */}
                          <Route path="/reset-password" element={<ResetPasswordPage />} />

                          {/* Legacy routes without language prefix - redirect to user's browser language */}
                          <Route path="/" element={<RootRedirect />} />
                          <Route path="/search" element={<LegacyRouteRedirect />} />
                          <Route path="/movie/:id" element={<LegacyRouteRedirect />} />
                          <Route path="/tv_show/:id" element={<LegacyRouteRedirect />} />
                          <Route path="/movie/:id/:slug" element={<LegacyRouteRedirect />} />
                          <Route path="/tv_show/:id/:slug" element={<LegacyRouteRedirect />} />
                          <Route path="/watchlist" element={<LegacyRouteRedirect />} />
                          <Route path="/login" element={<LegacyRouteRedirect />} />
                          <Route path="/settings" element={<LegacyRouteRedirect />} />
                          <Route path="/person/:id" element={<LegacyRouteRedirect />} />
                          <Route path="/person/:id/:slug" element={<LegacyRouteRedirect />} />
                          <Route path="/share/:listId" element={<LegacyRouteRedirect />} />
                          <Route path="/public-watchlist/:listId" element={<LegacyRouteRedirect />} />
                          <Route path="/my-lists" element={<LegacyRouteRedirect />} />
                          <Route path="/pages/:slug" element={<LegacyRouteRedirect />} />
                          <Route path="/discover-lists" element={<LegacyRouteRedirect />} />
                          <Route path="/u/:username/mylist" element={<LegacyRouteRedirect />} />
                          <Route path="/u/:username/my-suggestion-lists" element={<LegacyRouteRedirect />} />
                        </Routes>
                      </main>
                      <Footer />
                    </LanguageRouter>
          <AuthPromptModal />
          <CookieConsentBanner />
        </div>
      )}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <Router>
          <UserPreferencesProvider>
            <AuthPromptProvider>
              <RTLWrapper>
                <AppRoutes />
              </RTLWrapper>
            </AuthPromptProvider>
          </UserPreferencesProvider>
        </Router>
      </AdminProvider>
    </AuthProvider>
  );
}

export default App;