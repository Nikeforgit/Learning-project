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
            throw new Error(`HTTP error ${response.status}`);
        }
        const result = await response.json();
        return { permalink, comments: result.comments, after: result.after,};
    }
);

export const fetchMoreComments = createAsyncThunk(
    "comments/fetchMoreComments",
    async ({ permalink, after }) => {
        const API_ROOT = process.env.REACT_APP_API_URL || "http://localhost:5000";
        const parts = permalink.split("/").filter(Boolean);
        const subreddit = parts[1];
        const postId = parts[3];
        const url = new URL(
            `${API_ROOT}/api/comments/${subreddit}/${postId}`
        );
        if (after) {url.searchParams.set("after", after);}
        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error(`HTTp error ${response.status}`);
        }
        const result = await response.json();
        return { permalink, comments: result.comments, after: result.after};
    }
)

export const commentsSlice = createSlice({
    name: "comments",
    initialState: {
        byPermalink: {},
        loading: false,
        loadingMore: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(fetchComments.pending, (state, action) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchComments.fulfilled, (state, action) => {
            const {permalink, comments, after} = action.payload;
            state.byPermalink[permalink] = {comments, after, hasMore: Boolean(after)};
            state.loading = false;
        })
        .addCase(fetchComments.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        })
        .addCase(fetchMoreComments.pending, (state, action) => {
            state.loadingMore = true;
            state.error = null;
        })
        .addCase(fetchMoreComments.fulfilled, (state, action) => {
            const {permalink, comments, after} = action.payload;
            const current = state.byPermalink[permalink];
            if (!current) {state.loadingMore = false; return;}
            current.comments.push(...comments);
            current.after = after;
            current.hasMore = Boolean(after);
            state.loadingMore = false;
        })
        .addCase(fetchMoreComments.rejected, (state, action) => {
            state.loadingMore = false;
            state.error = action.error.message;
        });
    },
});


export default commentsSlice.reducer;