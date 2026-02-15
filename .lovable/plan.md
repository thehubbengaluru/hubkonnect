

# Pitch Deck Page for Azaan

## Overview
Create a new `/pitch` route with a polished, printable pitch deck page that presents the Community Connector concept. The page will be styled in the existing neo-brutalist aesthetic and include a "Print / Save as PDF" button that uses the browser's native `window.print()` for clean PDF export.

## Page Structure (Single scrollable page, paginated via CSS `page-break` for PDF)

### Slide 1 -- Title
- The Hub Bengaluru logo + "Community Connector"
- Tagline: "Turn your community into your collaborators"

### Slide 2 -- The Problem
- Members network by accident (hallway encounters, chance meetings)
- No structured way to discover complementary skills within the community
- Connections happen slowly and randomly

### Slide 3 -- The Solution
- Skill/interest-based matching algorithm with match percentages
- Intentional connection requests (10/day limit to maintain quality)
- Social info gated until connected (privacy-first)

### Slide 4 -- How It Works
- 3-step flow: Create Profile -> Get Matched -> Connect (reuse existing data)

### Slide 5 -- Key Features
- Smart matching, connection management, privacy controls, community-first design

### Slide 6 -- Community Impact (Stats)
- 500+ members, 120+ connections, 85% match rate (from existing landing page)

### Slide 7 -- What's Next
- Real-time messaging, admin analytics dashboard, event-based matching, community insights

### Slide 8 -- Call to Action
- "Let's launch this at The Hub" with a link to the live app

## Technical Details

### New files
- `src/pages/Pitch.tsx` -- The full pitch deck page component

### Modified files
- `src/App.tsx` -- Add `/pitch` route (public, no auth required)

### Print/PDF Strategy
- Use `@media print` CSS in the component to:
  - Hide the print button and navbar
  - Set each section to `page-break-after: always` for clean page breaks
  - Force white/cream background for print
- A "Save as PDF" button at the top triggers `window.print()`

### Styling
- Matches existing neo-brutalist aesthetic (Dela Gothic One headings, Space Mono body, hard borders, amber accents, zero border-radius)
- Each "slide" is a full-viewport-height section with centered content
- On screen: scrollable single page with clear section dividers
- On print: each section becomes one clean PDF page
