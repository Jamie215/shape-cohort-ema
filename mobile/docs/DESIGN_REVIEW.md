# Design review and decisions

Inspected both Figma files in the browser before implementation. Only the **Foundations** and **Components & Templates** pages of the design-system file were used. The separate design-system Screens page was not used as product scope.

Sources:

- [Healthcare Cost App design system](https://www.figma.com/design/PVXGazLP8MNDlxG2o3DMpY/Healthcare-Cost-App-Design-System?node-id=0-1)
- [EMA App screen designs](https://www.figma.com/design/glmh9qpEGxRF0zYxXYeJXg/EMA-App?node-id=0-1)

## Inventory

| EMA frame               | Observed node | Implemented behavior                                                             |
| ----------------------- | ------------- | -------------------------------------------------------------------------------- |
| Welcome                 | `19:221`      | Study illustration, welcome copy, Get Started                                    |
| Login                   | `19:308`      | Logo, email/password, visibility control, sign-in                                |
| Home                    | `1:3`         | Day progress, three check-ins, guide, tabs                                       |
| Questionnaire_Afternoon | `1:125`       | Header/back, 3-step progress, radio choices, 3-column choice grid, Back/Continue |
| Confirmation_Afternoon  | `1:218`       | Success artwork, thank-you, next check-in, Back to Home                          |
| Profile                 | `1:477`       | Account card, website, reminder toggle, insights, logout, tabs                   |

EMA frames are 402 × 874. Layouts use 32-pixel horizontal margins. Implementation uses flexible content, safe areas, scrolling and a 480-pixel maximum content width rather than fixed frame coordinates. Guide and Insights are additional destinations inferred from visible affordances; no detailed designs for those destinations were supplied.

Reusable primitives: typography; primary/secondary/text buttons; labeled input with focus/error states; password action; cards; radio and grid choices; progress; period/check-in rows; feedback notices; loading/retry view; shared screen/footer; discard dialog; stack and tab navigation. Unrelated expense-entry controls in the component page are outside the EMA screen scope.

## Tokens

Foundations define Inter: heading 600/24, page name 600/16, question 600/14, body 400/14, small 400/12, button 600/14. Line heights were not specified in the reviewed scale and are documented implementation assumptions (30/24/20/20/18/20).

4-pixel spacing base: 4, 8, 12, 16, 24, 32. Blue primitives: `#002F4A`, `#003D60`, `#005586`, `#0076BA`, `#008DDF`, `#DDE9F0`. Neutral primitives: `#000000`, `#535353`, `#E3E3E3`, `#F9F9F9`, `#FFFFFF`. Error `#880000`; success `#008839`. Role mappings and all implementation extensions live in `src/design/tokens.ts`.

Implementation extensions: line heights; control/card/pill radii; 48-pixel touch targets; semantic notice backgrounds; pastel period-icon colors. These are centralized assumptions, not claimed exported Figma variables. Icons use Feather equivalents; exact Iconoir vector exports were not acquired. Inter regular/semibold are bundled through leaf imports, and original raster assets are bundled locally.

## Conflicts and resolution

| Conflict                                                                | Decision                                                                                                                                                                                              |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| EMA actions are purple `#4D2785`; foundations use blue `#005586`        | Flagged before coding. User explicitly selected **design-system blue**. Action colors, focus, active tabs and progress use blue. Original purple artwork/logo remain unchanged.                       |
| EMA typography/layout labels differ from the system scale               | System Inter sizes take precedence; retain EMA hierarchy and layout. Text wraps according to device width and scaling.                                                                                |
| Border role swatch is gray, caption reads `#0076BA`                     | Use gray primitive `#E3E3E3` for default borders and blue for focus. Recorded as a source inconsistency rather than pretending both match.                                                            |
| Questionnaire contains “Option 1…”, lorem ipsum and only a Step 1 frame | User approved demo questions. Three coherent demo steps preserve the observed radio/grid structure; none are approved research instruments.                                                           |
| Guide thumbnail says afternoon 2:00 PM; Home says 1:00 PM               | Mock uses Home's 1:00 PM; backend schedule is authoritative in HTTP mode. Original thumbnail retained for fidelity. An updated thumbnail and an approved schedule are remaining content dependencies. |
| Day 3 of 7 appears with a longer progress fill in the design            | App calculates `3/7` (43%) and exposes the same value to accessibility services.                                                                                                                      |
| Small source options/buttons                                            | Minimum 48-pixel controls take precedence for mobile usability; questionnaire grows and scrolls on smaller screens.                                                                                   |

Original downloaded artwork is kept without AI edits or regeneration: `art-1.png` (welcome), `art-2.png` (guide), `art-3.png` (success), `empower.png` (logo). Source asset names are mapped in `assets/README.md`.

## Flow and states

Follow-up: the user requested the healthcare costing app's bottom navigation treatment. Its Home frame `62:2372` on the Screens page was inspected specifically for this update: pale-blue selected tile, blue top rule, filled active Home icon, gray inactive icons, and labels underneath. The shared `BottomNavigation` adapts that treatment to EMA's Home/Profile destinations, with safe-area padding and flexible text height. Ionicons supplies equivalent filled/outline navigation icons.

Welcome → Login → Home ↔ Profile. Available check-in → questionnaire steps 1–3 → save → confirmation → Home with completed status. Profile → Insights or website; guide card → written guide; logout → anonymous stack. Completed/upcoming rows are not startable. Android back/first-step Back prompts before discarding entered answers; saving blocks exit. No completed questionnaire remains in navigation after success.

States: session restoration; login idle/invalid/busy/error; study loading/error/retry/empty/ready; check-ins available/completed/upcoming; questionnaire loading/error/unanswered/answered/submitting/retry; confirmation success with next-schedule loading/error; preference updating/error/success; insights loading/error/empty/ready. Demo fixture switches make rare states reviewable.

Follow-up: Start follows the healthcare Home frame `62:2372` outlined action style (white fill, blue border, compact control radius, blue label and right chevron), retaining the larger row touch target. The guide thumbnail is now the poster for an inline configurable video player. An approved media source remains required; no unrelated sample video is substituted.

The user subsequently approved a placeholder video. `assets/study-placeholder.mp4` is an original 18-second silent guide created from the demo flow, labeled as placeholder content. It is used when no approved HTTPS video source is configured.

User-requested extension: Profile includes a Check-in times card using shared fields/buttons and centralized typography/spacing. No supplied frame specifies this form. Preferred times use local 24-hour HH:MM and first/second/third times within one 24-hour cycle, allowing midnight rollover; backend-approved time windows remain an integration dependency.

7 October 2026: User selected mockup option 1. Profile now uses an inline three-row time-picker card with shared Save/Cancel. Web uses browser time inputs; iOS/Android use the system time picker. Compact layouts stack labels/controls for narrow screens or larger text. Validation, retry, and remaining Home schedule updates are retained. Native picker/device behavior remains unverified.

Night-shift update: user requested First, Second, Third check-in labels across Home, Profile, questionnaire, confirmation and guide. Numbered icons replace daypart symbols. A neutral guide preview and placeholder video replace daypart copy in the original thumbnail. Preferences can cross midnight, e.g. 22:00 / 02:00 / 08:00. API keys remain compatible; production study-day rollover and real reminder scheduling require backend rules.
