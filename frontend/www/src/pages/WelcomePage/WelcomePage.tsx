import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./WelcomePage.module.css";
import { useNavigate } from "react-router-dom";

type Role = "employee" | "manager";

const spring = {
    type: "spring" as const,
    stiffness: 120,
    damping: 20,
};

const WelcomePage: React.FC = () => {

    const [role, setRole] = useState<Role>("employee");
    const isEmployee = role === "employee";
    const blackTitle = isEmployee ? "Руководитель" : "Сотрудник";

    const blackBtnLabel = isEmployee
        ? "Войти как руководитель"
        : "Войти как сотрудник";

    const navigate = useNavigate();

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
                            <EmployeeAuthForm onLogin={() => navigate("/team")} />
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
                            <ManagerAuthForm />
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

export default WelcomePage;

const EmployeeAuthForm: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
    return (
        <div className={styles.formWrapper}>
            <h1 className={styles.title}>Сотрудник</h1>

            <div className={styles.form}>
                <input className={styles.input} placeholder="Логин сотрудника" />
                <input className={styles.input} placeholder="Пароль" type="password" />
                <button className={styles.gradientBtn} onClick={onLogin}>
                    Войти
                </button>
            </div>
        </div>
    );
};

const ManagerAuthForm: React.FC = () => {
    return (
        <div className={styles.formWrapper}>
            <h1 className={styles.title}>Руководитель</h1>

            <div className={styles.form}>
                <input className={styles.input} placeholder="Логин сотрудника" />
                <input className={styles.input} placeholder="Пароль" type="password" />
                <button className={styles.gradientBtn}>Войти</button>
            </div>
        </div>
    );
};
