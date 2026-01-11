export const Nav = () => {
  return (
    <nav>
      <a className="logo" href="#">
        {"➜ lassu.dev git:(main) "}
        <span className="blink">_</span>
      </a>

      <div className="nav-links">
        <a
          className="logo"
          href="https://www.linkedin.com/in/la55u/"
          target="_blank"
          rel="noreferrer"
        >
          {"linkedin"}
        </a>
        <a
          className="logo"
          href="https://github.com/la55u"
          target="_blank"
          rel="noreferrer"
        >
          {"github"}
        </a>
      </div>
    </nav>
  );
};
