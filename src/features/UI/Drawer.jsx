
import { useDrawer } from "./DrawerContext";
import { useRef, useState } from  "react";
import DrawerSearch from "./DrawerSearch";

export default function Drawer() {
    const {width, setWidth, mode } = useDrawer();
    const [isHovering, setIsHovering] = useState(false);
    const startX = useRef(null);
    const SNAP_POINTS = [48, 380, 600];
    const getNearestSnap = (value) => {
        return SNAP_POINTS.reduce((prev, curr) => 
          Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
        );
    };
    const onPointerDown = (e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        startX.current = e.clientX;
    };
    const onPointerMove = (e) => {
        if (startX.current === null) return;
        const delta = e.clientX - startX.current;
        const newWidth = Math.min(Math.max(48, width + delta), 600);
        setWidth(newWidth);
        startX.current = e.clientX;
    };
    const onPointerUp = (e) => {
        if (startX.current !== null) {
            const snapped = getNearestSnap(Math.min(Math.max(48, width), 600));
            setWidth(snapped);
            e.currentTarget.releasePointerCapture(e.pointerId);
        }
        startX.current = null;
    };
    return (
        <div 
        style={{
    position: "fixed",
    top: 0,
    left: 0,
    width: width,
    height: "100vh",
    background: "white",
    boxShadow: "4px 0 10px rgba(0,0,0,0.2)",
    transition: startX.current ? "none" : "width 0.25s ease",
    zIndex: 1000,
    overflow: "hidden"
}}>
    <div
    onPointerDown={onPointerDown}
    onPointerMove={onPointerMove}
    onPointerUp={onPointerUp}
    onMouseEnter={() => setIsHovering(true)}
    onMouseLeave={() => setIsHovering(false)}
    style={{
        position: "absolute",
        right: 0,
        top: 0,
        width: 16,
        height: "100%",
        cursor: "ew-resize",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    }}>
        <div
        style={{
            width: 4,
            height: 40,
            borderRadius: 4,
            background: isHovering ? "#999" : "#ccc"
        }} 
        />
    </div>
            {width > 100 && (
                <div style={{ padding: 20 }}>
                    <DrawerSearch />
                </div>
            )}
        </div>
    );
}