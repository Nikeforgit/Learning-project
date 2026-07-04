
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import PostList from "../Posts/PostList.jsx";


export default function SubredditPage({ defaultSubreddit }) {
  const params = useParams();
  const subreddit = params.subreddit ?? defaultSubreddit;

  const dispatch = useDispatch();
  const posts = useSelector((state) => state.reddit.posts);
  const loading = useSelector((state) => state.reddit.loading);

  return (
    <main>
      <h1>r/{subreddit}</h1>
      <PostList subreddit={subreddit} mode="subreddit"/>
    </main>
  );
}
