import { Routes, Route } from "react-router-dom";
import AppLayout from "./components/Layouts/AppLayout";
import WelcomePage from "./pages/WelcomePage/WelcomePage";
import EmployeePage from "./pages/EmployeePage/EmployeePage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import EmployeeDetailPage from "./pages/EmployeeDetailPage/EmployeeDetailPage";
import NotificationsPage from "./pages/NotificationsPage/NotificationsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/team" element={<EmployeePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/employee/:employeeId" element={<EmployeeDetailPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>
    </Routes>
  );
}
