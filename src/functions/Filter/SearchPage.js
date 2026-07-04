
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import PostList from "../../features/Posts/PostList.jsx";

export default function SearchPage() {
    const [params] = useSearchParams();
    const query = params.get("q") || "";
    const { loading } = useSelector(state => state.reddit.loading);

    if (loading) return <p>Loading...</p>
    if (!query.trim) return <p>Enter a search query</p>;

    return (
        <main>
          <h2>Search results for "{query}"</h2>
          <PostList mode="search"/>
        </main>
    );
};