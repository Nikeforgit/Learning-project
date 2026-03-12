import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import styles from './DrawerSearch.module.css';
import { searchSubreddits } from "../../store/subRedditsSlice";
import { useDebounce } from "@uidotdev/usehooks";

export default function DrawerSearch() {
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState("best")
    const [t, setT] = useState("all");
    const [subSuggestions, setSubSuggestions] = useState([]);
    const [postSuggestions, setPostSuggestions] = useState([]);
    const debounceQuery = useDebounce(query, 300);
    const dispatch = useDispatch();
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
        navigate(`/?${params.toString()}`);
    }, [sort, t]);
    useEffect(() => {
        if (!debounceQuery || debounceQuery.length < 2) {
            setSubSuggestions([]);
            setPostSuggestions([]);
            return;
        }
        Promise.all([
        fetch(`/subreddits/search.json?q=${debounceQuery}&limit=3`)
        .then(r => r.json()),
        fetch(`/search.json?q=${debounceQuery}&limit=3`)
        .then(r => r.json())
        ])
        .then(([subs, posts]) => {
            setSubSuggestions(
                subs.data.children.map(c => c.data)
            );
            setPostSuggestions(
                posts.data.children.map(c => c.data)
            );
        })
    }, [debounceQuery]);
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
            {(subSuggestions.length > 0 || postSuggestions.length > 0) && (
                <div className={styles.dropdown}>
                    <div
                    className={styles.option}
                    onClick={() => navigate(`/?q=${query}`)}>
                        Search for "{query}"
                    </div>
            {subSuggestions.length > 0 && (
                <>
                <div className={styles.selectionTitle}> 
                    Communties
                </div>
                {subSuggestions.map(sr => (
                    <div 
                    key={sr.id}
                    className={styles.option}
                    onClick={() => {
                        navigate(`/r/${sr.display_name}`)
                        setSubSuggestions([]);
                        setPostSuggestions([]);
                    }}>
                        r/{sr.display_name}
                    </div>
                ))}
                </>
            )}
            {postSuggestions.length > 0 && (
                <>
                <div className={styles.selectionTitle}>
                    Posts
                </div>
                {postSuggestions.map(post => (
                    <div
                    key={post.id}
                    className={styles.option}
                    onClick={() => 
                        navigate(`/r/${post.subreddit}/comments/${post.id}`)
                    }>
                        {post.title.slice(0, 70)}
                    </div>
                ))}
                </>
            )}
            </div>
            )}
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