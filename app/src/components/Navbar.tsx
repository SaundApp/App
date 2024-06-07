import { FaHome, FaHeart } from "react-icons/fa";
import { TbBrandGoogleAnalytics } from "react-icons/tb";
import { IoSearchSharp } from "react-icons/io5";

export default function Navbar() {
  return (
    <nav className="flex sticky bottom-0 items-center justify-between mt-auto bg-background p-3">
      <FaHome fontSize={25} />
      <TbBrandGoogleAnalytics fontSize={25} />
      <IoSearchSharp fontSize={25} />
      <FaHeart fontSize={25} />
      <img
        src="https://michelemanna.me/img/logo.png"
        alt="Michele Manna"
        className="w-8 h-8 rounded-full"
      />
    </nav>
  );
}
