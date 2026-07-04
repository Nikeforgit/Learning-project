import { Routes , Route } from "react-router-dom";
import FeedPage from "../pages/FeedPage.jsx";
import SubredditPage from "../pages/SubredditPage.jsx";
import PostPage from "../pages/PostPage.jsx";
import SearchPage from "../../functions/Filter/SearchPage.js";
import UserPage from "../Userpage/userPage.jsx";


export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<FeedPage />} />
            <Route path="/r/:subreddit" element={<SubredditPage />}/>
            <Route path="/r/:subreddit/comments/:postId" element={<PostPage />}/>
            <Route path="/search" element={<SearchPage />} />
            <Route path="/user/:username" element={<UserPage />}/>
        </Routes>
    );
}