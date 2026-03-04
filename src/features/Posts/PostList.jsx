import { useCallback, useEffect, useRef } from "react";
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
  const loadingRef = useRef(loading);
  const afterRef = useRef(after);

  const isSearchMode = Boolean(query);
  const isSubredditMode = Boolean(subreddit);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    afterRef.current = after;
  }, [after]);

  useEffect(() => {
    isFetching.current = false;

    if (isSearchMode) {
      dispatch(fetchSearchPosts({ query, sort, t }));
    } else if (isSubredditMode) {
      dispatch(fetchSubRedditPosts({ subreddit }));
    } else {
      dispatch(fetchSubRedditPosts({ subreddit: "popular" }));
    }
  }, [dispatch, query, sort, t, subreddit]);

  const handleScroll = useCallback(() => {
    const bottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 200;

    if (
      bottom &&
      !loadingRef.current &&
      afterRef.current &&
      !isFetching.current
    ) {
      isFetching.current = true;

      if (isSearchMode) {
        dispatch(
          fetchSearchPosts({
            query,
            sort,
            t,
            after: afterRef.current,
          })
        );
      } else if (isSubredditMode) {
        dispatch(
          fetchSubRedditPosts({
            subreddit,
            after: afterRef.current,
          })
        );
      } else {
        dispatch(
          fetchSubRedditPosts({
            subreddit: "popular",
            after: afterRef.current,
          })
        );
      }
    }
  }, [dispatch, isSearchMode, isSubredditMode, query, sort, t, subreddit]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

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

