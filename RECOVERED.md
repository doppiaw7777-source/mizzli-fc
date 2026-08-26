# MIZZLI FC recovered sources

Reconstructed from Cursor cloud-agent transcripts.

## Summary

- Recovered files: **194**
- Look complete: **192**
- Look incomplete/partial: **2**
- Diffs applied: 1439
- Patch failures: 18
- Cat heredocs: 24
- Python exec ok/fail: 40/6

Transcripts used: `main` (writes + reads), `bugs` and `vote` (later complete reads).
Skipped as different apps: `sponsor-app`, `ai-app`.

## Important files

| path | bytes | complete | last sources | notes |
|---|---:|:---:|---|---|
| `package.json` | 1348 | yes | main:read, main:diff:edit, main:read, main:read | patch fail: hunk @@ -3,10 could not find 10 old lines |
| `next.config.ts` | 1131 | yes | main:diff:edit, main:diff:edit, main:read, main:read |  |
| `tsconfig.json` | 670 | yes | main:read, main:read, main:read |  |
| `postcss.config.mjs` | 94 | yes | main:read |  |
| `eslint.config.mjs` | 345 | yes | scaffold-default | not present in transcripts; used create-next-app default |
| `src/app/layout.tsx` | 1796 | yes | main:diff:edit, main:diff:edit, main:read, main:diff:edit |  |
| `src/app/page.tsx` | 14576 | yes | main:diff:edit, main:diff:edit, main:diff:edit, main:diff:edit |  |
| `src/app/globals.css` | 19409 | yes | main:diff:edit, main:diff:edit, main:diff:edit, main:diff:edit |  |
| `src/components/AdminPanel.tsx` | 78949 | yes | main:diff:edit, main:diff:edit, main:diff:edit, main:diff:edit |  |
| `src/lib/storage.ts` | 9889 | yes | main:diff:edit, main:diff:edit, main:diff:edit, main:diff:edit |  |
| `src/lib/types.ts` | 8771 | yes | main:diff:edit, main:diff:edit, main:diff:edit, main:diff:edit |  |
| `src/context/TeamContext.tsx` | 2195 | yes | main:read, main:read, main:diff:edit, main:read |  |
| `src/context/UserContext.tsx` | 3202 | yes | main:read, main:diff:edit, main:read, main:read |  |
| `src/lib/auth.ts` | 4539 | yes | main:diff:edit, main:diff:edit, main:read, main:diff:edit |  |
| `src/middleware.ts` | 2239 | yes | main:read, main:diff:edit, main:diff:edit, main:read |  |

Tailwind v4: no `tailwind.config.*` (theme is in `src/app/globals.css` + `postcss.config.mjs`).

## Expected paths from later glob (138 files) still missing

- `data/match-lives.json`
- `data/presence.json`
- `data/whatsapp.json`
- `ios/.gitignore`
- `ios/App/App.xcodeproj/project.xcworkspace/xcshareddata/IDEWorkspaceChecks.plist`
- `ios/App/App/AppDelegate.swift`
- `ios/App/App/Assets.xcassets/Contents.json`
- `ios/App/App/Base.lproj/LaunchScreen.storyboard`
- `ios/App/App/Base.lproj/Main.storyboard`
- `ios/App/App/SceneDelegate.swift`
- `ios/App/App/config.xml`
- `ios/App/App/public/index.html`
- `ios/App/CapApp-SPM/.gitignore`
- `ios/App/CapApp-SPM/Package.swift`
- `ios/App/CapApp-SPM/README.md`
- `public/file.svg`
- `public/globe.svg`
- `public/next.svg`
- `public/vercel.svg`
- `public/window.svg`

## All recovered files

| complete | bytes | path | last source |
|:---:|---:|---|---|
| yes | 352 | `.env.example` | main:read |
| yes | 168 | `.env.local` | main:read |
| yes | 658 | `.gitignore` | main:read |
| yes | 2611 | `APP_STORE.md` | main:read |
| yes | 637 | `README.md` | main:read |
| yes | 1135 | `capacitor.config.ts` | main:read |
| partial | 2965 | `data/auth-audit.json` | main:read |
| yes | 107 | `data/auth.json` | main:read |
| yes | 443 | `data/phone-otp.json` | main:read |
| yes | 7277 | `data/team.json` | copied:default-team.json |
| yes | 345 | `eslint.config.mjs` | scaffold-default |
| yes | 218 | `ios/App/App/Assets.xcassets/AppIcon.appiconset/Contents.json` | main:read |
| yes | 1124 | `ios/App/App/Assets.xcassets/Splash.imageset/Contents.json` | main:read |
| yes | 4296 | `ios/App/App/Info.plist` | main:diff:edit |
| yes | 714 | `ios/App/App/capacitor.config.json` | repaired:from-capacitor.config.ts |
| yes | 211 | `next-env.d.ts` | scaffold-default |
| yes | 1131 | `next.config.ts` | main:read |
| yes | 1348 | `package.json` | main:read |
| yes | 94 | `postcss.config.mjs` | main:read |
| yes | 549 | `public/brand/mizzli-crest.svg` | heredoc:cat |
| yes | 1006 | `public/manifest.json` | main:diff:edit |
| yes | 1448 | `public/sw.js` | main:read |
| yes | 2579 | `scripts/check-match-live.ts` | main:diff:edit |
| yes | 9012 | `scripts/keep-alive.sh` | main:read |
| yes | 1693 | `scripts/pack-app.sh` | main:read |
| yes | 379 | `src/app/accedi/page.tsx` | main:read |
| yes | 7328 | `src/app/admin/page.tsx` | main:diff:edit |
| yes | 490 | `src/app/api/auth/audit/route.ts` | main:read |
| yes | 537 | `src/app/api/auth/developer-pin/route.ts` | main:read |
| yes | 2596 | `src/app/api/auth/google/callback/route.ts` | main:diff:edit |
| yes | 758 | `src/app/api/auth/google/route.ts` | main:diff:edit |
| yes | 242 | `src/app/api/auth/google/status/route.ts` | main:diff:edit |
| yes | 2220 | `src/app/api/auth/login/route.ts` | main:read |
| yes | 196 | `src/app/api/auth/logout/route.ts` | main:read |
| yes | 229 | `src/app/api/auth/me/route.ts` | main:read |
| yes | 2421 | `src/app/api/auth/phone/send-code/route.ts` | main:read |
| yes | 1697 | `src/app/api/auth/register/route.ts` | main:read |
| yes | 1718 | `src/app/api/auth/user-login/route.ts` | main:read |
| yes | 209 | `src/app/api/auth/user-logout/route.ts` | main:read |
| yes | 860 | `src/app/api/auth/user/route.ts` | main:read |
| yes | 1147 | `src/app/api/calendar/route.ts` | main:diff:edit |
| yes | 194 | `src/app/api/health/route.ts` | main:read |
| yes | 2738 | `src/app/api/live/route.ts` | main:diff:edit |
| yes | 1112 | `src/app/api/polls/vote/route.ts` | main:diff:new |
| yes | 580 | `src/app/api/presence/offline/route.ts` | heredoc:cat |
| yes | 1206 | `src/app/api/presence/ping/route.ts` | main:read |
| yes | 407 | `src/app/api/presence/status/route.ts` | main:read |
| yes | 2410 | `src/app/api/ratings/route.ts` | main:read |
| yes | 1682 | `src/app/api/scarica/app/route.ts` | main:read |
| yes | 2966 | `src/app/api/scarica/iphone/route.ts` | main:read |
| yes | 2076 | `src/app/api/sms/config/route.ts` | main:diff:edit |
| yes | 192 | `src/app/api/team/route.ts` | main:read |
| yes | 3277 | `src/app/api/team/update/route.ts` | main:diff:edit |
| yes | 1913 | `src/app/api/upload/route.ts` | main:read |
| yes | 1411 | `src/app/api/users/route.ts` | main:diff:edit |
| yes | 2615 | `src/app/api/whatsapp/config/route.ts` | main:diff:edit |
| yes | 1679 | `src/app/api/whatsapp/ingest/route.ts` | main:read |
| yes | 2168 | `src/app/api/whatsapp/webhook/route.ts` | main:diff:edit |
| yes | 600 | `src/app/assistente/page.tsx` | main:diff:edit |
| yes | 3415 | `src/app/calendario/page.tsx` | main:diff:edit |
| yes | 817 | `src/app/canti/page.tsx` | main:diff:edit |
| yes | 2943 | `src/app/cerca/page.tsx` | main:diff:edit |
| yes | 2127 | `src/app/contatti/page.tsx` | main:diff:new |
| yes | 594 | `src/app/convocati/page.tsx` | main:read |
| yes | 1327 | `src/app/documenti/page.tsx` | main:diff:new |
| yes | 1650 | `src/app/esplora/page.tsx` | main:diff:edit |
| yes | 748 | `src/app/faq/page.tsx` | main:diff:edit |
| yes | 3838 | `src/app/formazione/page.tsx` | main:diff:edit |
| yes | 1643 | `src/app/galleria/page.tsx` | main:read |
| yes | 6169 | `src/app/giocatore/[id]/page.tsx` | main:diff:edit |
| yes | 19409 | `src/app/globals.css` | main:diff:edit |
| yes | 1409 | `src/app/infortuni/page.tsx` | main:diff:edit |
| yes | 177 | `src/app/instagram/route.ts` | main:read |
| yes | 836 | `src/app/kit/page.tsx` | main:read |
| yes | 1796 | `src/app/layout.tsx` | main:diff:edit |
| yes | 3112 | `src/app/live/page.tsx` | main:diff:edit |
| yes | 1215 | `src/app/manifest.ts` | main:diff:edit |
| yes | 1267 | `src/app/media/page.tsx` | main:diff:edit |
| yes | 14576 | `src/app/page.tsx` | main:diff:edit |
| yes | 5754 | `src/app/partita/[id]/page.tsx` | main:diff:edit |
| yes | 2304 | `src/app/privacy/page.tsx` | main:diff:edit |
| yes | 8884 | `src/app/profilo/page.tsx` | main:diff:edit |
| yes | 1063 | `src/app/record/page.tsx` | main:diff:new |
| yes | 384 | `src/app/registrati/page.tsx` | main:read |
| yes | 1659 | `src/app/rosa/page.tsx` | main:read |
| yes | 4345 | `src/app/scarica/page.tsx` | main:diff:edit |
| yes | 1141 | `src/app/shop/page.tsx` | main:read |
| yes | 2393 | `src/app/staff/page.tsx` | main:diff:edit |
| yes | 2068 | `src/app/statistiche/page.tsx` | main:read |
| yes | 1951 | `src/app/storia/page.tsx` | main:read |
| yes | 1101 | `src/app/termini/page.tsx` | main:diff:edit |
| yes | 4114 | `src/app/tifosi/page.tsx` | main:diff:edit |
| yes | 78949 | `src/components/AdminPanel.tsx` | main:diff:edit |
| yes | 2641 | `src/components/AppShell.tsx` | main:diff:edit |
| yes | 6757 | `src/components/AssistantChat.tsx` | main:diff:edit |
| yes | 4090 | `src/components/AuthAuditMonitor.tsx` | main:diff:edit |
| yes | 13355 | `src/components/AuthForm.tsx` | main:diff:edit |
| yes | 2537 | `src/components/BottomNav.tsx` | main:read |
| yes | 2688 | `src/components/CalendarGallery.tsx` | main:diff:new |
| yes | 11681 | `src/components/CallupBoard.tsx` | main:diff:edit |
| yes | 613 | `src/components/ClubCrest.tsx` | main:diff:new |
| yes | 1344 | `src/components/ColorSwatch.tsx` | main:diff:edit |
| yes | 4518 | `src/components/DeveloperGate.tsx` | main:read |
| yes | 3267 | `src/components/FormationEditor.tsx` | main:diff:edit |
| yes | 8457 | `src/components/FormationView.tsx` | main:diff:edit |
| yes | 4239 | `src/components/InstallApp.tsx` | main:diff:edit |
| yes | 7390 | `src/components/LiveBoard.tsx` | main:diff:edit |
| yes | 5202 | `src/components/MatchCard.tsx` | main:diff:edit |
| yes | 14664 | `src/components/ModernCalendar.tsx` | main:diff:edit |
| yes | 5649 | `src/components/MoreMenu.tsx` | main:diff:edit |
| yes | 1719 | `src/components/NativeBootstrap.tsx` | main:read |
| yes | 5969 | `src/components/Navbar.tsx` | main:diff:edit |
| yes | 4175 | `src/components/PageMotion.tsx` | main:diff:edit |
| yes | 1713 | `src/components/PitchBoard.tsx` | main:diff:edit |
| yes | 3103 | `src/components/PlayerCard.tsx` | main:diff:edit |
| yes | 2531 | `src/components/PlayerGraphicGallery.tsx` | main:diff:edit |
| yes | 4151 | `src/components/PlayerKit.tsx` | main:diff:edit |
| yes | 6419 | `src/components/PlayerRatingControl.tsx` | main:diff:edit |
| yes | 5342 | `src/components/PresenceMonitor.tsx` | main:diff:edit |
| yes | 931 | `src/components/SectionPage.tsx` | main:read |
| yes | 18186 | `src/components/SessionDetailModal.tsx` | main:diff:edit |
| yes | 2805 | `src/components/SmsCodeFields.tsx` | main:read |
| yes | 1819 | `src/components/SocialButtons.tsx` | main:read |
| yes | 5547 | `src/components/StandingsTable.tsx` | main:read |
| yes | 2514 | `src/components/ThemeGallery.tsx` | main:read |
| yes | 4180 | `src/components/ThemeProvider.tsx` | main:diff:edit |
| yes | 272 | `src/components/admin/AdminField.tsx` | main:diff:new |
| yes | 4636 | `src/components/admin/ClubTab.tsx` | main:read |
| yes | 2767 | `src/components/admin/DocumentsTab.tsx` | main:diff:new |
| yes | 4782 | `src/components/admin/EventsTab.tsx` | main:diff:new |
| yes | 3837 | `src/components/admin/FinesTab.tsx` | main:diff:new |
| yes | 14657 | `src/components/admin/LiveTab.tsx` | main:diff:edit |
| yes | 5313 | `src/components/admin/SmsTab.tsx` | main:diff:edit |
| yes | 3134 | `src/components/admin/UsersTab.tsx` | main:diff:edit |
| yes | 9000 | `src/components/admin/WhatsAppTab.tsx` | main:diff:edit |
| yes | 2195 | `src/context/TeamContext.tsx` | main:read |
| yes | 3202 | `src/context/UserContext.tsx` | main:read |
| partial | 2037 | `src/data/club-backup.json` | main:diff:edit |
| yes | 7277 | `src/data/default-team.json` | main:diff:edit |
| yes | 172 | `src/lib/admin-credentials.ts` | main:read |
| yes | 977 | `src/lib/api.ts` | main:read |
| yes | 21342 | `src/lib/assistant.ts` | main:diff:edit |
| yes | 697 | `src/lib/auth-audit.ts` | main:diff:edit |
| yes | 4539 | `src/lib/auth.ts` | main:diff:edit |
| yes | 260 | `src/lib/brand.ts` | main:read |
| yes | 11471 | `src/lib/calendar-models.ts` | main:diff:new |
| yes | 17004 | `src/lib/client-session.ts` | main:diff:edit |
| yes | 13225 | `src/lib/club.ts` | main:diff:edit |
| yes | 1207 | `src/lib/dates.ts` | main:read |
| yes | 1736 | `src/lib/event-color.ts` | main:read |
| yes | 1710 | `src/lib/formation-presets.ts` | main:diff:new |
| yes | 4585 | `src/lib/google-oauth.ts` | main:diff:edit |
| yes | 2981 | `src/lib/images.ts` | main:read |
| yes | 3146 | `src/lib/installed-apps.ts` | main:diff:new |
| yes | 555 | `src/lib/kv.ts` | main:diff:edit |
| yes | 8453 | `src/lib/live-activity.ts` | main:diff:edit |
| yes | 7137 | `src/lib/live-engine.ts` | main:diff:edit |
| yes | 5746 | `src/lib/match-kind.ts` | main:diff:edit |
| yes | 16479 | `src/lib/match-live.ts` | main:diff:edit |
| yes | 2121 | `src/lib/match-lives-store.ts` | main:diff:new |
| yes | 973 | `src/lib/menu.ts` | main:diff:edit |
| yes | 2277 | `src/lib/native.ts` | main:read |
| yes | 4874 | `src/lib/phone-models.ts` | main:diff:new |
| yes | 5115 | `src/lib/phone-otp.ts` | main:diff:edit |
| yes | 1184 | `src/lib/phone.ts` | main:diff:edit |
| yes | 1528 | `src/lib/player-art.ts` | main:diff:new |
| yes | 3434 | `src/lib/player-graphics.ts` | main:diff:new |
| yes | 2156 | `src/lib/polls.ts` | main:diff:new |
| yes | 3972 | `src/lib/presence.ts` | main:diff:edit |
| yes | 1619 | `src/lib/public-origin.ts` | main:read |
| yes | 2922 | `src/lib/ratings.ts` | main:read |
| yes | 494 | `src/lib/request-meta.ts` | main:read |
| yes | 4003 | `src/lib/roles.ts` | main:diff:edit |
| yes | 1913 | `src/lib/session-display.ts` | main:diff:edit |
| yes | 11799 | `src/lib/session-info.ts` | main:diff:edit |
| yes | 1229 | `src/lib/session-types.ts` | main:diff:edit |
| yes | 1906 | `src/lib/sms-store.ts` | main:diff:edit |
| yes | 2472 | `src/lib/sms.ts` | main:diff:edit |
| yes | 3889 | `src/lib/sound.ts` | main:read |
| yes | 4686 | `src/lib/standings.ts` | main:diff:edit |
| yes | 9889 | `src/lib/storage.ts` | main:diff:edit |
| yes | 1461 | `src/lib/store.ts` | main:read |
| yes | 19189 | `src/lib/themes.ts` | main:diff:edit |
| yes | 8771 | `src/lib/types.ts` | main:diff:edit |
| yes | 712 | `src/lib/use-live-refresh.ts` | main:diff:new |
| yes | 6742 | `src/lib/user-auth.ts` | main:diff:edit |
| yes | 3256 | `src/lib/users.ts` | main:diff:edit |
| yes | 7574 | `src/lib/whatsapp-results.ts` | main:diff:edit |
| yes | 2227 | `src/lib/whatsapp-store.ts` | main:diff:edit |
| yes | 2699 | `src/lib/whatsapp.ts` | main:diff:edit |
| yes | 2239 | `src/middleware.ts` | main:read |
| yes | 670 | `tsconfig.json` | main:read |
| yes | 118 | `vercel.json` | main:read |
| yes | 868 | `www/index.html` | main:diff:edit |

## Patch failures (first 40)

- `package.json: hunk @@ -3,10 could not find 10 old lines`
- `data/team.json: hunk @@ -484,7 could not find 7 old lines`
- `data/team.json: hunk @@ -483,7 could not find 7 old lines`
- `data/team.json: hunk @@ -484,7 could not find 7 old lines`
- `src/data/default-team.json: hunk @@ -23,7 could not find 7 old lines`
- `data/team.json: hunk @@ -506,7 could not find 7 old lines`
- `data/team.json: hunk @@ -525,7 could not find 7 old lines`
- `data/team.json: hunk @@ -544,7 could not find 7 old lines`
- `data/team.json: hunk @@ -563,7 could not find 7 old lines`
- `data/team.json: hunk @@ -995,7 could not find 7 old lines`
- `src/lib/phone-otp.ts: hunk @@ -98,11 could not find 11 old lines`
- `src/app/api/auth/phone/send-code/route.ts: hunk @@ -61,7 could not find 7 old lines`
- `src/components/SmsCodeFields.tsx: hunk @@ -46,7 could not find 7 old lines`
- `data/team.json: hunk @@ -5,13 could not find 13 old lines`
- `data/team.json: hunk @@ -1006,7 could not find 7 old lines`
- `data/team.json: hunk @@ -1012,7 could not find 7 old lines`
- `data/team.json: hunk @@ -1018,7 could not find 7 old lines`
- `data/team.json: hunk @@ -68,7 could not find 7 old lines`

## Python snippet errors

- JSONDecodeError: Expecting property name enclosed in double quotes: line 50 column 25 (char 1353)
- ImportError: blocked import struct
- ImportError: blocked import datetime
- JSONDecodeError: Expecting property name enclosed in double quotes: line 50 column 25 (char 1353)
- ImportError: blocked import PIL
- ImportError: blocked import PIL

