import { ArrowRightIcon } from "@radix-ui/react-icons";

export const Nav = () => {
  return (
    <nav>
      <a className="logo" href="#">
        {"/home/al # "}
        <span className="blink">_</span>
      </a>

      <ul className="nav-links">
        <li>
          <NavLink href="#about">About</NavLink>
        </li>
        <li>
          <NavLink href="#contact">Contact</NavLink>
        </li>
      </ul>
    </nav>
  );
};

const NavLink = ({ href, children }: { href: string; children: string }) => {
  return (
    <a className="nav-link" href={href}>
      <span className="dot"></span>
      <span className="text">{children}</span>
      <ArrowRightIcon className="arrow" />
    </a>
  );
};
