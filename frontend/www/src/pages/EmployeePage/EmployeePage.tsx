import { useNavigate } from "react-router-dom";
import styles from "./EmployeePage.module.css";
import FeedbackForm from "../../components/FeedbackForm/FeedbackForm";
import { useAuth } from "../../auth/AuthContext";

const EmployeePage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Команда филиала</h1>

        <div className={styles.buttons}>
          <button className={styles.outline}>Выбрать команду</button>
          <button className={styles.outline}>Выбрать сотрудника</button>
          <button className={styles.outline} onClick={() => navigate('/dashboard')}>
            К статистике
          </button>
          <button className={styles.outline} onClick={handleLogout}>
            Выйти
          </button>
        </div>
      </header>

      <div className={styles.content}>
        <FeedbackForm />
      </div>
    </div>
  );
};

export default EmployeePage;
