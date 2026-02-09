import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSubRedditPosts } from "../../store/redditSlice";
import Card from "../Card/Card";

export default function PostList() {
  const dispatch = useDispatch();
  const { posts, loading, error, after } = useSelector(
    (state) => state.reddit
  );
  const isFetching = useRef(false);
  const { currentSubreddit } = useSelector(state => state.reddit);

  useEffect(() => {
    if (!currentSubreddit) return;
    dispatch(fetchSubRedditPosts({ subreddit: currentSubreddit }));
  }, [dispatch, currentSubreddit])

  useEffect(() => {
  if (!loading) {
    isFetching.current = false;
  }
}, [loading]);

  useEffect(() => {
  const handleScroll = () => {
    const bottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 200;

    if (bottom && !loading && after && !isFetching.current) {
      isFetching.current = true;
      dispatch(fetchSubRedditPosts({ permalink }));
    }
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, [dispatch, loading, after, currentSubreddit]);


  if (loading && posts.length === 0) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ minHeight: "200vh" }}>
    <ul className="posts">
      {posts.map((post) => ( 
            <Card key={post.id} post={post}/>
            ))}
            {loading && <p>Loading...</p>}
    </ul>
  </div>
  );
}


