# Dingran Dai — Portfolio

Personal portfolio website built with **Next.js 16 + Tailwind CSS v4**, featuring project showcases across Computational Interaction, Architecture, Fabrication, and Urban design.

🌐 **Live:** [dingrandai.com](https://dingrandai.com) *(update with your actual URL)*

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 |
| Content | MDX (via next-mdx-remote) |
| Font | Poppins (Google Fonts) |
| Hardware projects | CircuitPython / Arduino |
| Deployment | Vercel |

---

## Design System

### Color Palette

| Role | Value | Usage |
|---|---|---|
| Accent / Primary | `#f97316` (orange-500) | Hover states, highlights, active nav |
| Background | `#ffffff` | Page background |
| Text primary | `#000000` | Headings, body |
| Text secondary | `#6b7280` (gray-500) | Subtitles, meta info |
| Surface | `#f9fafb` (gray-50) | Section backgrounds |

### Typography

**Font:** Poppins (weights 300–900)

| Element | Size (desktop) | Size (mobile) | Weight |
|---|---|---|---|
| Page title (hero) | `text-7xl / 8xl` | `text-4xl` | 700 |
| Section heading | `text-5xl / 6xl` | `text-3xl` | 700 |
| Project title | `text-2xl` | `text-xl` | 700 |
| Body | `text-base` | `text-sm` | 400 |
| Meta / label | `text-xs` | `text-xs` | 500 |

### Layout & Spacing

- **Horizontal padding:** `clamp(24px, 10vw, 144px)` — scales from 24px (mobile) to 144px (desktop)
- **Section vertical padding:** `pt-48 pb-48` on desktop, `pt-12 pb-16` on mobile
- **Grid:** 2-col on desktop (`lg:grid-cols-2`), single column on mobile
- **Project cards (desktop):** `w-[460px]` horizontal scroll
- **Project cards (mobile):** `grid-cols-2` with Intersection Observer color reveal

### Image Treatment

All project images default to **grayscale**, revealing color on interaction:
- **Desktop:** `hover:grayscale-0` — color on mouse hover
- **Mobile:** Intersection Observer — color fades in when the card scrolls 45% into viewport (one-shot, stays colored)

### Navigation

- Fixed top bar with blur backdrop (`bg-white/90 backdrop-blur-md`)
- Desktop: inline links with `gap-16`
- Mobile: hamburger menu (Menu/X icons from lucide-react)
- Active page highlighted in `orange-500`
- **Contact** links always point to `/#about#connect` (the Let's Connect section on the About page)

---

## Project Structure

```
portfolio-next/
├── app/
│   ├── page.tsx                        # Homepage
│   ├── about/page.tsx                  # About page
│   ├── projects/
│   │   ├── page.tsx                    # All Projects page
│   │   └── [category]/
│   │       ├── page.tsx                # Category listing page
│   │       └── [slug]/
│   │           ├── page.tsx            # Project detail (server)
│   │           └── ProjectDetailClient.tsx  # Project detail (client)
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── MobileProjectCard.tsx           # Mobile card with scroll color reveal
│   ├── PrevNext.tsx
│   └── mdx/
│       └── Blocks.tsx
│
├── hooks/
│   └── useInView.ts                    # Intersection Observer hook
│
├── content/
│   ├── projects_index.json             # ⚠️ Auto-generated — do not edit manually
│   └── projects/
│       ├── hci/
│       │   └── [slug]/
│       │       ├── meta.json
│       │       └── index.mdx
│       ├── architecture/
│       ├── fabrication/
│       └── urban-interaction/
│
├── public/
│   └── projects/
│       └── [category]/
│           └── [slug]/
│               ├── hero.jpg            # Cover image
│               ├── gallery-1.jpg      # Gallery images
│               ├── gallery-2.jpg
│               ├── portfolio-1.png    # Portfolio/process images
│               └── portfolio-2.png
│
├── lib/
│   ├── projects.ts                     # Project data loading
│   ├── mdx.ts                          # MDX rendering
│   └── site-config.ts                  # Site-wide config (name, social links)
│
└── scripts/
    ├── build_projects_index.py         # Step 1: generate index from meta.json files
    ├── update-project-images.js        # Step 2: fill heroUrl / galleryUrls into index
    ├── audit_meta.py                   # Check for missing fields
    └── sync_public_assets.py           # Sync assets
```

---

## Adding a New Project

### Step 1 — Create content files

```
content/projects/[category]/[slug]/
  meta.json
  index.mdx
```

**`meta.json` required fields:**

```json
{
  "slug": "my-project",
  "title": "My Project Title",
  "subtitle": "One-line description",
  "category": "hci",
  "tags": ["Tag1", "Tag2"],
  "year": 2025,
  "location": "New York, NY",
  "role": ["Designer", "Developer"],
  "type": "Individual Project",
  "featured": false,
  "order": 5,
  "hero": "hero.jpg",
  "video": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

| Field | Notes |
|---|---|
| `category` | One of: `hci` / `architecture` / `fabrication` / `urban-interaction` |
| `featured` | `true` → appears in homepage Selected Works scroll |
| `order` | Lower number = appears first within its category |
| `video` | Optional. Supports regular YouTube URLs and YouTube Shorts |

**`index.mdx` structure** (no frontmatter needed — use `##` headings):

```mdx
## Overview
Brief description of the project.

## Background
Context and motivation.

## Design / Technical Implementation
Core content.

## Outcome
What was built.

## Reflection
Key learnings and future directions.
```

### Step 2 — Add images

```
public/projects/[category]/[slug]/
  hero.jpg          ← required: cover image shown in cards and detail page
  gallery-1.jpg     ← shown in Gallery horizontal scroll / mobile grid
  gallery-2.jpg
  portfolio-1.png   ← shown in Portfolio sticky panel (right column, desktop)
  portfolio-2.png
```

**Naming rules:**
- Cover: exactly `hero.jpg` (or `.png`, `.webp`)
- Gallery: `gallery-1`, `gallery-2`, ... (sorted alphabetically)
- Portfolio/process: `portfolio-1`, `portfolio-2`, ... (sorted alphabetically)

### Step 3 — Rebuild the index

Run these two scripts in order every time you add or update a project:

```bash
python scripts/build_projects_index.py
node scripts/update-project-images.js
```

`build_projects_index.py` reads all `meta.json` files and generates `content/projects_index.json`.  
`update-project-images.js` scans `public/projects/` and writes `heroUrl`, `galleryUrls`, and `assets` into the index.

> ⚠️ Never edit `projects_index.json` by hand — it gets overwritten by the scripts.

---

## Updating Existing Content

### Edit project text
Open `content/projects/[category]/[slug]/index.mdx` and edit directly. No rebuild needed — Next.js reads MDX at request time.

### Change a project's metadata (title, year, featured status, etc.)
Edit `meta.json`, then re-run:
```bash
python scripts/build_projects_index.py
node scripts/update-project-images.js
```

### Replace images
Drop new files into `public/projects/[category]/[slug]/`, keeping the same naming convention, then run:
```bash
node scripts/update-project-images.js
```

### Update personal info (name, social links)
Edit `lib/site-config.ts`.

### Change site-wide colors or fonts
- Colors: search for Tailwind classes like `orange-500`, `gray-50` across the codebase
- Font: edit the `Poppins` import in `app/layout.tsx`

---

## Categories

| Slug | Display Name | Description |
|---|---|---|
| `hci` | Computational Interaction | HCI, physical computing, data-driven design |
| `architecture` | Architecture | Spatial design, architectural projects |
| `fabrication` | Fabrication | Digital fabrication, parametric design |
| `urban-interaction` | Urban | Urban interaction, spatial narratives |

To add a new category, update the `categoryInfo` object in `app/projects/[category]/page.tsx` and add it to the `categoryOrder` array in `app/projects/page.tsx`.

---

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm start
```

Open [http://localhost:3000](http://localhost:3000).

### Mobile preview
In Chrome: `F12` → click the 📱 device icon (top-left of DevTools), or press `Ctrl+Shift+M`.  
Recommended test sizes: iPhone 14 Pro Max (430px) and iPhone SE (375px).

---

## Deployment

The site deploys automatically to **Vercel** on every push to `main`.

Manual deploy:
```bash
vercel --prod
```

---

## Responsive Design Notes

The site uses two distinct layouts switched at the `md` (768px) breakpoint:

- **Mobile (`< md`):** Single column, vertical project stacks, hamburger nav, 2-col project grids, images reveal color on scroll
- **Desktop (`≥ md`):** Fixed 144px side margins, horizontal scroll carousels, two-column project detail layout, sticky right panel

The `clamp(24px, 10vw, 144px)` padding value handles the transition smoothly between breakpoints without needing explicit intermediate breakpoints.