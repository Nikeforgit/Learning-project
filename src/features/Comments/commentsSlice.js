import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const fetchComments = createAsyncThunk(
    "comments/fetchComments",
    async ({ permalink }) => {
        const API_ROOT = process.env.REACT_APP_API_URL || "http://localhost:5000";
        const parts = permalink.split("/").filter(Boolean);
        const subreddit = parts[1];
        const postId = parts[3];
        const response = await fetch(
            `${API_ROOT}/api/comments/${subreddit}/${postId}`
        );
        if (!response.ok) {
            throw new Error(`HTTp error ${response.status}`);
        }
        const comments = await response.json();
        return { comments, permalink, };
    }
);

export const commentsSlice = createSlice({
    name: "comments",
    initialState: {
        byPermalink: {},
        postsByPermalink: {},
        loading: false,
        error: null,
        currentPermalink: null,
    },
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(fetchComments.pending, (state, action) => {
            state.loading = true;
            state.error = null;
            state.currentPermalink = action.meta.arg.permalink;
        })
        .addCase(fetchComments.fulfilled, (state, action) => {
            if (state.currentPermalink !== action.payload.permalink) return;
            state.loading = false;
            state.byPermalink[action.payload.permalink] = action.payload.comments;
        })
        .addCase(fetchComments.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        });
    },
});


export default commentsSlice.reducer;