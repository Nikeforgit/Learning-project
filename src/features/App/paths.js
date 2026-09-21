const paths = {
  feed: () => "/",
  subreddit: (name) => `/r/${name}`,
  post: (subreddit, postId) => 
    `/r/${subreddit}/comments/${postId}`,
  user: (name) => `/user/${name}`,
};


export default paths;