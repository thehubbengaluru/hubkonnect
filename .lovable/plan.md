

# Community Connector - Implementation Plan

## Overview
A smart networking platform for The Hub Bengaluru that matches community members based on skills, interests, and goals. Members create profiles, get AI-powered match suggestions, and send connection requests — turning random encounters into intentional collaborations.

---

## Phase 1: Foundation & Design System

### Brand & Theme Setup
- Implement The Hub's color palette (Deep Blue #1A2B49, Vibrant Orange #FF6B35, Warm Yellow #FFB84D, Fresh Teal #00C2A8)
- Set up Inter font for headings/body and Space Grotesk for accents
- Create concentric circle SVG background patterns representing "Connecting the dots"
- Establish consistent border-radius (12px cards, 8px buttons, 24px avatars) and shadow system

### Core Layout
- Fixed navigation bar with logo, For You, Connections, and Profile links
- Mobile-responsive bottom navigation
- Page transition animations

---

## Phase 2: Authentication & Database (Supabase)

### User Authentication
- Email/password signup and login
- Protected routes — login required to view any profiles

### Database Schema
- **profiles** table: name, bio (150 chars), photo URL, instagram, linkedin, member type (co-living/co-working/event attendee/follower)
- **skills**, **interests**, **looking_for_options** reference tables with predefined data
- **user_skills**, **user_interests**, **user_looking_for** junction tables
- **connections** table: requester, receiver, status (pending/accepted/declined), message, timestamps
- Row-Level Security policies so users can only edit their own data and view public profiles
- Profile photo uploads via Supabase Storage

---

## Phase 3: Onboarding Flow

### 3-Step Profile Setup
1. **Basics** — Photo upload, full name, bio (with character counter), member type selection (pill buttons)
2. **Skills & Interests** — Multi-select tag picker from predefined lists (Design, Development, Content, Marketing, etc.) with search/filter
3. **Looking For** — Multi-select: Collaborators, Mentors, Opportunities, Friends, Feedback, Co-founders, Learning Partners

- Progress bar at top showing current step
- Skip option available, with "Next" to proceed
- Target: complete in under 2 minutes

---

## Phase 4: Smart Matching ("For You" Feed)

### Match Algorithm
- Weighted scoring: Shared Skills (×2) + Shared Interests (×1.5) + Complementary "Looking For" (×3) + Same Member Type (×1) + Activity Bonus (×0.5)
- Normalize to percentage (e.g., "85% Match")
- Display match reasons: "Shared: Photography, Design • Both looking for collaborators"

### For You Page
- Hero section with concentric circle background: "Your next collaboration is already here"
- Filter tabs: All, Co-living, Co-working, Events
- Sort options: Best Match, Recent, Most Active
- Grid of profile cards (4 columns desktop, 1 column mobile)

### Profile Card Design
- Circular profile photo, name, handle, bio (2 lines)
- Skills shown as orange pill tags
- Teal match percentage badge
- Match reason text
- "Connect" and "Not Now" action buttons

---

## Phase 5: Connection System

### Connection Requests
- "Connect" button opens modal with optional message (200 chars): "Why do you want to connect?"
- Rate limit: max 10 requests per day
- Notification indicators in nav bar

### Connection Management Pages
- **Sent Requests** — Pending outbound requests with status
- **Received Requests** — Inbound requests with Accept/Decline buttons
- **My Connections** — All accepted connections with profile details and contact info (Instagram/LinkedIn links visible after connection)

### Connection Flow
- Request sent → Receiver sees notification → Accept/Decline → If accepted, both see each other in "My Connections" with social links

---

## Phase 6: Profile & Discovery

### Public Profile Page
- Full profile view: photo, bio, all skills/interests/looking for, social links (if connected)
- Match score shown if viewing someone else's profile
- "Connect" button if not yet connected

### Member Directory
- Searchable directory with filters by skills, interests, member type, and looking for
- Card grid view with match scores

---

## Phase 7: Admin Dashboard

### Community Analytics (for Hub team)
- Total members count by type (co-living, co-working, event, follower)
- Connections made: total + weekly trend line chart
- Top connectors leaderboard
- "Lonely members" list: profiles with 0 connections to reach out to
- Skills distribution visualization
- Connection acceptance rate
- Active users (weekly/monthly)

---

## Key Design Details

- **Mobile-first** responsive design throughout
- **Concentric circle patterns** as decorative backgrounds on hero sections and empty states
- **The Hub's brand colors** applied consistently: Deep Blue for primary actions, Orange for accents/tags, Teal for match badges
- **Clean, minimal UI** — no clutter, generous whitespace
- **Privacy**: profiles only visible to logged-in users

