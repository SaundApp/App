import { Link } from "@tanstack/react-router";
import { FaHeart, FaHome, FaSearch } from "react-icons/fa";
import { SiGoogleanalytics } from "react-icons/si";

export default function Navbar() {
  return (
    <nav
      className="flex fixed bottom-0 items-center justify-between mt-auto bg-background p-3"
      style={{
        width: "calc(100vw - 1.5rem)",
      }}
    >
      <Link to="/">
        <FaHome fontSize={25} />
      </Link>
      <Link to="/leaderboard/artists">
        <SiGoogleanalytics fontSize={25} />
      </Link>
      <Link to="/search">
        <FaSearch fontSize={25} />
      </Link>
      <Link to="/notifications">
        <FaHeart fontSize={25} />
      </Link>
      <Link to="/account/me">
        <img
          src="https://michelemanna.me/img/logo.png"
          alt="Michele Manna"
          className="w-8 h-8 rounded-full"
        />
      </Link>
    </nav>
  );
}
