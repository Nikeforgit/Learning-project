import { useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useParams } from "react-router-dom";
import { fetchSubRedditPosts, fetchSearchPosts } from "../../store/redditSlice";
import Card from "../Card/Card";

export default function PostList() {
  const dispatch = useDispatch();
  const { subreddit } = useParams();
  const [searchParams] = useSearchParams();
  const filters = {
    scoreMin: Number(searchParams.get("scoreMin")) || null,
    scoreMax: Number(searchParams.get("scoreMax")) || null,
  };
  const query = searchParams.get("q");
  const sort = searchParams.get("sort") || "relevance";
  const t = searchParams.get("t") || "all";
  const { posts, loading, error, after } = useSelector((state) => state.reddit);
  const isFetching = useRef(false);
  const isSearchMode = Boolean(query);
  const isSubredditMode = !query && Boolean(subreddit);
  const subredditFilter = searchParams.get("subreddit");
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
    if (filters.scoreMin && post.score < filters.scoreMin) {return false};
    if (filters.scoreMax && post.score > filters.scoreMax) {return false};
    return true;
  });
}, [posts, filters]);
  const prevQueryRef = useRef("");

  useEffect(() => {
    prevQueryRef.current = query;
  }, [query]);
  useEffect(() => {
  if (isSearchMode) {
    dispatch(fetchSearchPosts({
      query,
      sort,
      t,
      subreddit: subredditFilter
    }));
  }
  else if (isSubredditMode) {
    dispatch(fetchSubRedditPosts({
      subreddit
    }));
  }
  else {
    dispatch(fetchSubRedditPosts({
      subreddit: "popular"
    }));
  }
}, [dispatch, query, sort, t, subreddit, subredditFilter]);

  useEffect(() => {
    const handleScroll = () => {
      const bottom = 
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 300;
    if (bottom && !loading && after && !isFetching.current) {
      isFetching.current = true;

      if (isSearchMode) {
        dispatch(fetchSearchPosts({
          query,
          sort,
          t,
          after,
          subreddit: subredditFilter
        }));
      } else if (isSubredditMode) {
        dispatch(fetchSubRedditPosts({
          subreddit,
          after
        }));
      } else {
        dispatch(fetchSubRedditPosts({
          subreddit: "popular",
          after
        }));
      }
    }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [dispatch, query, sort, t, subreddit, subredditFilter, after]);

  useEffect(() => {
    if (!loading) {
      isFetching.current = false;
    }
  }, [loading]);

  if (loading && posts.length === 0) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ minHeight: "200vh" }}>
      <ul className="posts">
        {filteredPosts.map(post => (
          <Card key={post.id} post={post} />
        ))}
        {loading && <p>Loading...</p>}
      </ul>
    </div>
  );
}

