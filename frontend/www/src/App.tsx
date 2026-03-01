import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/Layouts/AppLayout";
import WelcomePage from "./pages/WelcomePage/WelcomePage";
import EmployeePage from "./pages/EmployeePage/EmployeePage";
import DashboardPage from "./pages/DashboardPage";
import { RedirectIfAuthorized, RequireAuth } from "./auth/routeGuards";

export default function App() {
  return (
    <Routes>
      <Route element={<RedirectIfAuthorized />}>
        <Route path="/" element={<WelcomePage />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/team" element={<EmployeePage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
