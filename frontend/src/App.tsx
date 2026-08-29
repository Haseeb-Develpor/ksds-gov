import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Layout from './components/layout/Layout';
import ScrollToTop from './components/common/ScrollToTop';
import IntroSplash from './components/common/IntroSplash';
import CookieConsent from './components/common/CookieConsent';
import ProtectedRoute from './components/auth/ProtectedRoute';

import Home from './pages/Home';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import ContentPage from './pages/ContentPage';
import ModuleHub from './pages/ModuleHub';
import ModuleDetail from './pages/ModuleDetail';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import Contact from './pages/Contact';
import Jobs from './pages/Jobs';
import JobsIndex from './pages/JobsIndex';
import KhadmenHaram from './pages/KhadmenHaram';
import NotFound from './pages/NotFound';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import OtpLogin from './pages/auth/OtpLogin';
import ForgotPassword from './pages/auth/ForgotPassword';

import UserDashboard from './pages/dashboard/UserDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import DashboardSection from './pages/dashboard/DashboardSection';
import Profile from './pages/dashboard/Profile';
import AdminUsers from './pages/dashboard/AdminUsers';
import Documents from './pages/dashboard/Documents';
import Applications from './pages/dashboard/Applications';
import Notifications from './pages/dashboard/Notifications';
import AdminApplications from './pages/dashboard/AdminApplications';
import AdminMail from './pages/dashboard/AdminMail';

import { contentPages } from './data/content';
import { visaPages, trainingPages } from './data/content';
import { userNav, adminNav } from './data/dashboardNav';
import { hydrate } from './store/slices/authSlice';
import { RootState, AppDispatch } from './store';

const wrap = (el: JSX.Element) => <Layout>{el}</Layout>;

export default function App() {
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((s: RootState) => s.auth.token);

  useEffect(() => { if (token) dispatch(hydrate()); }, [token, dispatch]);

  return (
    <>
      <IntroSplash />
      <CookieConsent />
      <ScrollToTop />
      <Routes>
        {/* Public */}
        <Route path="/" element={wrap(<Home />)} />
        <Route path="/services" element={wrap(<Services />)} />
        <Route path="/services/:slug" element={wrap(<ServiceDetail />)} />
        <Route path="/news" element={wrap(<News />)} />
        <Route path="/news/:slug" element={wrap(<NewsDetail />)} />
        <Route path="/contact" element={wrap(<Contact />)} />
        <Route path="/jobs" element={wrap(<JobsIndex />)} />
        <Route path="/jobs/:slug" element={wrap(<Jobs />)} />
        <Route path="/khadmen-haram" element={wrap(<KhadmenHaram />)} />

        {/* Data-driven content pages (~32) */}
        {contentPages.map((p) => (
          <Route key={p.slug} path={`/${p.slug}`} element={wrap(<ContentPage slug={p.slug} />)} />
        ))}

        {/* Module hubs + details */}
        <Route path="/visa" element={wrap(<ModuleHub title="Visa Services" base="/visa" image="https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1400&q=70" intro="Fast, transparent visa processing for every category." pages={visaPages} />)} />
        <Route path="/visa/:slug" element={wrap(<ModuleDetail title="Visa Services" base="/visa" pages={visaPages} />)} />
        <Route path="/training" element={wrap(<ModuleHub title="Training & Development" base="/training" image="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1400&q=70" intro="World-class training and certification programs." pages={trainingPages} />)} />
        <Route path="/training/:slug" element={wrap(<ModuleDetail title="Training & Development" base="/training" pages={trainingPages} />)} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/otp-login" element={<OtpLogin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* User dashboard */}
        <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/dashboard/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
        <Route path="/dashboard/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
        <Route path="/dashboard/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        {userNav.filter((n) => !['/dashboard', '/dashboard/profile', '/dashboard/documents', '/dashboard/applications', '/dashboard/notifications'].includes(n.to)).map((n) => (
          <Route key={n.to} path={n.to} element={<ProtectedRoute><DashboardSection items={userNav} panelTitle="My Dashboard" label={n.label} /></ProtectedRoute>} />
        ))}

        {/* Admin dashboard */}
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/applications" element={<ProtectedRoute role="admin"><AdminApplications /></ProtectedRoute>} />
        <Route path="/admin/messages" element={<ProtectedRoute role="admin"><AdminMail /></ProtectedRoute>} />
        {adminNav.filter((n) => !['/admin', '/admin/users', '/admin/applications', '/admin/messages'].includes(n.to)).map((n) => (
          <Route key={n.to} path={n.to} element={<ProtectedRoute role="admin"><DashboardSection items={adminNav} panelTitle="Admin Panel" label={n.label} /></ProtectedRoute>} />
        ))}

        <Route path="*" element={wrap(<NotFound />)} />
      </Routes>
    </>
  );
}
