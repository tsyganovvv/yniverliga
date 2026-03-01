import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import type { UserRole } from "../../auth/session";
import styles from "./WelcomePage.module.css";

const spring = {
  type: "spring" as const,
  stiffness: 120,
  damping: 20,
};

const getLandingRoute = (role: UserRole | null) => (role === "manager" ? "/dashboard" : "/team");

const WelcomePage: React.FC = () => {
  const [role, setRole] = useState<UserRole>("employee");
  const navigate = useNavigate();
  const { login, isAuthenticated, isInitializing, role: sessionRole } = useAuth();

  useEffect(() => {
    if (!isInitializing && isAuthenticated) {
      navigate(getLandingRoute(sessionRole), { replace: true });
    }
  }, [isAuthenticated, isInitializing, navigate, sessionRole]);

  const isEmployee = role === "employee";
  const blackTitle = isEmployee ? "Руководитель" : "Сотрудник";
  const blackBtnLabel = isEmployee ? "Войти как руководитель" : "Войти как сотрудник";

  const handleLogin = async (username: string, password: string, fallbackRole: UserRole) => {
    const resolvedRole = await login(username, password, fallbackRole);
    navigate(getLandingRoute(resolvedRole), { replace: true });
  };

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.whiteWrapper}
        animate={{ left: isEmployee ? "0%" : "50%" }}
        transition={spring}
      >
        <AnimatePresence mode="wait">
          {isEmployee ? (
            <motion.div
              key="employee-form"
              className={styles.sideSingle}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
            >
              <AuthForm
                title="Сотрудник"
                usernamePlaceholder="Логин сотрудника"
                passwordPlaceholder="Пароль"
                role="employee"
                onLogin={handleLogin}
              />
            </motion.div>
          ) : (
            <motion.div
              key="manager-form"
              className={styles.sideSingle}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <AuthForm
                title="Руководитель"
                usernamePlaceholder="Логин руководителя"
                passwordPlaceholder="Пароль"
                role="manager"
                onLogin={handleLogin}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        className={styles.blackPanel}
        animate={{ left: isEmployee ? "50%" : "0%" }}
        transition={spring}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={blackTitle}
            initial={{ opacity: 0, x: isEmployee ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isEmployee ? -40 : 40 }}
            transition={{ duration: 0.3 }}
            className={styles.panelContent}
          >
            <h1 className={styles.panelTitle}>{blackTitle}</h1>

            <button
              className={styles.outlineBtn}
              onClick={() => setRole(isEmployee ? "manager" : "employee")}
            >
              {blackBtnLabel}
            </button>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

interface AuthFormProps {
  title: string;
  usernamePlaceholder: string;
  passwordPlaceholder: string;
  role: UserRole;
  onLogin: (username: string, password: string, role: UserRole) => Promise<void>;
}

const AuthForm: React.FC<AuthFormProps> = ({
  title,
  usernamePlaceholder,
  passwordPlaceholder,
  role,
  onLogin,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError("Введите логин");
      return;
    }

    if (!password) {
      setError("Введите пароль");
      return;
    }

    setIsSubmitting(true);
    try {
      await onLogin(username.trim(), password, role);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось войти");
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.formWrapper}>
      <h1 className={styles.title}>{title}</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          placeholder={usernamePlaceholder}
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
        <input
          className={styles.input}
          placeholder={passwordPlaceholder}
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {error ? <p className={styles.error}>{error}</p> : null}
        <button className={styles.gradientBtn} type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Входим..." : "Войти"}
        </button>
      </form>
    </div>
  );
};

export default WelcomePage;
