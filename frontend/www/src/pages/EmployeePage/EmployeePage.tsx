import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import styles from "./EmployeePage.module.css";
import FeedbackForm from "../../components/FeedbackForm/FeedbackForm";

const EmployeePage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const userRole = localStorage.getItem("userRole");
  const isManager = userRole === "manager";

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Команда филиала</h1>

        <div className={styles.buttons}>
          <button className={styles.outline} onClick={handleLogout}>
            Выйти
          </button>
          {isManager && (
            <button className={styles.outline} onClick={() => navigate("/dashboard")}>
              К статистике
            </button>
          )}
          {!isManager && (
            <div className={styles.userActions}>
              <button
                className={styles.iconButton}
                onClick={() => navigate("/notifications")}
                title="Уведомления"
              >
                <Bell className={styles.icon} />
              </button>
              <button
                className={styles.profileButton}
                onClick={() => navigate("/profile")}
                title="Профиль"
              >
                <img
                  src="https://picsum.photos/seed/profile/100/100"
                  alt="Profile"
                  className={styles.profileImage}
                />
              </button>
            </div>
          )}
        </div>
      </header>

      <div className={styles.content}>
        <FeedbackForm />
      </div>
    </div>
  );
};

export default EmployeePage;
