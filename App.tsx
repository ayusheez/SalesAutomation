import React from "react";
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  BrowserRouter,
} from "react-router-dom";
import { Layout } from "./components/Layout/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Prospecting } from "./pages/Prospecting";
import { DataEnrichment } from "./pages/DataEnrichment";
import { EmailSequences } from "./pages/EmailSequences";
import { EmailInbox } from "./pages/EmailInbox";
import { LinkedInOutreach } from "./pages/LinkedInOutreach";
import { DealsKanban } from "./pages/DealsKanban";
import { ContentGenerator } from "./pages/ContentGenerator";
import { ContentSchedule } from "./pages/ContentSchedule";
import { Meetings } from "./pages/Meetings";
import { GlobalAnalytics } from "./pages/GlobalAnalytics";
import { Settings } from "./pages/Settings";
import { Login } from "./pages/Login";
import { ToastProvider } from "./components/ui/Toast";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              {/* Home */}
              <Route
                element={
                  <Layout>
                    <Dashboard />
                  </Layout>
                }
                path="/"
              />

              {/* Prospect */}
              <Route
                element={
                  <Layout>
                    <Prospecting initialView="people" />
                  </Layout>
                }
                path="/prospect/people"
              />
              <Route
                element={
                  <Layout>
                    <Prospecting initialView="companies" />
                  </Layout>
                }
                path="/prospect/companies"
              />
              <Route
                element={
                  <Layout>
                    <Prospecting initialView="saved" />
                  </Layout>
                }
                path="/prospect/saved"
              />
              <Route
                element={
                  <Layout>
                    <DataEnrichment />
                  </Layout>
                }
                path="/prospect/enrichment"
              />

              {/* Email Outreach */}
              <Route
                element={
                  <Layout>
                    <EmailSequences initialTab="workflow" />
                  </Layout>
                }
                path="/email/sequence"
              />
              <Route
                element={
                  <Layout>
                    <EmailInbox />
                  </Layout>
                }
                path="/email/inbox"
              />
              <Route
                element={
                  <Layout>
                    <EmailSequences initialTab="analytics" />
                  </Layout>
                }
                path="/email/analytics"
              />

              {/* LinkedIn Outreach */}
              <Route
                element={
                  <Layout>
                    <LinkedInOutreach initialView="find" />
                  </Layout>
                }
                path="/linkedin/find"
              />
              <Route
                element={
                  <Layout>
                    <LinkedInOutreach initialView="builder" />
                  </Layout>
                }
                path="/linkedin/sequence"
              />
              <Route
                element={
                  <Layout>
                    <LinkedInOutreach initialView="analytics" />
                  </Layout>
                }
                path="/linkedin/analytics"
              />

              {/* Meetings */}
              <Route
                element={
                  <Layout>
                    <Meetings />
                  </Layout>
                }
                path="/meetings/calendar"
              />
              <Route
                element={
                  <Layout>
                    <DealsKanban />
                  </Layout>
                }
                path="/meetings/deals"
              />

              {/* Content */}
              <Route
                element={
                  <Layout>
                    <ContentGenerator />
                  </Layout>
                }
                path="/content/generate"
              />
              <Route
                element={
                  <Layout>
                    <ContentSchedule />
                  </Layout>
                }
                path="/content/schedule"
              />

              {/* Analytics */}
              <Route
                element={
                  <Layout>
                    <GlobalAnalytics />
                  </Layout>
                }
                path="/analytics"
              />

              {/* Settings */}
              <Route
                element={
                  <Layout>
                    <Settings />
                  </Layout>
                }
                path="/settings"
              />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
