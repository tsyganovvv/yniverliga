import React from "react";
import { Outlet, Link } from "react-router-dom";

export default function MainLayout() {
  return (
    <>
      <nav>
        <Link to="/" style={{ marginRight: "15px" }}>Home</Link>
      </nav>

      <Outlet />

      <footer>
        <div>
          <p>© 2025 REACT. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}