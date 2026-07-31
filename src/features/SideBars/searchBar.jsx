import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import paths  from "../App/paths.js";

export default function SearchBar() {
    const subreddits = useSelector(state => state.search.subreddits);
    const users= useSelector(state => state.search.users);
   return (
   <div>
    <h1>Communities</h1>
    <ul>{subreddits.map(subreddit => (<SubredditCard key={subreddit.id || subreddit.name} subreddit={subreddit}/>))}</ul>
    <h1>Users</h1>
    <ul>{users.map(profile => (<UserCard key={profile.id || profile.name} profile={profile}/>))}</ul>
   </div>
)
}

function SubredditCard({subreddit}) {
    const icon = subreddit.community_icon || subreddit.icon_img
                 || `https://api.dicebear.com/7.x/identicon/svg?seed=${subreddit.name}`

    return (
      <Link to={paths.subreddit(subreddit.name)} onClick={(e) => e.stopPropagation()}>
        <li>
            <span>
                <img src={icon} alt={`r/${subreddit.display_name}`} width={18} height={18}/>
                r/{subreddit.display_name || subreddit.name}
            </span>
            <span className="subreddit-description">
                {subreddit.description || ""}
            </span>
            <span>
                <p className="visitors">{subreddit.visitors} weekly visitors</p>
                <p className="contributors">{subreddit.contributors} weekly contributors</p>
            </span>
        </li>
      </Link>
    )
}

function UserCard({profile}) {
    const icon = profile.icon_img || profile.snoovatar_img;
    return (
      <Link to={paths.user(profile.name)} onClick={(e) => e.stopPropagation()}>
        <li>
            <span>
                <img src={icon} alt={`u/${profile?.name}`} width={18} height={18}/>
                <h1 className="username">{profile.name}</h1>
            </span>
            <span className="username-description"><p>{profile?.subreddit?.public_description || profile?.subreddit?.description || ""}</p></span>
            <span>
                 <p className="karma">{profile?.total_karma} Karma</p>
            </span>
        </li>
      </Link>
    )
}