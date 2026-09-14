import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import HomePage from './pages/HomePage';
import ArticlesPage from './pages/ArticlesPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import SupplementsPage from './pages/SupplementsPage';
import SupplementDetailPage from './pages/SupplementDetailPage';
import ComparePage from './pages/ComparePage';
import { ConditionsPage, ConditionDetailPage } from './pages/ConditionsPage';
import { AuthorsPage, AuthorDetailPage } from './pages/AuthorsPage';
import { AboutPage, ContactPage, MedicalDisclaimerPage, NotFoundPage, PrivacyPolicyPage, TermsPage, EditorialPolicyPage, FaqPage } from './pages/LegalPage';

// Admin CMS Components
import AdminLayout from './admin/AdminLayout';
import AdminLoginPage from './admin/AdminLoginPage';
import AdminDashboardPage from './admin/AdminDashboardPage';
import AdminArticlesPage from './admin/AdminArticlesPage';
import AdminArticleEditorPage from './admin/AdminArticleEditorPage';
import AdminProductsPage from './admin/AdminProductsPage';
import AdminProductEditorPage from './admin/AdminProductEditorPage';
import AdminMediaPage from './admin/AdminMediaPage';
import AdminAIPage from './admin/AdminAIPage';
import AdminApiKeysPage from './admin/AdminApiKeysPage';
import AdminSettingsPage from './admin/AdminSettingsPage';
import { SiteProvider } from './context/SiteContext';

export default function App() {
  return (
    <SiteProvider>
      <Routes>
        {/* Public Medical Publishing Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="articles" element={<ArticlesPage />} />
          <Route path="articles/:slug" element={<ArticleDetailPage />} />
          <Route path="supplements" element={<SupplementsPage />} />
          <Route path="supplements/:slug" element={<SupplementDetailPage />} />
          <Route path="supplements/compare" element={<ComparePage />} />
          <Route path="health" element={<ConditionsPage />} />
          <Route path="health/:slug" element={<ConditionDetailPage />} />
          <Route path="authors" element={<AuthorsPage />} />
          <Route path="authors/:slug" element={<AuthorDetailPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="medical-disclaimer" element={<MedicalDisclaimerPage />} />
          <Route path="editorial-policy" element={<EditorialPolicyPage />} />
          <Route path="privacy" element={<PrivacyPolicyPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="faq" element={<FaqPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Admin CMS Authentication */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Admin CMS Portal Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="articles" element={<AdminArticlesPage />} />
          <Route path="articles/new" element={<AdminArticleEditorPage />} />
          <Route path="articles/:id/edit" element={<AdminArticleEditorPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="products/new" element={<AdminProductEditorPage />} />
          <Route path="products/:id/edit" element={<AdminProductEditorPage />} />
          <Route path="media" element={<AdminMediaPage />} />
          <Route path="ai" element={<AdminAIPage />} />
          <Route path="api-keys" element={<AdminApiKeysPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
      </Routes>
    </SiteProvider>
  );
}
