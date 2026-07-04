export const API_ROOT = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const getSubredditPosts = async (subreddit) => {
  const response = await fetch(`${API_ROOT}/api/r/${subreddit}`);
  if (!response.ok) {
    throw new Error("Failure");
  }
  const json = await response.json();
  return json.posts;
};

export const getSubreddits = async () => {
  const response = await fetch(`${API_ROOT}/api/subreddits`);
  if (!response.ok) {
    throw new Error("Failure");
  }
  const json = await response.json();
  return json;
};

export const getPostComments = async (permalink) => {
  try {
    const match = permalink.match(/\/r\/([^\/]+)\/comments\/([^\/]+)/);
    if (!match) throw new Error("Invalid permalink");
    const [, subreddit, postId] = match;
    const response = await fetch(`${API_ROOT}/api/comments/${subreddit}/${postId}`);
    if (!response.ok) {
    throw new Error("Failure");
  }
  const json = await response.json();
  return Array.isArray(json) ? json : [];
  } catch (error) {
    console.error("getPostComments error:", error);
    return [];
  }
};

