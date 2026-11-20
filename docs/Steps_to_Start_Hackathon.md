1. collect all the websites links, messages in which the hackathon details are there
then copy all contents from the websites, & messgaes & and paste into claude & paste the prompt as follows:
also attach the files: `HK_AI_ONE_SHOT_CODEX.md`
````md
* plz analyze all the attached files + contents in very very highly detailed

so i have took part in this hackathon - and now decide me the bestest idea/problem_statement i can take - that we can build to maximize the chances of our winning!!

so claude - is this sol. app good - or do u have a more & more better fucking problem + solution app idea !! that can hep me win it!

i want to build an fucking-awesome mind-blowing app - that acutally helps the user !!

also follow The hk-system: universal files + repo template
location: `2-Plans\universal`:
repo template: `4-Projects\00-domino-sky`

what do you think? or do you have more and more better fucking-awesome mind-blowing jaw-dropping award-winning amazing idea!?
so please create/provided me with a fucking-awesome mind-blowing awrad-winning amazing very highly detailed new implementation plan for this!
then proceed in highly detailed - one phase at a time!!
````











* plz analyze this whole workspace in very very highly detailed - & my recent projects/work i did - then proceed to the work i want to do here

so i have took part in this hackathon - and now decide me the bestest idea/problem_statement i can take - that we can build to maximize the chances of our winning!!

so claude - is the sol. app good - or do u have a more & more better fucking problem + solution app idea !! that can hep me win it!

i want to build an fucking-awesome mind-blowing app - that acutally helps the user !!
also follow The hk-system: universal files + repo template
location: `2-Plans\universal`:
repo template: `4-Projects\00-domino-sky`

what do you think? or do you have more and more better fucking-awesome mind-blowing jaw-dropping award-winning amazing idea!?

so please create/provided me with a fucking-awesome mind-blowing awrad-winning amazing very highly detailed new implementation plan for this!

then proceed in highly detailed - one phase at a time!!
````


# Master AI Kickoff Prompt for New HK-System Apps

When creating or spawning a new application from this starter template (e.g., in `4-Projects/<app-name>`), provide the prompt below to your AI assistant (Antigravity, Claude Code, Cursor, Copilot, etc.).

---

## 📋 Copy-Paste Prompt for AI Agents

```markdown
You are an expert full-stack engineer and design virtuoso building a brand new application from the HK Universal Library v3 template (`00-domino-sky`).

### 🎯 Mission & App Identity
- **App Name**: [Insert App Name, e.g. "PausePoint", "AeroLedger", "NeuroFlow"]
- **Core Purpose**: [Describe in 1-2 sentences what this app does and who it protects/serves]
- **Target Route / Location**: `4-Projects/[directory-name]`

---

### 🚨 4 MANDATORY APP SPAWNING LAWS (Zero Tolerance)

#### 1. APP-DEDICATED HOMEPAGE LAW
- Completely replace `src/app/page.tsx`.
- The homepage MUST be a 100% dedicated showcase of THIS specific app.
- It must feature:
  - An interactive hero experience directly showing the app's core utility (e.g. interactive scanner, live previewer, simulator).
  - Domain-specific metric badges, feature breakdown, and clear Call-To-Action buttons leading to the app's working engine.
  - **PROHIBITION**: NEVER keep the starter template's generic AWS precision cards, QuoteMaker marketing copy, or manifesto plates.

#### 2. DEDICATED WORKING ENGINE LAW
- Transform `/studio` (or rename to `/workbench`, `/cockpit`, `/canvas`) into the dedicated functional engine for this app's unique workflow.
- Completely purge any old QuoteMaker artifacts (bento canvas, quote blocks, letterhead, quote-store).
- Implement a dedicated reactive state store (e.g. `[domain]-store.ts`) with realistic default presets, domain telemetry, and specialized action buttons.

#### 3. DESKTOP-RESPONSIVE VIEWPORT LAW (Edge-to-Edge Desktop Cockpit)
- **PROHIBITION**: NEVER trap desktop layouts inside narrow phone-like tubes (`max-w-xl`, `max-w-3xl mx-auto`, `max-w-4xl mx-auto`).
- Use the standard edge-to-edge desktop container:
  `w-full flex flex-col gap-10 sm:gap-14 pb-24`
- For working stages and studios, use a responsive 12-column layout:
  - Left / Main Column (`lg:col-span-7` or `8`): Primary workspace, interactive canvas, or evidence disassembler.
  - Right / Telemetry Column (`lg:col-span-5` or `4`): Live telemetry, verdict meters, instant actions, and quick routes.
- Respect desktop viewport widths (`2xl:max-w-[1600px]`, `px-4 sm:px-6 lg:px-8 xl:px-12`) with proper top/bottom/left/right breathing room.

#### 4. COMMERCIAL-SAFE TYPOGRAPHY & TURNKEY UI PRIMITIVES
- Use sanitized display typography with zero demo watermarks (digits 0-9 must render cleanly without triggering demo strings).
- Use pure SVG vector icons (Lucide or `@/components/ui/icons`). NEVER use raw emojis in UI buttons, tags, or navigation links.
- **ESLint Strict Rule**: Raw `<button>`, `<input>`, and `<textarea>` are FORBIDDEN in `src/app/**`. Always import and use:
  - `<Button variant size sound>` from `@/components/ui/Button`
  - `<Input>` and `<TextArea>` from `@/components/ui/Input`
  - `<GlassCard>` from `@/components/ui/GlassCard`

---

### 🛡️ VERIFICATION STANDARD
Before declaring any task or phase complete, you must run the HK Gate Ladder:
```bash
npm run check:fast
```
Ensure zero TypeScript errors, zero ESLint warnings, clean secret check, and clean token check.
```
