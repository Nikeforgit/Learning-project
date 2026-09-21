import {configureStore} from "@reduxjs/toolkit";
import redditReducer from "./redditSlice.js";
import subRedditsSlice from "./subRedditsSlice.js"
import commentsReducer from "../features/Comments/commentsSlice.js";
import userReducer from "../features/Userpage/userSlice.js"
import sidebarReducer from "../features/SideBars/sidebarSlice.js";
import historyReducer from "./historySlice.js";

const store = configureStore({
  reducer: {
    reddit: redditReducer,
    subReddits: subRedditsSlice,
    comments: commentsReducer,
    user: userReducer,
    sidebar: sidebarReducer,
    history: historyReducer,
  }
});
export default store;