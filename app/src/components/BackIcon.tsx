import { useRouter } from "@tanstack/react-router";
import { FaChevronLeft } from "react-icons/fa";

export default function BackIcon() {
  const router = useRouter();

  return (
    <button className="z-50 mr-auto" onClick={() => router.history.back()}>
      <FaChevronLeft fontSize={25} />
    </button>
  );
}
