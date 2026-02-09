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
        const subreddit = action.meta.arg.subreddit;
        if (state.currentSubreddit !== subreddit) {
          state.posts = [];
          state.after = null;
          state.currentSubreddit = subreddit;
        }
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubRedditPosts.fulfilled, (state, action) => {
        state.loading = false;

        const subreddit = action.payload.subreddit;
        if (state.currentSubreddit !== subreddit) return;
        const existingIds = new Set(state.posts.map(p => p.id));
        action.payload.posts.forEach(post => {
          if (!existingIds.has(post.id)) {
            state.posts.push(post);
          }
        });

        state.after = action.payload.after;
      })
      .addCase(fetchSubRedditPosts.rejected, (state, action) => {
          state.loading = false;
          state.error = action.error.message;
      });
  },
});

export const { clearPosts } = redditSlice.actions;
export default redditSlice.reducer;
