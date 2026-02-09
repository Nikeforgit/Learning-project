import { createSlice } from "@reduxjs/toolkit";
import { getSubreddits } from "../api/reddit";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchSubreddits = createAsyncThunk(
    "subReddits/fetchSubreddits",
    async () => {
        return await getSubreddits();
    }
);

export const subRedditsSlice = createSlice({
    name: "subReddits",
    initialState: {
    subReddits: [],
    loading: false,
    error: false,
    selectedSubReddit: "",
},
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchSubreddits.pending, (state) => {
            state.loading = true;
            state.error = false;
        })
        .addCase(fetchSubreddits.fulfilled, (state, action) => {
            state.loading = false;
            state.subReddits = action.payload;
        })
        .addCase(fetchSubreddits.rejected, (state) => {
            state.loading = false;
            state.error = true;
        });
    },
});

export default subRedditsSlice.reducer;