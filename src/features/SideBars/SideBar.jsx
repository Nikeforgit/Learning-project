import { HistoryBar } from "./historyBar";
import Searchbar from "./searchBar";
import SubredditBar from "./subredditBar";
import { UserBar } from "./userBar";
import "./bar.css";


const bars = { reddit: HistoryBar, search: Searchbar, subreddit: SubredditBar, user: UserBar};

export default function SideBar({mode = "reddit"}) {
    const BarMode = bars[mode] ?? HistoryBar;
    return <BarMode />;
}