import { User } from "@/types/prisma/models";
import { createContext, useContext } from "react";

export const SessionContext = createContext<User | null>(null);
export const useSession = () => useContext(SessionContext);
