import { ArrowRightIcon } from "@radix-ui/react-icons";
import { useGlobalStore } from "../utils/store";

export const Nav = () => {
  const setNav = useGlobalStore((s) => s.setNav);

  return (
    <nav>
      <a className="logo" href="#">
        {"/home/al # "}
        <span className="blink">_</span>
      </a>

      <ul className="nav-links">
        <li>
          <NavLink onClick={() => setNav("about")}>About</NavLink>
        </li>
        <li>
          <NavLink onClick={() => setNav("contact")}>Contact</NavLink>
        </li>
      </ul>
    </nav>
  );
};

const NavLink = ({ children, onClick }: { children: string; onClick: () => void }) => {
  return (
    <button
      role="link"
      aria-label={`Scroll to the ${children} section`}
      className="nav-link"
      onClick={onClick}
    >
      <span className="dot"></span>
      <span className="text">{children}</span>
      <ArrowRightIcon className="arrow" />
    </button>
  );
};
