import { BrowserRouter, useLocation } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import "./App.css";
import Search from "../../functions/Filter/search.js";
import SearchOverlay from "../../functions/Filter/SearchOverlay.jsx";

function Layout() {
  const location = useLocation();
  const isSearchPage = location.pathname === "/search";
  return (
    <>
    <Search />
    <AppRoutes />
    {isSearchPage && <SearchOverlay />}
    </>
  );
}

export default function App() {
  return (
  <div className="App">
  <BrowserRouter>
    <Layout />
  </BrowserRouter>
  </div>
  );
}


