export const API_ROOT = "";

export const getSubredditPosts = async (subreddit) => {
  const response = await fetch(`/r/${subreddit}.json`);
  if (!response.ok) {
    throw new Error("Failure");
  }
  const json = await response.json();
  return json.data.children.map((post) => post.data);
};

export const getSubreddits = async () => {
  const response = await fetch(`/subreddits.json`);
  if (!response.ok) {
    throw new Error("Failure");
  }
  const json = await response.json();
  return json.data.children.map((subreddit) => subreddit.data);
};

export const getPostComments = async (permalink) => {
  const response = await fetch(`${permalink}.json`);
  if (!response.ok) {
    throw new Error("Failure");
  }
  const json = await response.json();
  return json[1].data.children
    .filter((item) => item.kind === "t1")
    .map((item) => item.data);
};

