import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import Card from "../Card/Card";
import CommentList from "../Comments/CommentList";

export default function PostPage() {
  const { subreddit, postId } = useParams();
  const permalink = `/r/${subreddit}/comments/${postId}`;

  const post = useSelector(
    state => state.comments.postsByPermalink?.[permalink]
  );

  return (
    <main>
      {post && <Card post={post} />}
      <CommentList permalink={permalink} />
    </main>
  );
}
