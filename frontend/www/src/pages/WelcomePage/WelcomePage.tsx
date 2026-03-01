import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./WelcomePage.module.css";
import { useNavigate } from "react-router-dom";
import { getHomePath, useAuth } from "../../auth/AuthContext";
import type { AppRole } from "../../auth/types";

const spring = {
  type: "spring" as const,
  stiffness: 120,
  damping: 20,
};

const WelcomePage: React.FC = () => {
  const [role, setRole] = useState<AppRole>("employee");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const isEmployee = role === "employee";
  const blackTitle = isEmployee ? "Руководитель" : "Сотрудник";

  const blackBtnLabel = isEmployee ? "Войти как руководитель" : "Войти как сотрудник";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    const cleanUsername = username.trim();
    if (!cleanUsername || !password) {
      setError("Введите логин и пароль");
      return;
    }

    setIsSubmitting(true);
    try {
      await login({
        username: cleanUsername,
        password,
        appRole: role,
      });
      navigate(getHomePath(role), { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось выполнить вход");
    } finally {
      setIsSubmitting(false);
    }
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
                username={username}
                password={password}
                error={error}
                isSubmitting={isSubmitting}
                onUsernameChange={setUsername}
                onPasswordChange={setPassword}
                onSubmit={handleSubmit}
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
                username={username}
                password={password}
                error={error}
                isSubmitting={isSubmitting}
                onUsernameChange={setUsername}
                onPasswordChange={setPassword}
                onSubmit={handleSubmit}
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
              onClick={() => {
                setRole(isEmployee ? "manager" : "employee");
                setError("");
              }}
              type="button"
            >
              {blackBtnLabel}
            </button>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default WelcomePage;

type AuthFormProps = {
  title: string;
  username: string;
  password: string;
  error: string;
  isSubmitting: boolean;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
};

const AuthForm: React.FC<AuthFormProps> = ({
  title,
  username,
  password,
  error,
  isSubmitting,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
}) => {
  return (
    <div className={styles.formWrapper}>
      <h1 className={styles.title}>{title}</h1>

      <form className={styles.form} onSubmit={onSubmit}>
        <input
          className={styles.input}
          placeholder="Логин"
          value={username}
          onChange={(event) => onUsernameChange(event.target.value)}
          autoComplete="username"
          disabled={isSubmitting}
        />
        <input
          className={styles.input}
          placeholder="Пароль"
          type="password"
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
          autoComplete="current-password"
          disabled={isSubmitting}
        />

        {error && <p className={styles.errorText}>{error}</p>}

        <button
          className={styles.gradientBtn}
          type="submit"
          disabled={isSubmitting || username.trim().length === 0 || password.length === 0}
        >
          {isSubmitting ? "Входим..." : "Войти"}
        </button>
      </form>
    </div>
  );
};
