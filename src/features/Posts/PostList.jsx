import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useLocation } from "react-router-dom";
import { fetchSubRedditPosts, fetchSearchPosts, clearPosts as clearRedditPosts } from "../../store/redditSlice.js";
import { fetchUserPosts, fetchUserProfile, clearPosts as clearUserPosts } from "../Userpage/userSlice.js";
import Fullscreen from "./fullscreen.jsx";
import Card from "../Card/Card.jsx";
import useSEngine from "../../functions/Filter/useSEngine.js";
import SideBar from "../SideBars/SideBar.jsx";
import "./PostList.css";

function getSearchState(search) {
    const params = new URLSearchParams(search);
    return {
      query: params.get("q"),
      sort: params.get("sort") || "relevance",
      t: params.get("t") || "all",
      subreddit: params.get("subreddit"),
      scoreMin: params.get("scoreMin") !== null ? Number(params.get("scoreMin")) : null,
      scoreMax: params.get("scoreMax") !== null ? Number(params.get("scoreMax")) : null,
      commentMin: params.get("commentMin") !== null ? Number(params.get("commentMin")) : null,
      commentMax: params.get("commentMax") !== null ? Number(params.get("commentMax")) : null,
    };
  }

export default function PostList({subreddit: propSubreddit, username: propUsername, mode="reddit"}) {
  const params = useParams();
  const dispatch = useDispatch();
  const location = useLocation();
  const subreddit = propSubreddit || params.subreddit;
  const username = propUsername || params.username;
  const {query, sort, t, subreddit: subredditFilter, scoreMin, scoreMax, commentMin, commentMax} = getSearchState(location.search);
  const feedState = useSelector(state =>  mode === "user" ? state.user : state.reddit);
  const { posts, loading, error, after, hasMore } = feedState;
  const isFetching = useRef(false);
  const lastFetchTime = useRef(0);
  const [activePost, setActivePost] = useState(null);
  const isSearchMode = mode === "search";
  const isSubredditMode = mode === "subreddit";
  const isUserMode = mode === "user";
  const queryParams = new URLSearchParams(location.search);
  const filtersEnabled = queryParams.get("filters") !== "off";
  const searchedPosts = useSEngine({ mode, posts, query });
  const filteredPosts = useMemo(() => {
  if (!filtersEnabled) return posts;
  return searchedPosts.filter(post => {
    if (scoreMin !== null && post.score < scoreMin) return false;
    if (scoreMax !== null && post.score > scoreMax) return false;
    if (commentMin !== null && post.comment < commentMin) return false;
    if (commentMax !== null && post.comment > commentMax) return false;
    return true;
  });
}, [searchedPosts, scoreMin, scoreMax, commentMin, commentMax, filtersEnabled]);

  useEffect(() => {
    if (!loading) {
      isFetching.current = false;
    }
  }, [loading])

useEffect(() => {
  switch (mode) {
    case "search":
    dispatch(clearRedditPosts());
    dispatch(fetchSearchPosts({
      query,
      sort,
      t,
      subreddit: subredditFilter
    }));
    break;
    case "subreddit":
    dispatch(clearRedditPosts());
    dispatch(fetchSubRedditPosts({ subreddit }));
    break;
    case "user":
    dispatch(clearUserPosts());
    dispatch(fetchUserProfile({ username }));
    dispatch(fetchUserPosts({ username }));
    break;
    default:
    dispatch(clearRedditPosts());
    dispatch(fetchSubRedditPosts({ subreddit: "popular" }));
    break;
  }
}, [dispatch, query, sort, t, subreddit, subredditFilter, mode, username]);

    const handleScroll = useCallback(() => {
      if (!hasMore || loading || isFetching.current) return;
      const bottom = 
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 1500;
      if (!bottom) return;
      const now = Date.now();
      if (now - lastFetchTime.current < 1000) return;
      lastFetchTime.current = now;
      isFetching.current = true;
    switch (mode) {
      case "search":
        dispatch(fetchSearchPosts({
          query,
          sort,
          t,
          after,
          subreddit: subredditFilter
        }));
      break;
      case "subreddit":
        dispatch(fetchSubRedditPosts({
          subreddit,
          after
        }));
      break;
      case "user":
        dispatch(fetchUserPosts({
          username,
          after
        }));
      break;
      default:
        dispatch(fetchSubRedditPosts({
          subreddit: "popular",
          after
        }));
      break;
      }
    }, [dispatch, query, sort, t, subreddit, subredditFilter, username, after, loading, hasMore, mode]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {window.removeEventListener("scroll", handleScroll)};
  }, [handleScroll]);

  if (loading && posts.length === 0) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  return (
    <div className="post-layout">
      <main className="posts">
        {filteredPosts.map(post => (
          <Card key={post.id} post={post} onOpen={setActivePost}/>
        ))}
        {loading && posts.length > 0 && <p>Loading more...</p>}
        {!hasMore && filteredPosts.length > 0 && <p>Nothing more available...</p>}
        {!loading && filteredPosts.length === 0 && posts.length > 0 && (<p>Nothing that matches your filter</p>)}
      </main>
      {activePost && (
          <Fullscreen post={activePost} onClose={() => setActivePost(null)} />
        )}
      <aside className="Sidebar">
        <SideBar mode={mode}/>
      </aside>
    </div>
  );
}

