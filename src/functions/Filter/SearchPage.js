
import { useEffect, useMemo } from "react";
import { fetchSearchResult, clearSearch }  from "./searchSlice";
import Card from "../../features/Card/Card";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createIndex, sEngine } from "./sEngine";

export default function SearchPage() {
    const [params] = useSearchParams();
    const query = params.get("q") || "";
    const dispatch = useDispatch();
    const { apiPosts, loading } = useSelector(state => state.search);
    const localPosts = useSelector(state => state.reddit.posts);
    const trimmed = query.trim();
    useEffect(() => {
        if (!trimmed) {
            dispatch(clearSearch());
            return;
        }
        dispatch(fetchSearchResult(trimmed));
    }, [dispatch, trimmed]);
    const results = useMemo(() => {
        if (!trimmed) return [];
        const merged = [...apiPosts, ...localPosts];
        const unique = Array.from(
            new Map(merged.map(p => [p.id, p])).values()
        );
        if (!unique.length) return [];
        const index = createIndex(unique);
        const localIdsSet = new Set(localPosts.map(p => p.id));
        const localIds = new Set();
        unique.forEach((p, i) => {
            if (localIdsSet.has(p.id)) {
                localIds.add(i);
            }
        });
        return sEngine(trimmed, index, unique, localIds, "OR");
    }, [trimmed, apiPosts, localPosts]);
    return (
        <main>
        <h2>Search results for "{query}"</h2>
        {loading && <p>Loading...</p>}
        {results.map(post => (
            <Card key={post.id} post={post} />
        ))}
        </main>
    );
};