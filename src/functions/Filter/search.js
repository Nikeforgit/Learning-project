import { useRef } from "react";
import { useNavigate, createSearchParams, useLocation } from "react-router-dom";

function Search() {
    const navigate = useNavigate();
    const searchInputRef = useRef();
    const location = useLocation();
    const onSearchHandler = (e) => {
        e.preventDefault();
        const value = searchInputRef.current.value.trim();
        if (!value) return;
        navigate (
            `/search?q=${value}`, {state: { backgroundLocation: location},
        });
    };
    return (
        <form onSubmit={onSearchHandler} className="search-form">
            <input ref={searchInputRef} placeholder="Search..." />
            <button type="submit">Search</button>
        </form>
    );
}

export default Search;