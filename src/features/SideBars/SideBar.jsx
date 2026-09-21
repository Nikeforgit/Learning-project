import { HistoryBar } from "./historyBar";
import Searchbar from "./searchBar";
import SubredditBar from "./subredditBar";
import { UserBar } from "./userBar";
import "./bar.css";


const bars = { reddit: HistoryBar, search: Searchbar, subreddit: SubredditBar, user: UserBar};
console.log("BARS:", bars);
export default function SideBar({mode = "reddit"}) {
    console.log("SIDEBAR RENDER:", mode);
    const BarMode = bars[mode] ?? HistoryBar;
    console.log("SIDEBAR COMPONENT:", BarMode);
    return (
    <div className={`sidebar sidebar-${mode}`}>       
      <BarMode mode={mode}/>
    </div> );
}