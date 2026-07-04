import { useState } from "react";
import { useSelector } from "react-redux";
import ProfilePopup from "../UI/userPopUp";
import { useDrawer } from "../UI/DrawerContext";

export function UserProfile() {
  const profile = useSelector( state => state.user.profile );
  const [popupType, setPopupType] = useState(null);
  const { openDrawer } = useDrawer();
  if (!profile) return null;
  const years = Math.floor(
    (Date.now() / 1000 - profile.created_utc) /
    (60 * 60 * 24 * 365)
  );
  const redditAge = years === 1
      ? "1 year"
      : `${years} years`;
  return (
    <div className="user-profile">
      <div className="profile-content">
        <img src={profile?.icon_img} alt={profile.name}/>
        <h1 id="username">{profile.name}</h1>
        <span id="username-adress">u/{profile.name}</span>
        <span id="username-description"><p>{profile.subreddit?.description || ""}</p></span>
        <div className="profile-stats">
            <p id="karma">{profile?.total_karma} Karma</p>
            <button onClick={() => setPopupType("contributions")}>Contributions</button>
            <p id="reddit-age">{redditAge} Reddit Age</p>
            <button disabled={!profile?.activeIn?.length} onClick={() => setPopupType("activeIn")}>Active in</button>
            <button disabled={!profile?.achievements?.length} onClick={() => openDrawer("achievements")}> Achievements </button>
            <span><p>Trophy Case</p>{profile?.trophies?.length > 0 ? (profile?.trophies?.map(trophy => (<div key={trophy.name}>{trophy.name}</div>)))
            : (<p>No trophies</p>)}</span>
        </div>
      </div>
      {popupType && (
              <ProfilePopup 
                 type={popupType}
                 onClose={() => setPopupType(null)}
              />
            )}
    </div>
  )
}