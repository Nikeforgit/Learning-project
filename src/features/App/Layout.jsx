import Drawer from "../UI/Drawer.jsx";
import { DrawerProvider } from "../UI/DrawerContext.jsx";

export default function Layout() {
  return (
    <DrawerProvider>
        <MainContent />
        <Drawer />
    </DrawerProvider>
  );
}