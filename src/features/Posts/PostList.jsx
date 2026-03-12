import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useParams } from "react-router-dom";
import { fetchSubRedditPosts, fetchSearchPosts } from "../../store/redditSlice";
import Card from "../Card/Card";

export default function PostList() {
  const dispatch = useDispatch();
  const { subreddit } = useParams();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");
  const sort = searchParams.get("sort") || "relevance";
  const t = searchParams.get("t") || "all";
  const { posts, loading, error, after } = useSelector((state) => state.reddit);
  const isFetching = useRef(false);
  const isSearchMode = Boolean(query);
  const isSubredditMode = Boolean(subreddit);
  const subredditFilter = searchParams.get("subreddit");

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
      document.body.offsetHeight - 300;
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
        {posts.map((post) => (
          <Card key={post.id} post={post} />
        ))}
        {loading && <p>Loading...</p>}
      </ul>
    </div>
  );
}

