import { useNavigate } from "react-router-dom";
import SearchPage from "./SearchPage";
import "./SearchOverlay.css";

export default function SearchOverlay() {
    const navigate = useNavigate();
    return (
        <div className="overlay" onClick={() => navigate(-1)}>
            <div className="overlay-content"
            onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={() => navigate(-1)}>
                    ≡
                </button>
                <SearchPage />
            </div>

        </div>
    )
}