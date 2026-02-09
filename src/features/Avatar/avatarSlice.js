import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    avatar: {}
}

export const avatarSlice = createSlice({
    name: "avatar",
    initialState: initialState,
    reducers: {
        addAvatar: (state, action) => {
            const {id, img} = action.payload;
            state.avatar[id] = {
                id, img
            }
        }
    }
});

export const { addAvatar } = avatarSlice.actions;
export default avatarSlice.reducer;