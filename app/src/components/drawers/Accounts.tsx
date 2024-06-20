import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { useTranslation } from "react-i18next";
import { FaChevronDown } from "react-icons/fa";

export default function Accounts() {
  const { t } = useTranslation();

  return (
    <Drawer>
      <DrawerTrigger className="flex items-center gap-1">
        <h5>TEST</h5>
        <FaChevronDown fontSize={20} />
      </DrawerTrigger>
      <DrawerContent className="p-3 flex flex-col gap-3"></DrawerContent>
    </Drawer>
  );
}
