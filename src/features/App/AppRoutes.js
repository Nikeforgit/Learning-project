import { Routes , Route } from "react-router-dom";
import Layout from "./Layout.jsx";
import FeedPage from "../pages/FeedPage.jsx";
import SubredditPage from "../pages/SubredditPage.jsx";
import PostPage from "../pages/PostPage.jsx";
import SearchPage from "../pages/SearchPage.js";
import UserPage from "../Userpage/userPage.jsx";


export default function AppRoutes() {
    return (
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<FeedPage />} />
            <Route path="/r/:subreddit" element={<SubredditPage />}/>
            <Route path="/r/:subreddit/comments/:postId" element={<PostPage />}/>
            <Route path="/search" element={<SearchPage />} />
            <Route path="/user/:username" element={<UserPage />}/>
          </Route>
        </Routes>
    );
}