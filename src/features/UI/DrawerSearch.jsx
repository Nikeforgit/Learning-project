import { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { createIndex, sEngine } from "../../functions/Filter/sEngine.js";
import { fetchSearchResult } from "../../functions/Filter/searchSlice.js";
import { useNavigate } from "react-router-dom";

export default function DrawerSearch() {
    const [query, setQuery] = useState("");
    const redditPosts = useSelector(state => state.reddit.posts);
    const { apiPosts, loading } = useSelector(state => state.search);
    const posts = apiPosts.length ? apiPosts : redditPosts;
    const index = useMemo(() => createIndex(posts), [posts]);
    const navigate = useNavigate();
    const results = useMemo(() => {
        if (!query.trim()) return [];
        if (apiPosts.length) {
            return apiPosts;
        }
        return sEngine(query, index, redditPosts);
    }, [query, index, posts, redditPosts]);
    const dispatch = useDispatch();
    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmed = query.trim();
        if (!trimmed) return;
        navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    };
    return (
        <div style={{ maxWidth: 400 }}>
            <form
            onSubmit={handleSubmit}
            style={{
                display: "flex",
                gap: 8,
                marginBottom: 16
            }}
            >
            <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search..."
            style={{
                flex: 1,
                padding: 8,
                borderRadius: 6,
                border: "1px solid #ccc"
            }}
            />
            <button type="submit"
            style={{
                padding: "8px 12px",
                borderRadius: 6,
                border: "none",
                background: "#007bff",
                color: "white",
                cursor: "pointer"
            }}>
                Go!
            </button>
            </form>
            <div style={{ maxHeight: "70vh", overflowY: "auto"}}>
            
            </div>
        </div>
    );
}