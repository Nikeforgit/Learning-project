import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const fetchComments = createAsyncThunk(
    "comments/fetchComments",
    async ({ permalink }) => {
        const response = await fetch(`${permalink}.json`);
        const json = await response.json();
        return {
            comments: json[1].data.children,
            permalink,
        };
    }
);

export const commentsSlice = createSlice({
    name: "comments",
    initialState: {
        byPermalink: {},
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