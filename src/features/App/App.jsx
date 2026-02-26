import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import "./App.css";
import { DrawerProvider } from "../UI/DrawerContext.jsx";
import Drawer from "../UI/Drawer.jsx";

export default function App() {
  return (
  <div className="App">
  <BrowserRouter>
  <DrawerProvider>
    <AppRoutes />
    <Drawer />
  </DrawerProvider>
  </BrowserRouter>
  </div>
  );
}


