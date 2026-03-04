import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from './DrawerSearch.module.css';

export default function DrawerSearch() {
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState("best")
    const [t, setT] = useState("all");
    const navigate = useNavigate();
    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmed = query.trim();
        if (!trimmed) return;
        const params = new URLSearchParams({
            q: query.trim(),
            sort,
            t
        });
        navigate(`/?${params.toString()}`);
    };
    return (
        <div style={{ maxWidth: 400 }}>
            <form
            onSubmit={handleSubmit}
            style={{
                display: "flex",
                gap: 8,
                marginBottom: 16
            }}>
            <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search..."
            style={{
                flex: 1,
                padding: 8,
                borderRadius: 6,
                border: "1px solid #ccc"
            }}/>
            <div className={StyleSheet.segment}>
                {["best", "hot", 'new', "top", "rising"].map(option => (
                    <button key={option} className={`${styles.segmentItem} ${sort === option ? styles.active : ""}`}
                    onClick={() => setSort(option)}>
                        {option}
                    </button>
                ))}
            </div>
            <div className={StyleSheet.segment}>
                {["all", "day", 'week', "month", "year"].map(option => (
                    <button key={option} className={`${styles.segmentItem} ${sort === option ? styles.active : ""}`}
                    onClick={() => setSort(option)}>
                        {option}
                    </button>
                ))}
            </div>
            <button type="submit"
            style={{
                padding: "8px 12px",
                borderRadius: 6,
                border: "none",
                background: "#007bff",
                color: "white",
                cursor: "pointer"
            }}>Go!</button>
            </form>
        </div>
    );
}