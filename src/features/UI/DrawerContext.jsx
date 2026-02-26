import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";


const DrawerContext = createContext();
export function DrawerProvider({ children }) {
    const location = useLocation();
    const [width, setWidth] = useState(48);
    const [mode, setMode] = useState(null);
    useEffect(() => {
        if (location.pathname === "/search") {
            setMode("search");
            setWidth(420);
        }
    }, [location]);
    return (
        <DrawerContext.Provider value={{ width, setWidth, mode, setMode}} >
            {children}
        </DrawerContext.Provider>
    );
}

export function useDrawer() {
    return useContext(DrawerContext);
}