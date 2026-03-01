import { Outlet } from "react-router-dom";
import styles from "./AppLayout.module.css";

const AppLayout = () => {
  return (
    <div className={styles.layout}>
      <Outlet />
    </div>
  );
};

export default AppLayout;
