import { NavLink } from "react-router-dom";
import Styles from "./PageNav.module.css";
import Logo from "./Logo";

function PageNav() {
  return (
    <nav className={Styles.nav}>
      <Logo />

      <ul>
        <li>
          <NavLink to="/Pricing">Pricing</NavLink>
        </li>
        <li>
          <NavLink to="/Product">Product</NavLink>
        </li>
        <li>
          <NavLink to="/login" className={Styles.ctaLink}>
            Login
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default PageNav;
