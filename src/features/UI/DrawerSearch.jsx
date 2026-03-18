import { useState, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
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
    const [searchParams, setSearchParams] = useSearchParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const getNumberParam = (key) => {
        const value = searchParams.get(key);
        return value !== null ? null : Number(value);  
    }
    function FilterChip({label, onRemove}) {
        return (
            <div className="chip">
                {label}
                <span className="chipRemove" onClick={onRemove}>-</span>
            </div>
        );
    }
    const filters = {
        scoreMin: getNumberParam("scoreMin"), 
        scoreMax: getNumberParam("scoreMax"),
        commentsMin: getNumberParam("commentsMin"),
        commentsMax: getNumberParam("commentsMax"),
        ageMin: getNumberParam("ageMin"),
        ageMax: getNumberParam("ageMax"),
        subreddit: searchParams.get("subreddit")
    };
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
    const updateFilter = (key, value) => {
        const params = new URLSearchParams(searchParams);
        if (value === null) {
            params.delete(key);
        } else {
            params.set(key, value);
        }
        setSearchParams(params);
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
        const loadSuggestions = async () => {
            try {
        const [subRes, postRes] = await Promise.all([
        fetch(`/subreddits/search.json?q=${debounceQuery}&limit=3`),
        fetch(`/search.json?q=${debounceQuery}&limit=3`)
        ])
        const subs = subRes.ok ? await subRes.json() : { data:{ children: [] }};
        const posts = postRes.ok ? await postRes.json() : { data:{ children: []}};
            setSubSuggestions(subs.data.children.map(c => c.data));
            setPostSuggestions(posts.data.children.map(c => c.data));
    } catch {
        setSubSuggestions([]);
        setPostSuggestions([]);
    }
    };
    loadSuggestions();
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
            <div className={styles.rangeWrapper}>
                <input type="range" min="-5000" max="5000" value={filters.scoreMin ?? -5000} onChange={(e) => updateFilter("scoreMin", Number(e.target.value))} className={styles.range}/>
                <input type="range" min="-5000" max="5000" value={filters.scoreMax ?? 5000} onChange={(e) => updateFilter("scoreMax", Number(e.target.value))} className={styles.range}/>
            </div>
            <div className={styles.chips}>
                {filters.scoreMin !== null && (
                    <FilterChip label={`Score > ${filters.scoreMin}`} onRemove={() => updateFilter("scoreMin", null)}/>
                )}
                {filters.scoreMax !== null && (
                    <FilterChip label={`Score < ${filters.scoreMax}`} onRemove={() => updateFilter("scoreMax", null)}/>
                )}
            </div>
        </div>
    </div>
    );
}