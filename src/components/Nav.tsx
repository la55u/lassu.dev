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
      <span className="arrow">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="none"
          viewBox="0 0 16 16"
        >
          <path
            stroke="#fff"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M2.343 8h11.314m0 0L8.673 3.016M13.657 8l-4.984 4.984"
          ></path>
        </svg>
      </span>
    </a>
  );
};
