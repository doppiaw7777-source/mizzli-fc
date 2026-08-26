import type { PublicUser } from "./types";
import { MORE_MENU_GROUPS, type MoreLink } from "./club";
import { ROLE_BLURBS, canAccessStaff } from "./roles";

export function menuGroupsForUser(user: PublicUser | null) {
  return MORE_MENU_GROUPS.map((group) => {
    const items: MoreLink[] = [];
    for (const item of group.items) {
      if (item.href === "/profilo" && !user) {
        items.push({ ...item, href: "/accedi", title: "Accedi", desc: "Entra nel tuo account" });
        continue;
      }
      if (item.href === "/admin") {
        if (canAccessStaff(user)) {
          items.push({
            href: "/staff",
            icon: "🔧",
            title: "Area staff",
            desc: user ? ROLE_BLURBS[user.role] : "Strumenti staff",
          });
        } else if (!user) {
          items.push(item);
        }
        continue;
      }
      items.push(item);
    }
    return { ...group, items };
  }).filter((group) => group.items.length > 0);
}
