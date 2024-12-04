import type { MeUser } from "@/types/prisma";
import { createContext, useContext } from "react";

export const SessionContext = createContext<MeUser | null>(null);
export const useSession = () => useContext(SessionContext);
