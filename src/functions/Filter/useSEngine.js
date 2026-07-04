
import { createIndex, sEngine } from "./sEngine";
import { useMemo } from "react";

export default function useSEngine({posts, query, mode, filtersEnabled, scoreMin, scoreMax, commentMin, commentMax}) {
    const index = useMemo(() => createIndex(posts), [posts]);
    return useMemo(() => {
        if (mode !== "search") return posts;
        if (!query?.trim()) return posts;
        let results = sEngine(
            query,
            index,
            posts,
            new Set(),
            "OR"
        );
        if (filtersEnabled) {
            results = results.filter(post => {
             if (scoreMin !== null && post.score < scoreMin) return false;
             if (scoreMax !== null && post.score > scoreMax) return false;
             if (commentMin !== null && post.comment < commentMin) return false;
             if (commentMax !== null && post.comment > commentMax) return false;
          return true;
          });
        }
        return results;
    }, [posts, query, index, filtersEnabled, scoreMin, scoreMax, commentMin, commentMax])
}