import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import { AuthProvider } from "@/context/AuthContext"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Layout } from "@/components/layout/Layout"

import { LoginPage } from "@/pages/auth/LoginPage"
import { RegisterPage } from "@/pages/auth/RegisterPage"
import { DashboardPage } from "@/pages/DashboardPage"
import { ConfiguratorPage } from "@/pages/configurator/ConfiguratorPage"
import { ConfigurationListPage } from "@/pages/configurator/ConfigurationListPage"
import { QuotesPage } from "@/pages/quotes/QuotesPage"
import { QuoteDetailPage } from "@/pages/quotes/QuoteDetailPage"
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage"
import { AdminUsersPage } from "@/pages/admin/AdminUsersPage"
import { AdminQuotesPage } from "@/pages/admin/AdminQuotesPage"
import { AdminModelsPage } from "@/pages/admin/AdminModelsPage"
import { SettingsPage } from "@/pages/SettingsPage"

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/configurator" element={<ConfigurationListPage />} />
              <Route path="/configurator/new" element={<ConfiguratorPage />} />
              <Route path="/configurator/:id" element={<ConfiguratorPage />} />
              <Route path="/quotes" element={<QuotesPage />} />
              <Route path="/quotes/:id" element={<QuoteDetailPage />} />
              <Route path="/settings" element={<SettingsPage />} />

              {/* Admin only routes */}
              <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/quotes" element={<AdminQuotesPage />} />
                <Route path="/admin/models" element={<AdminModelsPage />} />
              </Route>
            </Route>
          </Route>

          {/* Redirect root */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
