import {configureStore} from "@reduxjs/toolkit";
import redditReducer from "./redditSlice.js";
import subRedditsSlice from "./subRedditsSlice.js"
import commentsReducer from "../features/Comments/commentsSlice.js";
import userReducer from "../features/Userpage/userSlice.js"

const store = configureStore({
  reducer: {
    reddit: redditReducer,
    subReddits: subRedditsSlice,
    comments: commentsReducer,
    user: userReducer
  }
});
export default store;