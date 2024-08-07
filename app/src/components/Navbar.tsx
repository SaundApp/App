import { Link } from "@tanstack/react-router";
import { FaHeart, FaHome, FaSearch } from "react-icons/fa";
import { SiGoogleanalytics } from "react-icons/si";
import { useSession } from "./SessionContext";
import Avatar from "./account/Avatar";
import { Capacitor } from "@capacitor/core";
import { useEffect, useState } from "react";
import { Keyboard } from "@saundapp/keyboard";

export default function Navbar() {
  const session = useSession();
  const [keyboard, setKeyboard] = useState(false);

  useEffect(() => {
    Keyboard.addListener("keyboardWillShow", () => setKeyboard(true));
    Keyboard.addListener("keyboardWillHide", () => setKeyboard(false));
  }, []);

  if (keyboard) return null;

  return (
    <nav
      className={
        "fixed bottom-0 mt-auto flex items-center justify-between bg-background p-3" +
        (Capacitor.getPlatform() === "ios" ? " pb-8" : "")
      }
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
        <Link to={`/account/${session.username}`}>
          <Avatar user={session} width={32} height={32} />
        </Link>
      )}
    </nav>
  );
}
