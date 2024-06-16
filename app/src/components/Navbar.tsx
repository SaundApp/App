import { Link } from "@tanstack/react-router";
import { FaHeart, FaHome, FaSearch } from "react-icons/fa";
import { SiGoogleanalytics } from "react-icons/si";
import { useSession } from "./SessionContext";
import Avatar from "./account/Avatar";

export default function Navbar() {
  const session = useSession();
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
      {session && (
        <Link to="/account/me">
          <Avatar user={session} width={32} height={32} />
        </Link>
      )}
    </nav>
  );
}
