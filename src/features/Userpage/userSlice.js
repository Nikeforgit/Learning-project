import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_ROOT = process.env.REACT_APP_API_URL || 'http://localhost:5000';
export const fetchUserProfile = createAsyncThunk(
  "reddit/fetchUserProfile",
  async ({ username }) => {
   try {
    const url = new URL (`${API_ROOT}/api/user/${username}/about`);
    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    const json = await res.json();
    return {
    profile: json
    };
  } catch (error) {
    console.error("fetchUserProfile error", error);
    throw error;
  }
  }
);

export const fetchUserPosts = createAsyncThunk(
  "reddit/fetchUserPosts",
  async ({ username, after }) => {
   try {
    const url = new URL(`${API_ROOT}/api/user/${username}`);
    url.searchParams.set("limit", "25");
    if (after) url.searchParams.set("after", after);
    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    const json = await res.json();
    return {
      posts: json.posts,
      after: json.after,
      username,
    };
  } catch (error) {
    console.error("fetchUserPosts error:", error);
    throw error;
  }
}
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    posts: [],
    profile: null,
    loading: false,
    error: null,
    after: null,
    currentUser: null,
    hasMore: true
  },
  reducers: {
    clearPosts(state) {
      state.posts = [];
      state.after = null;
      state.error = null;
      state.currentUser = null;
      state.loading = false;
      state.hasMore = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state, action) => {
         state.loading = true;
         state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.profile;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
          state.loading = false;
          state.error = action.error.message;
      })
      .addCase(fetchUserPosts.pending, (state, action) => {
        const { after, username } = action.meta.arg;
        const userKey = username;
        state.loading = true;
        if (!after && state.currentUser !== username) {
        state.posts = [];
        state.after = null;
        state.currentUser = userKey;
        }
        state.error = null;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentUser !== action.payload.username) return;
        const existingIds = new Set(state.posts.map(post => post.id));
        const newPosts = action.payload.posts;
        const uniquePosts = newPosts.filter(
          post => !existingIds.has(post.id)
        )
        state.posts.push(...uniquePosts);
        state.after = action.payload.after;
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
  },
});

export const { clearPosts } = userSlice.actions;
export default userSlice.reducer;