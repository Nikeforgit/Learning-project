import { useDispatch, useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import paths  from "../App/paths.js";
import { searchSubreddits } from "../../store/subRedditsSlice.js";
import { searchUsers } from "../Userpage/userSlice.js";
import { useEffect } from "react";

export default function SearchBar() {
    const [searchParams] = useSearchParams();
    const dispatch = useDispatch();
    const query = searchParams.get("q")?.trim() || "";
    const subreddits = useSelector(state => state.subReddits.searchSubreddits || []);
    const users= useSelector(state => state.user.searchUsers || []);
    useEffect(() => {
          console.log("SEARCHBAR QUERY:", query);
        if (query.length < 2) {
        console.log("SEARCHBAR: query too short");
        return;
    };
    console.log("SEARCHBAR: dispatch subreddits");
        dispatch(searchSubreddits(query));
        console.log("SEARCHBAR: dispatch users");
        dispatch(searchUsers(query));
    }, [query, dispatch]);
    console.log("SEARCHBAR DATA:", {
    query,
    subreddits,
    users
});
console.log(
    "SEARCHBAR FIRST USER:",
    users[0]
);
   return (
   <div>
    <h1>Communities</h1>
    <ul>{subreddits.map(subreddit => (<SubredditCard key={subreddit.id || subreddit.name} subreddit={subreddit}/>))}</ul>
    <h1>Users</h1>
    <ul>{users.map((profile, index) => (<UserCard key={profile.id ?? profile.user ?? `user-${index}`} profile={profile}/>))}</ul>
   </div>
) 
}

function SubredditCard({subreddit}) {
    const icon = subreddit.community_icon || subreddit.icon_img
                 || `https://api.dicebear.com/7.x/identicon/svg?seed=${subreddit.name}`

    return (
      <li>
      <Link to={paths.subreddit(subreddit.display_name)} onClick={(e) => e.stopPropagation()}>
            <span>
                <img src={icon} alt={`r/${subreddit.display_name}`} width={18} height={18}/>
                r/{subreddit.display_name}
            </span>
            <span className="subreddit-description">
                {subreddit.description || ""}
            </span>
            <span>
                <p className="visitors">{subreddit.members} weekly visitors</p>
                <p className="contributors">{subreddit.online} weekly contributors</p>
            </span>
      </Link>
      </li>
    ) 
}

function UserCard({ profile }) {
    const icon = profile.icon_img || profile.snoovatar_img || `https://api.dicebear.com/7.x/identicon/svg?seed=${profile.name}`;
    return (
      <li>
      <Link to={paths.user(profile.user)} onClick={(e) => e.stopPropagation()}>
            <span>
                <img src={icon} alt={`u/${profile.user}`} width={18} height={18}/>
                <h1 className="username">{profile.user}</h1>
            </span>
            <span className="username-description"><p>{profile.description || ""}</p></span>
            <span>
                 <p className="karma">{profile.karma ?? 0} Karma</p>
            </span>  
      </Link>
      </li>
    )
}