import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import "./SearchOverlay.css";

export default function SearchOverlay() {
    const navigate = useNavigate();
    const [offset, setOffset] = useState(0);
    const startX = useRef(null);
    const onPointerDown = (e) => {
        startX.current = e.clientX;
    };
    const onPointerMove = (e) => {
        if (startX.current === null) return;
        const delta = e.clientX - startX.current;
        if (delta > 0) {
            setOffset(delta);
        }
    };
    const onPointerUp = () => {
        if (offset > 120) {
            navigate(-1);
        } else {
            startX.current = null;
        }
    };
    return (
        <div className="overlay"  onClick={() => navigate(-1)}>
            <div className="overlay-content" style={{transform: `translateX(${offset}px)`}}
            onClick={(e) => e.stopPropagation()} onPointerDown={onPointerDown}
             onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
                <button  onClick={() => navigate(-1)}>
                    ≡
                </button>
            </div>
        </div>
    )
}