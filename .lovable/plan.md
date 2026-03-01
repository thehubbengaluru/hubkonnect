

## Improve Onboarding: More Intuitive and Interactive

The current onboarding is functional but static -- plain forms, no animations, and no feedback as users progress. Here's a plan to make it feel polished and engaging while keeping the neo-brutalist design language.

---

### 1. Animated Step Transitions

Replace the instant step swap with a smooth slide/fade transition between steps. Each step slides in from the right when advancing and from the left when going back, giving a clear sense of direction.

### 2. Interactive Progress Stepper

Replace the plain progress bar with a **clickable step indicator** showing all 4 steps as labeled nodes (dots or squares in the brutalist style). Completed steps get a checkmark, the current step pulses with the accent color, and users can click back to completed steps to edit.

### 3. Live Profile Preview Card (Step 1)

As users fill in their name, bio, and photo on Step 1, show a **mini live-preview card** on the side (or below on mobile) that mirrors exactly how their profile will look to others. This gives instant visual feedback and motivates completion.

### 4. Micro-interactions and Feedback

- **Pill/card selection**: Add a satisfying scale bounce animation when selecting skills, interests, and member types (instead of just a color change).
- **Counter animations**: Animate the selected count numbers (e.g., "3/5") with a brief pop when they change.
- **Bio character counter**: Add a color-gradient progress ring around the character count that fills as the user types.

### 5. Encouraging Completion Nudges

- Show a small motivational line below the progress bar that changes per step: "Great start!", "Almost there!", "One more step!", "Let's go!"
- On Step 3 (Skills & Interests), show a subtle message like "People with 5 skills get 3x more connections" to encourage full selection.

### 6. Confetti on Profile Complete

Enhance the `ProfileComplete` screen with a brief confetti burst animation (CSS-only, no library needed) before transitioning to the feed, making the completion feel celebratory.

---

### Technical Details

**Files to create:**
- `src/components/onboarding/StepTransition.tsx` -- wrapper component using CSS transitions for slide/fade between steps
- `src/components/onboarding/StepIndicator.tsx` -- clickable 4-step progress indicator replacing the plain progress bar

**Files to modify:**
- `src/pages/Onboarding.tsx` -- integrate StepTransition wrapper, StepIndicator, and motivational nudge text
- `src/components/onboarding/OnboardingStep1.tsx` -- add live profile preview card below the form fields
- `src/components/onboarding/OnboardingStep3.tsx` -- add bounce animation on pill selection, animated counter
- `src/components/onboarding/ProfileComplete.tsx` -- add CSS confetti animation
- `src/index.css` -- add keyframe animations for bounce, confetti, and slide transitions

**Approach:**
- All animations use CSS keyframes and Tailwind classes (no external animation libraries)
- Step transitions managed via React state + CSS `transition` / `animation` properties
- Live preview card uses the same data object already passed as props
- Fully responsive -- preview card stacks below form on mobile
