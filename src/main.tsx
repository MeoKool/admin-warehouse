import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/layout";
import "./index.css";
import AccountsPage from "./page/account/accounts-page";
import ApprovePage from "./page/approve/approve-page";
import UpgradePage from "./page/upgrage/upgrade-page";
import ProfilePage from "./page/profile/profile-page";
import { Toaster } from "./components/ui/sonner";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/accounts" replace />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/accounts" replace />} />
          <Route path="accounts" element={<AccountsPage />} />
          <Route path="approve" element={<ApprovePage />} />
          <Route path="upgrade" element={<UpgradePage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
    <Toaster position="top-right" />
  </React.StrictMode>
);
