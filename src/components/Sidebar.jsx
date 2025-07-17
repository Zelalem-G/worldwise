import { Outlet } from "react-router-dom";
import AppNav from "./AppNav";
import Logo from "./Logo";
import style from "./Sidebar.module.css";

function Sidebar() {
  return (
    <div className={style.sidebar}>
      <Logo />
      <AppNav />

      <Outlet />

      <footer className={style.footer}>
        <p className={style.copyright}>
          &copy; copyright {new Date().getFullYear()} by Worldwise Inc.
        </p>
      </footer>
    </div>
  );
}

export default Sidebar;
