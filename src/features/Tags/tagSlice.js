
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    tag: {}
}

export const tagSlice = createSlice({
    name: "tag",
    initialState: initialState,
    reducers: {
        setTag: (state, action) => {
    state.tag = action.payload;
} }
});

export const { setTag } = tagSlice.actions;
export default tagSlice.reducer;