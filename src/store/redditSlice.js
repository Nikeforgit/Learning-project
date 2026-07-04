import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_ROOT = process.env.REACT_APP_API_URL || 'http://localhost:5000';
export const fetchSubRedditPosts = createAsyncThunk(
  "reddit/fetchSubRedditPosts",
  async ({ subreddit, after }) => {
   try {
    const url = new URL (`${API_ROOT}/api/r/${subreddit}`);
    url.searchParams.set("limit", "25");
    if (after) url.searchParams.set("after", after);
    const res = await fetch(url.toString());
    console.log("STATUS:", res.status);
    if (!res.ok) {
      const text = await res.text();
      console.log(text);
      throw new Error(`HTTP error ${res.status}`);
    }
    const json = await res.json();
    return {
      posts: json.posts || [],
      after: json.after,
      subreddit,
    };
  } catch (error) {
    console.error("fetchSubRedditPosts error", error);
    throw error;
  }
  }
);

export const fetchSearchPosts = createAsyncThunk(
  "reddit/fetchSearchPosts",
  async ({ query, sort = "relevance", t = "all", after, subreddit }) => {
   try {
    const url = new URL(`${API_ROOT}/api/search`);
    url.searchParams.set("q", query);
    url.searchParams.set("sort", sort);
    url.searchParams.set("t", t);
    url.searchParams.set("limit", "25");
    if (after) url.searchParams.set("after", after);
    if (subreddit) url.searchParams.set("subreddit", subreddit)
    const res = await fetch(url.toString());
    console.log("STATUS:", res.status);
    if (!res.ok) {
      const text = await res.text();
      console.log(text);
      throw new Error(`HTTP error ${res.status}`);
    }
    const json = await res.json();
    return {
      posts: Array.isArray(json) ? json : json.posts || [],
      after: json.after,
      subreddit: `search|${query}|${sort}|${t}|${subreddit || 'all'}`,
    };
  } catch (error) {
    console.error("fetchSearchPosts error:", error);
    throw error;
  }
}
);

const redditSlice = createSlice({
  name: "reddit",
  initialState: {
    posts: [],
    loading: false,
    error: null,
    after: null,
    currentSubreddit: null,
    hasMore: true
  },
  reducers: {
    clearPosts(state) {
      state.posts = [];
      state.after = null;
      state.error = null;
      state.currentSubreddit = null;
      state.hasMore = true;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubRedditPosts.pending, (state, action) => {
         const { subreddit, after } = action.meta.arg;
         state.loading = true;
         if (!after && state.currentSubreddit !== subreddit) {
         state.posts = [];
         state.after = null;
         state.currentSubreddit = subreddit;
         state.hasMore = true;
      };
         state.error = null;
      })
      .addCase(fetchSubRedditPosts.fulfilled, (state, action) => {
        console.log(
          "SEARCH fullfilled",
          "posts:", action.payload.posts.length,
          "after:", action.payload.after);
        state.loading = false;
        const newPosts = action.payload.posts;
        state.after = action.payload.after;
        state.hasMore = Boolean(action.payload.after);
        const existingIds = new Set(
          state.posts.map(post => post.id)
        );
        const uniquePosts = newPosts.filter(
          post => !existingIds.has(post.id)
        );
        state.posts.push(...uniquePosts);
      })
      .addCase(fetchSubRedditPosts.rejected, (state, action) => {
          state.loading = false;
          state.error = action.error.message;
      })
      .addCase(fetchSearchPosts.pending, (state, action) => {
        const { query, sort = "relevance", t = "all", after, subreddit } = action.meta.arg;
        const subredditKey = `search|${query}|${sort}|${t}|${subreddit || 'all'}`;
        state.loading = true;
        if (!after && state.currentSubreddit !== subredditKey) {
        state.posts = [];
        state.after = null;
        state.currentSubreddit = subredditKey;
        state.hasMore = true;
        }
        state.error = null;
      })
      .addCase(fetchSearchPosts.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentSubreddit !== action.payload.subreddit) return;
        const existingIds = new Set(state.posts.map(post => post.id));
        const newPosts = action.payload.posts;
        const uniquePosts = newPosts.filter(
          post => !existingIds.has(post.id)
        )
        state.posts.push(...uniquePosts);
        state.after = action.payload.after;
        state.hasMore = Boolean(action.payload.after);
        console.log({posts: state.posts.length, after: state.after, hasMore: state.hasMore});
      })
      .addCase(fetchSearchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
  },
});

export const { clearPosts } = redditSlice.actions;
export default redditSlice.reducer;
