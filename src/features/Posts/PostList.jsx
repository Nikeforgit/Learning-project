import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useLocation } from "react-router-dom";
import { fetchSubRedditPosts, fetchSearchPosts, clearPosts } from "../../store/redditSlice";
import Fullscreen from "./fullscreen.jsx";
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

export default function PostList({subreddit: propSubreddit }) {
  const dispatch = useDispatch();
  const params = useParams();
  const location = useLocation();
  const subreddit = propSubreddit || params.subreddit;
  const {query, sort, t, subreddit: subredditFilter, scoreMin, scoreMax} = getSearchState(location.search);
  const { posts, loading, error, after, hasMore } = useSelector((state) => state.reddit);
  const isFetching = useRef(false);
  const lastFetchTime = useRef(0);
  const [activePost, setActivePost] = useState(null);
  const isSearchMode = Boolean(query);
  const isSubredditMode = !query && Boolean(subreddit);
  const filteredPosts = useMemo(() => {
  return posts.filter(post => {
    if (scoreMin !== null && post.score < scoreMin) return false;
    if (scoreMax !== null && post.score > scoreMax) return false;
    return true;
  });
}, [posts, scoreMin, scoreMax]);

useEffect(() => {
    if (!loading) {
      isFetching.current = false;
    }
  }, [loading]);

  useEffect(() => {
    dispatch(clearPosts());
    isFetching.current = false;
    lastFetchTime.current = 0;
  }, [dispatch, subreddit, query]);

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
}, [dispatch, query, sort, t, subreddit, subredditFilter]);

  useEffect(() => {
    const handleScroll = () => {
      if (!hasMore || loading || isFetching.current) return;
      const bottom = 
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 500;
      if (!bottom) return;
      const now = Date.now();
      if (now - lastFetchTime.current < 300) return;
      lastFetchTime.current = now;
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
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [dispatch, query, sort, t, subreddit, subredditFilter, after, loading, hasMore, isSearchMode, isSubredditMode]);

  return (
    <div>
      <ul className="posts">
        {filteredPosts.map(post => (
          <Card key={post.id} post={post} onOpen={setActivePost}/>
        ))}
        {activePost && (
          <Fullscreen post={activePost} onClose={() => setActivePost(null)} />
        )}
        {loading && posts.length > 0 && <p>Loading more...</p>}
        {!hasMore && filteredPosts.length > 0 && <p>Nothing more available...</p>}
        {!loading && filteredPosts.length === 0 && (<p>Nothing that matches your filter</p>)}
      </ul>
    </div>
  );
}

