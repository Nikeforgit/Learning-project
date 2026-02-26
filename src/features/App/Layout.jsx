import Drawer from "../UI/Drawer";
import { DrawerProvider } from "../UI/DrawerContext";

export default function Layout() {
  return (
    <DrawerProvider>
        <MainContent />
        <Drawer />
    </DrawerProvider>
  );
}