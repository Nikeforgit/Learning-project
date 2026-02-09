const Routes = {
  feed: () => "/",
  subreddit: (name) => `/r/${name}`,
  post: (subreddit, postId) => 
    `/r/${subreddit}/comments/${postId}`,
};


export default Routes;