import { Navigate, Outlet } from "react-router-dom";
import { getHomePath, useAuth } from "./AuthContext";

function FullPageLoader() {
  return <div className="min-h-screen flex items-center justify-center text-gray-500">Загрузка...</div>;
}

export function RequireAuth() {
  const { isReady, isAuthenticated } = useAuth();

  if (!isReady) {
    return <FullPageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export function RedirectIfAuthorized() {
  const { isReady, isAuthenticated, session } = useAuth();

  if (!isReady) {
    return <FullPageLoader />;
  }

  if (isAuthenticated && session) {
    return <Navigate to={getHomePath(session.appRole)} replace />;
  }

  return <Outlet />;
}
