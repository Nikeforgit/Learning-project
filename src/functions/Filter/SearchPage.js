
import { useEffect, useMemo } from "react";
import { fetchSearchResult }  from "./searchSlice";
import Card from "../../features/Card/Card";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createIndex, sEngine } from "./sEngine";

export default function SearchPage() {
    const [params] = useSearchParams();
    const query = params.get("q");
    const dispatch = useDispatch();
    const { apiPosts, loading } = useSelector(state => state.search);
    const localPosts = useSelector(state => state.reddit.posts);
    useEffect(() => {
        if (query) {
            dispatch(fetchSearchResult(query));
        }
    },[dispatch, query]);
    const results = useMemo(() => {
        if (!query) return [];
        const merged = [...apiPosts, ...localPosts];
        const unique = Array.from(
            new Map(merged.map(p => [p.id, p])).values()
        );
        const index = createIndex(unique);
        const localIdsSet = new Set(localPosts.map(p => p.id));

        const localIds = new Set(
        unique
         .map((p, i) => localIdsSet.has(p.id) ? i : null)
         .filter(i => i !== null)
    );
        return sEngine(query, index, unique, localIds, "OR");
    }, [query, apiPosts, localPosts]);
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