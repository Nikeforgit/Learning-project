import { useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useParams, useLocation } from "react-router-dom";
import { fetchSubRedditPosts, fetchSearchPosts } from "../../store/redditSlice";
import Card from "../Card/Card";

function getSearchState(search) {
    const params = new URLSearchParams(search);
    return {
      query: params.get("q"),
      sort: params.get("sort") || "relevance",
      t: params.get("t") || "all",
      subreddit: params.get("subreddit"),
      scoreMin: params.get("scoreMin") !== null ? Number(params.get("scoreMin")) : null,
      scoreMax: params.get("scoreMax") !== null ? Number(params.get("scoreMax")) : null,
    };
  }

export default function PostList() {
  const dispatch = useDispatch();
  const { subreddit } = useParams();
  const location = useLocation();
  const {query, sort, t, subreddit: subredditFilter, scoreMin, scoreMax} = getSearchState(location.search);
  const { posts, loading, error, after } = useSelector((state) => state.reddit);
  const isFetching = useRef(false);
  const isSearchMode = Boolean(query);
  const isSubredditMode = !query && Boolean(subreddit);
  const filteredPosts = useMemo(() => {
  return posts.filter(post => {
    if (scoreMin !== null && post.score < scoreMin) return false;
    if (scoreMax !== null && post.score > scoreMax) return false;
    return true;
  });
}, [posts, scoreMin, scoreMax]);
  const prevQueryRef = useRef("");
  useEffect(() => {
    prevQueryRef.current = query;
  }, [query]);

  useEffect(() => {
  if (query) {
    dispatch(fetchSearchPosts({
      query,
      sort,
      t,
      subreddit: subredditFilter
    }));
  } else if (subreddit) {
    dispatch(fetchSubRedditPosts({ subreddit }));
  } else {
    dispatch(fetchSubRedditPosts({ subreddit: "popular" }));
  }
}, [location.search, dispatch, subreddit]);

  useEffect(() => {
    const handleScroll = () => {
      const bottom = 
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 500;
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
  }, [dispatch, query, sort, t, subreddit, subredditFilter]);

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

