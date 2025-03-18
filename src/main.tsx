import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/layout";
import { ProtectedRoute } from "@/components/protected-route";
import "./index.css";
import AccountsPage from "./page/account/accounts-page";
import ApprovePage from "./page/approve/approve-page";
import ProfilePage from "./page/profile/profile-page";
import { Toaster } from "./components/ui/sonner";
import LoginPage from "./page/auth/login-page";
import NotFoundPage from "./page/not-found/not-found-page";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={[0]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/accounts" replace />} />
            <Route path="accounts" element={<AccountsPage />} />
            <Route path="approve" element={<ApprovePage />} />
            <Route path="profile" element={<ProfilePage />} />

            {/* 404 for non-existent admin routes */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>

        {/* Global 404 route - must be the last route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
    <Toaster position="top-center" richColors />
  </React.StrictMode>
);
