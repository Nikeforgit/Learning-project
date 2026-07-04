import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchSubRedditPosts } from "../../store/redditSlice.js";
import Card from "../Card/Card.jsx";
import CommentList from "../Comments/CommentList.jsx";
import { useEffect } from "react";

export default function PostPage() {
  const { subreddit, postId } = useParams();
  const dispatch = useDispatch();
  const permalink = `/r/${subreddit}/comments/${postId}`;
  const post = useSelector(
    state => state.reddit.posts.find(post => post.id === postId)
  );
  useEffect(() => {
    if (!post) {
      dispatch(fetchSubRedditPosts({ subreddit }));
    }
  }, [dispatch, subreddit, postId, post]);
  return (
    <main>
      {post ? (
        <>
          <Card post={post} />
          <CommentList permalink={permalink} />
        </>
      ) : (
        <p>Loading post...</p>
      )}
    </main>
  );
}
