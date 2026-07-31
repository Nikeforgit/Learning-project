import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import ReactSlider from "react-slider";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from './DrawerSearch.module.css';
import { useDebounce } from "@uidotdev/usehooks";

export default function DrawerSearch() {
    const [draft, setDraft ] = useState({
        query: "",
        sort: "best",
        t: "all",
        score:{ 
           min: null,
           max: null
        },
        comment: {
           min: null,
           max: null
        }
    });
    const [subSuggestions, setSubSuggestions] = useState([]);
    const [postSuggestions, setPostSuggestions] = useState([]);
    const debounceQuery = useDebounce(draft.query, 800);
    const [searchParams, setSearchParams] = useSearchParams();
    const [showScoreFilter, setShowScoreFilter] = useState(false);
    const navigate = useNavigate();
    const getNumParam = (key, fallback = null) => {
        const param = searchParams.get(key);
        if (param === null) return fallback;
        const n = Number(param);
        return isNaN(n) ? fallback : n;  
    };

    function getFilterMode(filters) {
        if (filters.min && filters.max) return "range";
        if (filters.min) return "min";
        if (filters.max) return "max";
        return "off";
    }               

    const [enabled, setEnabled] = useState({
        score: {
            min: false,
            max: false
        },
        comment: {
            min: false,
            max: false
        }
    });
    const toggle = (group, side) => {
        setEnabled(prev => ({
            ...prev,
            [group]: {
                ...prev[group],
                [side]: !prev[group][side]
            }
        }));
    };

    const scoreMode = getFilterMode(enabled.score);
    const commentMode = getFilterMode(enabled.comment);

    const scoreValue = 
         scoreMode === "range"
              ? [draft.score.min ?? -10000, draft.score.max ?? 10000]
              : scoreMode === "min"
                 ? [draft.score.min ?? -10000]
                 : scoreMode === "max"
                    ? [draft.score.max ?? 10000]
                    : [];
    const commentValue = 
         commentMode === "range"
              ? [draft.comment.min ?? -10000, draft.comment.max ?? 10000]
              : commentMode === "min"
                 ? [draft.comment.min ?? -10000]
                 : commentMode === "max"
                    ? [draft.comment.max ?? 10000]
                    : [];

    const handleSubmit = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (draft.query) params.set("q", draft.query);
        if (draft.sort) params.set("sort", draft.sort);
        if (draft.t) params.set("t", draft.t);
          if (enabled.score.min && draft.score.min !== null) params.set("scoreMin", draft.score.min);
          if (enabled.score.max && draft.score.max !== null) params.set("scoreMax", draft.score.max);
          if (enabled.comment.min && draft.comment.min !== null) params.set("commentMin", draft.comment.min);
          if (enabled.comment.max && draft.comment.max !== null) params.set("commentMax", draft.comment.max);
        navigate(`/search?${params.toString()}`);
    };

    const enableFilters = () => { 
        setEnabled({
          score: {
            min: true,
            max: true,
            },
          comment: {
            min: true,
            max: true
            }
        })
    };

    const disableFilters = () => { 
        setEnabled({
          score: {
            min: false,
            max: false,
            },
          comment: {
            min: false,
            max: false
            }
        })
    };

    useEffect(() => {
       const newDraft = {
            query: searchParams.get("q") || "",
            sort: searchParams.get("sort") || "best",
            t: searchParams.get("t") || "all",
            score: {
              min: searchParams.get("scoreMin") !== null
                ? Number(searchParams.get("scoreMin"))
                : null,
              max: searchParams.get("scoreMax") !== null
                ? Number(searchParams.get("scoreMax"))
                : null
            },
            comment: {
              min: searchParams.get("commentMin") !== null
                 ? Number(searchParams.get("commentMin"))
                 : null,
              max: searchParams.get("commentMax") !== null
                 ? Number(searchParams.get("commentMax"))
                 : null
            }
        };
        setDraft(newDraft);
        setEnabled({
          score: {
            min: searchParams.has("scoreMin"),
            max: searchParams.has("scoreMax"),
          },
          comment: {
            min: searchParams.has("commentMin"),
            max: searchParams.has("commentMax")
          }
        });
    }, [searchParams]);

    useEffect(() => {
        if (!debounceQuery || debounceQuery.length < 2) {
            setSubSuggestions([]);
            setPostSuggestions([]);
            return;
        }
        const loadSuggestions = async () => {
            try {
                const [subRes, postRes] = await Promise.all([
                    fetch(`http://localhost:5000/api/subreddits?q=${debounceQuery}`),
                    fetch(`http://localhost:5000/api/search?q=${debounceQuery}`),
                ]);
                if (!subRes.ok || !postRes.ok) {
                    throw new Error("Bad response");
                }
                const subs = await subRes.json();
                const posts = await postRes.json();
                setSubSuggestions(Array.isArray(subs) ? subs : []);
                setPostSuggestions(Array.isArray(posts.posts) ? posts.posts : []);
            } catch (err) {
                console.log("Suggestions error:", err);
                setSubSuggestions([]);
                setPostSuggestions([]);
            }
        };
        loadSuggestions();
    }, [debounceQuery]);

    const isTimeEnabled = ["top", "controversial"].includes(draft.sort);

    function getSliderValue(group, mode) {
        const filter = draft[group];
        switch (mode) {
            case "range": return [filter.min ?? -10000, filter.max ?? 10000];
            case "min": return [filter.min ?? -10000, 10000];
            case "max": return [filter.max ?? 10000, 10000];
            default: return [];
        }
    }

    const handleSliderChange = (group, mode) => value => {
        setDraft(prev => {
          const next = {
            ...prev,
            [group]: {
                ...prev[group],
            },
          };
          switch (mode) {
            case "range": next[group].min = value[0];
                          next[group].max = value[1];
            break;
            case "min": next[group].min = value[0];
            break;
            case "max": next[group].max = value[0];
            break;
          }
          return next;
        });
    };

    const renderThumb = (group, mode) => (props, state) => {
        if (mode === "off") return null;
        if (mode === "range") {
            return <div {...props} className={styles.thumb}/>
        }
        if (mode === "min" && state.index === 0) {
            return <div {...props} className={styles.thumb}/>
        }
        if (mode === "max" && state.index === 0) {
            return <div {...props} className={styles.thumb}/>
        }
        return null;
    };

    const handleInputChange = (group, side) => e => {
        const value = Number(e.target.value);
        setDraft(prev => ({
            ...prev,
            [group]: {
                ...prev[group],
                [side]: value
            }
        }));
    }

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
              value={draft.query}
              onChange={e => setDraft(prev => ({ ...prev, query: e.target.value }))}
              placeholder="Search..."
              className={styles.input}/>
            <button type="submit" className={styles.goButton} onClick={handleSubmit}>Go!</button>
            </form>
            {(subSuggestions.length > 0 || postSuggestions.length > 0) && (
                <div className={styles.dropdown}>
                    <div
                    className={styles.option}
                    onClick={() => {
                    const params = new URLSearchParams();
                    params.set("q", draft.query);
                    params.set("sort", draft.sort);
                    params.set("t", draft.t);
                    if (draft.score.min !== null) params.set("scoreMin", draft.score.min);
                    if (draft.score.max !== null) params.set("scoreMax", draft.score.max);
                    if (draft.comment.min !== null) params.set("commentMin", draft.comment.min);
                    if (draft.comment.max !== null) params.set("commentMax", draft.comment.max);
                    navigate(`/search?${params.toString()}`);}}>
                        Search for "{draft.query}"
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
            <div className={styles.segment}>
                {["best", "hot", 'new', "top", "rising", "controversial"].map(option => (
                    <button
                     type="button"
                      key={option}
                       className={
                        `${styles.segmentItem}
                         ${draft.sort === option ? styles.active : ""}`
                        }
                    onClick={() => setDraft(prev => ({ ...prev, sort: option }))}>
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
                         ${isTimeEnabled && draft.t === option ? styles.active : ""}
                          ${!isTimeEnabled ? styles.disabled : ""}`
                          }
                    onClick={isTimeEnabled ? () => setDraft(prev => ({ ...prev, t: option})) : undefined}>
                        {option}
                    </button>
                ))}
            </div>
            <div style={{padding: '20px', border: `1px solid #ddd`, borderRadius: `5px`, boxShadow: `0 0 5px rgba(0, 0, 0, 0.1)`}}>
            <button type="button" id="show-button" onClick={() => setShowScoreFilter(!showScoreFilter)} style={{width: `100%`, padding: `10px`, marginBottom: `10px`}}>
                {showScoreFilter ? `Hide filters` : `Show filters`}
            </button>
            {showScoreFilter && (
            <div id="function-body">
                <button type="button" onClick={enableFilters}>Enable filters</button>
                <button type="button" onClick={disableFilters}>Disable filters</button>
            <div className="range-wrapper">
                <ReactSlider value={getSliderValue("score", scoreMode)} min={-10000} max={10000} renderThumb={renderThumb("score", scoreMode)} onChange={handleSliderChange("score", scoreMode)}
                   className={styles.slider} thumbClassName={styles.thumb}
                    trackClassName={styles.track} disabled={!enabled.score.min && !enabled.score.max}/>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: `10px`}}>
                <input type="number" onChange={handleInputChange("score", "min")} disabled={!enabled.score.min}  placeholder="Min score" value={draft.score.min ?? ""}/>
                <button type="button" onClick={() => {toggle("score", "min")}} >{enabled.score.min ? "✓" : "X"}</button>
                <input type="number" onChange={handleInputChange("score", "max")} disabled={!enabled.score.max} placeholder="Max score" value={draft.score.max ?? ""}/>
                <button type="button" onClick={() => {toggle("score", "max")}} >{enabled.score.max ? "✓" : "X"}</button>
            </div>
            <div className="range-wrapper">
                <ReactSlider value={getSliderValue("comment", commentMode)} min={0} max={10000} renderThumb={renderThumb("comment", commentMode)} onChange={handleSliderChange("comment", commentMode)}
                   className={styles.slider} thumbClassName={styles.thumb}
                    trackClassName={styles.track} disabled={!enabled.comment.min && !enabled.comment.max}/>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: `10px`}}>
                <input type="number" onChange={handleInputChange("comment", "min")} disabled={!enabled.comment.min} placeholder="No comments" value={draft.comment.min ?? ""}/>
                <button type="button" onClick={() => {toggle("comment", "min")}} >{enabled.comment.min ? "✓" : "X"}</button>
                <input type="number"  onChange={handleInputChange("comment", "max")} disabled={!enabled.comment.max} placeholder="Max comments" value={draft.comment.max ?? ""}/>
                <button type="button" onClick={() => {toggle("comment", "max")}} >{enabled.comment.max ? "✓" : "X"}</button>
            </div>
            </div>
            )}
            </div>
    </div>
    );
}