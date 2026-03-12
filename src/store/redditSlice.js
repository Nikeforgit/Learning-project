import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchSubRedditPosts = createAsyncThunk(
  "reddit/fetchSubRedditPosts",
  async ({ subreddit, after }) => {
    const url = after
      ? `/r/${subreddit}.json?after=${after}`
      : `/r/${subreddit}.json`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    const json = await res.json();
    return {
      posts: json.data.children.map(c => c.data),
      after: json.data.after,
      subreddit,
    };
  }
);

export const fetchSearchPosts = createAsyncThunk(
  "reddit/fetchSearchPosts",
  async ({ query, sort = "relevance", t = "all", after }) => {
    const base = subreddit
    ? `/r/${subreddit}/search.json?q=${encodeURIComponent(query)}&sort=${sort}&t={t}&restrict_sr=1`
    : `/search.json?q=${encodeURIComponent(query)}&sort=${sort}&t=${t}`
    const url = after ? `${base}&after=${after}` : base;
    const res = await fetch(url);
    const q = subreddit ? `${query} subreddit:{subreddit}` : query;
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    const json = await res.json();
    return {
      posts: json.data.children.map(c => c.data),
      after: json.data.after,
      subreddit: `search|${query}|${sort}|${t}`,
    };
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
  },
  reducers: {
    clearPosts(state) {
      state.posts = [];
      state.after = null;
      state.error = null;
      state.currentSubreddit = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubRedditPosts.pending, (state, action) => {
         const {subreddit, after} = action.meta.arg;
         if (!after && state.currentSubreddit !== subreddit) {
         state.posts = [];
         state.after = null;
         state.currentSubreddit = subreddit;
      }
         state.loading = true;
         state.error = null;
      })
      .addCase(fetchSubRedditPosts.fulfilled, (state, action) => {
         state.loading = false;
         if (state.currentSubreddit !== action.payload.subreddit) return;
         const existingIds = new Set(state.posts.map(p => p.id));
         state.posts.push(
          ...action.payload.posts.filter(p => !existingIds.has(p.id))
        );
        state.after = action.payload.after;
      })
      .addCase(fetchSubRedditPosts.rejected, (state, action) => {
          state.loading = false;
          state.error = action.error.message;
      })
      .addCase(fetchSearchPosts.pending, (state, action) => {
        const { query, sort = "relevance", t = "all" } = action.meta.arg;
        const subreddit = `search|${query}|${sort}|${t}`;
        if (state.currentSubreddit !== subreddit) {
        state.posts = [];
        state.after = null;
        state.currentSubreddit = subreddit;
        }
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSearchPosts.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentSubreddit !== action.payload.subreddit) return;
        const existingIds = new Set(state.posts.map(p => p.id));
        state.posts.push(
          ...action.payload.posts.filter(p => !existingIds.has(p.id))
        );
        state.after = action.payload.after;
      })
      .addCase(fetchSearchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
  },
});

export const { clearPosts } = redditSlice.actions;
export default redditSlice.reducer;
