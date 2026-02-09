import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { fetchSubRedditPosts } from "../../store/redditSlice";
import PostList from "../Posts/PostList";


export default function SubredditPage({ defaultSubreddit }) {
  const params = useParams();
  const subreddit = params.subreddit ?? defaultSubreddit;

  const dispatch = useDispatch();
  const posts = useSelector((state) => state.reddit.posts);
  const loading = useSelector((state) => state.reddit.loading);

  useEffect(() => {
    dispatch(fetchSubRedditPosts({ subreddit }));
  }, [dispatch, subreddit]);

  return (
    <main>
      <h1>r/{subreddit}</h1>
      <PostList posts={posts} loading={loading} />
    </main>
  );
}
