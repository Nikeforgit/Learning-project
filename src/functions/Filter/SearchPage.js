
import { useEffect, useMemo, useState } from "react";
import { fetchSearchResult, clearSearch }  from "./searchSlice";
import Card from "../../features/Card/Card";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createIndex, sEngine } from "./sEngine";
import Fullscreen from "../../features/Posts/fullscreen";

export default function SearchPage() {
    const [params] = useSearchParams();
    const query = params.get("q") || "";
    const dispatch = useDispatch();
    const { apiPosts, loading } = useSelector(state => state.search);
    const localPosts = useSelector(state => state.reddit.posts);
    const [ activePost, setActivePost ] = useState(null);
    const trimmed = query.trim();
    useEffect(() => {
        if (!trimmed) {
            dispatch(clearSearch());
            return;
        }
        const id = setTimeout(() => {
            dispatch(fetchSearchResult(trimmed));
        }, 400);
        return () => clearTimeout(id);
    }, [dispatch, trimmed]);
    
    const merged = useMemo(() => {
        return [...apiPosts, ...localPosts];
    }, [apiPosts, localPosts]);
    const unique = useMemo(() => {
        return Array.from(new Map(merged.map(p => [p.id, p])).values());
    }, [merged]);
    const index = useMemo(() => { return createIndex(unique)}, [unique]);
    const results = useMemo(() => {
        if (!trimmed || !unique.length) return [];
        return sEngine(trimmed, index, unique, new Set(), "OR");
    }, [trimmed, index, unique]);
    if (loading && results.length === 0) return <p>Loading...</p>
    if (!trimmed) return <p>Enter a search query</p>;
    return (
        <main>
          <h2>Search results for "{query}"</h2>
          <ul className="posts">
            {results.map(post => (
              <Card key={post.id} post={post} onOpen={setActivePost}/>
        ))}
        {activePost && (
            <Fullscreen post={activePost} onClose={() => setActivePost(null)}/>
        )}
        {results.length === 0 && !loading && (
            <p>No results found for "{query}"</p>
        )}
        </ul>
        </main>
    );
};