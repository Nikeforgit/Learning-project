import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";


const DrawerContext = createContext();
export function DrawerProvider({ children }) {
    const location = useLocation();
    const [width, setWidth] = useState(48);
    const [mode, setMode] = useState(null);
    const [drawerType, setDrawerType] = useState(null);
    const openDrawer = (type) => {
        setDrawerType(type);
    };
    const closeDrawer = () => {
        setDrawerType(null);
    }
    useEffect(() => {
        if (location.pathname === "/search") {
            setMode("search");
            setWidth(420);
        } else {
            setMode(null);
            setWidth(48);
        }
    }, [location.pathname]);
    return (
        <DrawerContext.Provider value={{ width, setWidth, mode, setMode, drawerType, openDrawer, closeDrawer}} >
            {children}
        </DrawerContext.Provider>
    );
}

export function useDrawer() {
    return useContext(DrawerContext);
}