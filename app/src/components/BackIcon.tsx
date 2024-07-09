import { cn } from "@/lib/utils";
import { useRouter } from "@tanstack/react-router";
import type { ClassValue } from "clsx";
import { FaChevronLeft } from "react-icons/fa";

export default function BackIcon({ className }: { className?: ClassValue }) {
  const router = useRouter();

  return (
    <button
      className={cn("z-50 mr-auto", className)}
      onClick={() => router.history.back()}
    >
      <FaChevronLeft fontSize={25} />
    </button>
  );
}
