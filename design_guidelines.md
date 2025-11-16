# Real-Time Audio Transcription App - Design Guidelines

## Design Approach
**System-Based Approach**: Material Design principles for a utility-focused, mobile-first application emphasizing clarity, immediate feedback, and touch-optimized interactions.

## Design Philosophy
This is a function-first tool requiring instant comprehension and effortless operation. Visual hierarchy centers on recording state and real-time feedback with minimal cognitive load.

---

## Layout System

**Spacing Primitives**: Use Tailwind units of 3, 4, 6, 8, and 12 for consistent rhythm
- Component padding: p-4 to p-6
- Section spacing: gap-6 to gap-8
- Page margins: p-4 on mobile, p-8 on desktop

**Mobile-First Structure**:
```
Single-column vertical layout
Full viewport height utilization (min-h-screen)
Fixed bottom action bar for primary controls on mobile
Sticky header for status indicators
Scrollable transcription area in middle
```

**Responsive Breakpoints**:
- Mobile (base): Single column, full width components
- Tablet (md:): Centered max-w-2xl container
- Desktop (lg:): max-w-4xl with side padding

---

## Typography

**Font Family**: System font stack for performance
- Primary: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif

**Hierarchy**:
- App Title: text-xl font-semibold (mobile), text-2xl font-bold (desktop)
- Status Labels: text-sm font-medium uppercase tracking-wide
- Transcription Text: text-base leading-relaxed
- Timestamps: text-xs font-normal
- Micro-copy: text-xs

---

## Component Library

### Primary Record Button
- **Mobile**: 120px circular button, positioned center-bottom with mb-8
- **Desktop**: 140px circular, center-positioned
- **States**: 
  - Idle: subtle outline, microphone icon
  - Recording: filled, pulsing ring animation (single, slow pulse)
  - Transcribing: spinner overlay
- **Touch Target**: Minimum 48px, generous padding for accessibility

### Status Bar (Sticky Top)
- Height: h-16 on mobile, h-20 on desktop
- Display: Flex row with space-between alignment
- Contents:
  - Recording status badge (with dot indicator)
  - Webhook connection status
  - Audio level indicator (bars or waveform)
- Background: Semi-transparent with backdrop blur

### Transcription Display
- Container: Scrollable area, flex-1 height
- Each entry: Card-based with p-4, mb-3
- Contains:
  - Timestamp (top-right, small)
  - Transcribed text (prominent)
  - Delivery status icon (webhook sent/failed)
- Auto-scroll to latest entry
- Empty state: Centered message with icon

### Audio Visualizer
- Position: Below record button or in status bar
- Type: Real-time bar visualization (5-7 bars)
- Height: 40px to 60px
- Minimal, functional animation

### Permission Prompt Overlay
- Full-screen modal on first use
- Large microphone icon
- Clear explanation text
- "Allow Microphone" button (prominent)
- Dismissible only after permission granted

### Error States
- Inline alerts below status bar
- Icon + message + retry action
- Non-intrusive, auto-dismiss after 5s for non-critical

---

## Spacing & Rhythm

**Vertical Flow**:
- Status bar: Fixed top, h-16
- Transcription area: flex-1 with py-6
- Control area: Fixed bottom, pb-safe (for mobile notches)

**Component Gaps**:
- Status elements: gap-3
- Transcription cards: gap-4
- Button to visualizer: mt-6

---

## Interactions

**Recording Flow**:
1. Tap large button → Immediate visual state change
2. Audio visualizer activates
3. Status badge updates to "Recording"
4. Pause detection → Auto-transcribe → Send to webhook
5. Visual confirmation of webhook delivery
6. Continuous listening restarts automatically

**Feedback Mechanisms**:
- Haptic feedback on button press (mobile)
- Visual pulse during active recording
- Badge updates for each state transition
- Toast notification on webhook success/failure

**Gestures** (Mobile):
- Tap: Start/stop recording
- Pull-to-refresh: Reconnect webhook (if failed)
- Swipe transcript card: Delete individual entry

---

## Accessibility

- All interactive elements minimum 44px touch targets
- Clear focus indicators (2px outline offset)
- ARIA labels for all status indicators
- Screen reader announcements for state changes
- High contrast text throughout
- No color-only state indicators (use icons + text)

---

## Visual Hierarchy Priority

1. **Primary**: Record button (largest, central)
2. **Secondary**: Current status (prominent badges)
3. **Tertiary**: Live transcription (readable, scannable)
4. **Quaternary**: Historical transcriptions (archived cards)

---

## No Images Required
This utility application requires no hero images or decorative photography. All visual elements are functional UI components and icons.

---

## Performance Considerations

- Minimize animations to recording pulse only
- Virtual scrolling for long transcription lists
- Lazy load historical transcripts beyond 20 entries
- Debounce webhook calls to prevent flooding