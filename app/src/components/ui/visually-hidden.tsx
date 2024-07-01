import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import type { ReactNode } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export default ({ children }: { children: ReactNode }) => (
  <VisuallyHidden.Root>{children}</VisuallyHidden.Root>
);
