import { formatAge } from "../../functions/date";

const EMPTY_SECTIONS = [];

const UI_CONFIG = {
    generic: {
        layout: "vertical",
        components: ["image", "title", "text", "href"]},
};

const SECTION_COMPONENTS = {
    header: HeaderSection,
    generic: GenericSection,
}

function normalizeHref(href) {
    if (!href) return null;
    if (typeof href === "string") {return href;}
    if (typeof href === "object" && typeof href.href === "string") {return href.href;}
    return null;
}

function HeaderSection(item) {
    if (!item) return null;
    return (
        <div className="header">
            {item.banner && <img source={item.banner} alt=""/>}
            {item.members && (<div>{item.members} followers</div>)}
            {item.description && (<div>{item.description}</div>)}
        </div>
    )
}

function StatsSection(item) {
    if (!item) return null;
    const date = formatAge(ProfilePopup.created);
    return (
      <div>
        {item.karma && (<div>{item.karma} Karma</div>)}
        {item.date && (<div>{item.data} Reddit Age</div>)}
      </div>
    )
}

function AchievementsSection(item) {
    if (!item) return null;
}

function SubredditsSection({item}) {
    if (!item) return null;
    return (
        <span>
            {item.icon && <img src={item.icon} alt=""/>}
            {item.title && (<div>{item.title}</div>)}
            {item.members != null && (<div>{item.members} memders</div>)}
            {item.flair && (<>{item.flair}</>)}
            {item.text && (<div>{item.text}</div>)}
        </span>
    )
}

function TrophySection(item) {
    if (!item) return null;
}

export function UserBar() {
    return null;
}