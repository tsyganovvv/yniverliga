import { Routes, Route } from "react-router-dom";
import AppLayout from "./components/Layouts/AppLayout";
import WelcomePage from "./pages/WelcomePage/WelcomePage";
import EmployeePage from "./pages/EmployeePage/EmployeePage";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/team" element={<EmployeePage />} />
      </Route>
    </Routes>
  );
}
