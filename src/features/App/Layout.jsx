import { Outlet, useLocation } from "react-router-dom";
import Drawer from "../UI/Drawer.jsx";
import { DrawerProvider } from "../UI/DrawerContext.jsx";
import SideBar from "../SideBars/SideBar.jsx";

function getBarMode(pathname) {
  if (pathname.startsWith("/search")) {
    return "search";
  }
  if (pathname.startsWith("/r/")) {
    return "subreddit";
  }
  if (pathname.startsWith("/user/")) {
    return "user";
  }
  return "reddit";
}

export default function Layout() {
  const { pathname } = useLocation();
  console.log("LAYOUT:", pathname);
  const mode = getBarMode(pathname);
  console.log("LAYOUT MODE:", mode);
  return (
    <DrawerProvider>
      <div className="app-layout">
          <main className="main-content">
          <Outlet />
          </main>
          <SideBar mode={mode}/>
          </div>
          <Drawer />
    </DrawerProvider>
  );
}