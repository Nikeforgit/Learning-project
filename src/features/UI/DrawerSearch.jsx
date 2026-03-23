import { useState, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import ReactSlider from "react-slider";
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
    const [showScoreFilter, setShowScoreFilter] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const getNumParam = (key, fallback = null) => {
        const param = searchParams.get(key);
        if (param === null) return fallback;
        const n = Number(param);
        return isNaN(n) ? fallback : n;  
    };
    const scoreMin = getNumParam("scoreMin", -10000);
    const scoreMax = getNumParam("scoreMax", 10000);
    const [range, setRange] = useState([scoreMin, scoreMax]);
    function FilterChip({label, onRemove}) {
        return (
            <div className="chip">
                {label}
                <span className="chipRemove" onClick={onRemove}>-</span>
            </div>
        );
    }
    const filters = {
        scoreMin: getNumParam("scoreMin"), 
        scoreMax: getNumParam("scoreMax"),
        commentsMin: getNumParam("commentsMin"),
        commentsMax: getNumParam("commentsMax"),
        ageMin: getNumParam("ageMin"),
        ageMax: getNumParam("ageMax"),
        subreddit: searchParams.get("subreddit")
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmed = (query || "").trim();
        if (!trimmed) return;
        const currentQuery = searchParams.get("q");
        if (currentQuery === trimmed) return;
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
        setRange([scoreMin, scoreMax]);
    }, [scoreMin, scoreMax]);
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
    const handleSliderChange = (newValues) => {
        let [min, max] = newValues;
        if (min > max) [min, max] = [max, min];
        updateFilter("scoreMin", min);
        updateFilter("scoreMax", max);
    };
    const handleInputMin = (e) => {
        const value = Number(e.target.value);
        if (isNaN(value)) return;
        setRange(([_, max]) => [Math.min(value, max), max]);
    };
    const handleInputMax = (e) => {
        const value = Number(e.target.value);
        if (isNaN(val)) return;
        setRange(([min, _]) => [min, Math.max(value, min)]);
    };
    const normalize = ([min, max]) => {
        if (min > max) return [max, min];
        return [min, max];
    }
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
            <div style={{padding: '20px', border: `1px solid #ddd`, borderRadius: `5px`, boxShadow: `0 0 5px rgba(0, 0, 0, 0.1)`}}>
            <button id="show-button" onClick={() => setShowScoreFilter(!showScoreFilter)} style={{width: `100%`, padding: `10px`, marginBottom: `10px`}}>
                {showScoreFilter ? `Hide filters` : `Show filters`}
            </button>
            {showScoreFilter && (
            <div id="function-body">
            <div className="range-wrapper">
                <ReactSlider value={range} min={-10000} max={10000} onChange={setRange} onAfterChange={(values) => {const [min, max] = normalize(values); updateFilter("scoreMin", min); updateFilter("scoreMax", max)}} className={styles.slider} thumbClassName={styles.thumb} trackClassName={styles.track}/>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: `10px`}}>
                <input type="number" value={range[0]} onChange={handleInputMin} placeholder="Min score"/>
                <input type="number" value={range[1]} onChange={handleInputMax} placeholder="Max score"/>
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
            )}
            </div>
        </div>
    </div>
    );
}