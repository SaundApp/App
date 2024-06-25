import type { MeUser } from "@/types/prisma";
import { createContext, useContext } from "react";

export const SessionContext = createContext<MeUser | null>(null);
// eslint-disable-next-line react-refresh/only-export-components
export const useSession = () => useContext(SessionContext);
