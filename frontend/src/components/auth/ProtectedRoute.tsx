import { ReactNode, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { hydrate } from '../../store/slices/authSlice';
import { AppDispatch, RootState } from '../../store';

export default function ProtectedRoute({ children, role }: { children: ReactNode; role?: 'admin' }) {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, status } = useSelector((s: RootState) => s.auth);

  useEffect(() => {
    if (token && !user) dispatch(hydrate());
  }, [token, user, dispatch]);

  if (!token) return <Navigate to="/login" replace />;

  if (token && !user) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-slate-500">
        {status === 'failed' ? 'Session expired — redirecting…' : 'Loading your account…'}
      </div>
    );
  }

  if (role === 'admin' && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // Clients must never land on admin panel
  if (!role && user?.role === 'admin' && typeof window !== 'undefined' && window.location.pathname.startsWith('/dashboard')) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
