import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from './DrawerSearch.module.css';

export default function DrawerSearch() {
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState("best")
    const [t, setT] = useState("all");
    const navigate = useNavigate();
    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmed = (query || "").trim();
        if (!trimmed) return;
        const params = new URLSearchParams({
            q: trimmed,
            sort,
            t
        });
        navigate(`/?${params.toString()}`);
    };
    useEffect(() => {
        const trimmed = (query || "").trim();
        if (!trimmed) return;
        const params = new URLSearchParams({
            q: trimmed,
            sort,
            t
        });
        navigate(`/?${params.toString()}`, { replace: true });
    }, [sort, t]);
    const isTimeEnabled = ["top", "controversial"].includes(sort);
    return (
        <div className={ styles.container }>
            <form
            onSubmit={handleSubmit}
            className={styles.searchRow}>
            <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search..."
            className={styles.input} />
            <button type="submit" className={styles.goButton}>Go!</button>
            </form>
            <div className={styles.filters}>
            <div className={styles.segment}>
                {["best", "hot", 'new', "top", "rising", "controversial"].map(option => (
                    <button
                     type="button"
                      key={option}
                       className={
                        `${styles.segmentItem}
                         ${sort === option ? styles.active : ""}`
                        }
                    onClick={() => setSort(option)}>
                        {option}
                    </button>
                ))}
            </div>
            <div className={styles.segment}>
                {["all", "day", 'week', "month", "year"].map(option => (
                    <button
                     type="button"
                      key={option}
                       className={
                        `${styles.segmentItem}
                         ${isTimeEnabled && t === option ? styles.active : ""}
                          ${!isTimeEnabled ? styles.disabled : ""}`
                          }
                    onClick={isTimeEnabled ? () => setT(option) : undefined}>
                        {option}
                    </button>
                ))}
            </div>
        </div>
    </div>
    );
}