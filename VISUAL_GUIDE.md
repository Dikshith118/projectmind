# 🎨 Visual Guide - AI Project Onboarding

## 📸 What You'll See

### 1. Projects Page - New Project Button
```
┌─────────────────────────────────────────────────────┐
│  ProjectMind - AI Productivity Copilot              │
│                                                      │
│  Build projects with an AI copilot.                 │
│  Create long-term goals, generate daily task plans  │
│                                                      │
│                          [＋ New Project] ← Click   │
└─────────────────────────────────────────────────────┘
```

---

### 2. Enhanced Project Creation Form

```
┌─────────────────────────────────────────────────────┐
│  Create new project                            [×]  │
│  Describe your goal and AI will generate a plan     │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Project name                                        │
│  ┌────────────────────────────────────────────┐    │
│  │ e.g. Portfolio Website                      │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  Deadline                                            │
│  ┌────────────────────────────────────────────┐    │
│  │ 2026-05-20                                  │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  Project Brief                          ← NEW LABEL │
│  ┌────────────────────────────────────────────┐    │
│  │ Describe your project, requirements,       │    │
│  │ features, workflows, architecture, APIs,   │    │
│  │ goals, and expected outcomes...            │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  Upload Supporting Documents (Optional) ← NEW       │
│  ┌────────────────────────────────────────────┐    │
│  │              📁                             │    │
│  │   Drag & drop or click to upload           │    │
│  │   Supports PDF, DOCX, TXT, PPTX • Max 10MB │    │
│  │                                             │    │
│  │   [PDF] [DOCX] [TXT] [PPTX]                │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  Hours available per day                             │
│  ┌──────┐                                           │
│  │  2   │                                           │
│  └──────┘                                           │
│                                                      │
│  [Generate Plan with AI]  [Cancel]                  │
└─────────────────────────────────────────────────────┘
```

---

### 3. File Upload - Drag & Drop Active

```
┌─────────────────────────────────────────────────────┐
│  Upload Supporting Documents (Optional)              │
│  ┌────────────────────────────────────────────┐    │
│  │              📁                             │    │
│  │   ✨ Drop your file here ✨               │    │ ← Glowing
│  │   Supports PDF, DOCX, TXT, PPTX • Max 10MB │    │
│  │                                             │    │
│  │   [PDF] [DOCX] [TXT] [PPTX]                │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

---

### 4. File Uploaded - Preview

```
┌─────────────────────────────────────────────────────┐
│  Upload Supporting Documents (Optional)              │
│  ┌────────────────────────────────────────────┐    │
│  │  📄  requirements.pdf                  [×] │    │
│  │      2.3 MB                                 │    │
│  │  ─────────────────────────────────────────  │    │
│  │  ✨ AI will analyze this document to       │    │
│  │     generate smarter task plans             │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  📝 Upload project requirements, architecture docs, │
│     API specs, or feature descriptions.             │
└─────────────────────────────────────────────────────┘
```

---

### 5. Loading State - AI Processing

```
┌─────────────────────────────────────────────────────┐
│  [⚙️ AI is analyzing and generating your plan...]  │ ← Spinning
└─────────────────────────────────────────────────────┘
```

---

### 6. AI Insights Display - Success!

```
┌─────────────────────────────────────────────────────┐
│  ✨  AI Analysis Complete                           │
│      Your project plan has been generated with      │
│      intelligent insights                           │
│                                                      │
│  Detected Technologies:                              │
│  [React] [Node.js] [MongoDB] [Express] [JWT]       │
│  [Tailwind CSS] [Stripe]                            │
│                                                      │
│  Complexity Level:                                   │
│  Medium                                              │
│                                                      │
│  Key Milestones:                                     │
│  • Day 3: Core authentication complete              │
│  • Day 7: MVP features ready                        │
│  • Day 14: Testing and deployment                   │
│                                                      │
│  Redirecting to projects list...                    │
└─────────────────────────────────────────────────────┘
```

---

### 7. Projects List - New Project Created

```
┌─────────────────────────────────────────────────────┐
│  📁  E-commerce Platform          [on-track]        │
│      AI-managed project                             │
│                                                      │
│      Build an e-commerce platform with user         │
│      authentication, product catalog...             │
│                                                      │
│      ✅ Project is on track                         │
│                                                      │
│      Click to open dashboard              Open →   │
└─────────────────────────────────────────────────────┘
```

---

## 🎨 Color Scheme

### Upload Zone (Empty)
- Background: `bg-slate-950/40`
- Border: `border-white/10` (dashed)
- Hover: `border-cyan-400/30`

### Upload Zone (Dragging)
- Background: `bg-cyan-500/10`
- Border: `border-cyan-400/50`
- Scale: `scale-[1.02]`

### File Preview
- Background: `bg-cyan-500/5`
- Border: `border-cyan-400/20`
- Icon background: `bg-cyan-500/10`

### AI Insights Panel
- Background: `from-cyan-500/10 to-blue-500/10`
- Border: `border-cyan-400/20`
- Tech badges: `bg-cyan-500/15 text-cyan-200`

---

## 🎭 Animations

### Drag & Drop
```
Normal → Hover → Dragging
  ↓        ↓         ↓
Scale   Border    Glow
1.0     Cyan      Cyan
        +10%      +20%
```

### Loading Spinner
```
⚙️ → ⚙️ → ⚙️ → ⚙️
Rotating 360° continuously
```

### Insights Panel
```
Fade in from bottom
Duration: 300ms
Auto-dismiss: 5000ms
Fade out to top
```

---

## 📱 Responsive Behavior

### Desktop (>1024px)
- Form: 2 columns for name/deadline
- Upload zone: Full width
- Insights: Full width with badges

### Tablet (768px - 1024px)
- Form: 2 columns maintained
- Upload zone: Full width
- Insights: Stacked layout

### Mobile (<768px)
- Form: Single column
- Upload zone: Compact
- Insights: Vertical stack
- Buttons: Full width

---

## 🎯 Interactive Elements

### Clickable Areas
1. **Upload Zone** → Opens file browser
2. **Remove File (×)** → Clears selected file
3. **Generate Button** → Submits form
4. **Cancel Button** → Closes form

### Hover Effects
- Upload zone: Border color change
- Buttons: Scale + color shift
- File preview: Subtle glow

### Focus States
- All inputs: Cyan ring
- Upload zone: Cyan border
- Buttons: Cyan outline

---

## 🔤 Typography

### Headings
- Form title: `text-2xl font-black`
- Section labels: `text-sm font-semibold`

### Body Text
- Descriptions: `text-sm text-slate-400`
- Placeholders: `text-slate-500`
- Insights: `text-sm text-slate-300`

### Badges
- Tech stack: `text-xs font-medium`
- Status: `text-xs font-semibold`

---

## 🎪 User Flow Visualization

```
Start
  ↓
Click "New Project"
  ↓
Fill Project Name ────────────────┐
  ↓                                │
Fill Project Brief                 │
  ↓                                │
(Optional) Upload Document         │ Form
  ↓                                │ Filling
Set Deadline                       │
  ↓                                │
Set Hours/Day ─────────────────────┘
  ↓
Click "Generate Plan with AI"
  ↓
[Loading Spinner] ← AI Processing
  ↓
[AI Insights Panel] ← 5 seconds
  ↓
Auto-redirect
  ↓
Projects List (New project visible)
  ↓
End
```

---

## 🎨 Design Tokens

### Spacing
- Form padding: `p-6` (24px)
- Input padding: `px-4 py-3` (16px, 12px)
- Section gaps: `gap-5` (20px)

### Borders
- Radius: `rounded-2xl` (16px)
- Width: `border` (1px)
- Dashed: `border-dashed` (2px)

### Shadows
- Cards: `shadow-lg shadow-cyan-900/30`
- Buttons: `shadow-xl shadow-cyan-900/30`
- Hover: `shadow-2xl`

---

## 🌟 Special Effects

### Glassmorphism
```css
background: rgba(26, 31, 53, 0.4)
backdrop-filter: blur(24px)
border: 1px solid rgba(148, 163, 184, 0.08)
```

### Gradient Buttons
```css
background: linear-gradient(to right, #06b6d4, #2563eb)
hover: linear-gradient(to right, #22d3ee, #3b82f6)
```

### Glow Effects
```css
box-shadow: 0 0 40px rgba(6, 182, 212, 0.15)
```

---

## 📊 File Type Icons

| Type | Icon | Color |
|------|------|-------|
| PDF  | 📄   | Red   |
| DOCX | 📝   | Blue  |
| TXT  | 📃   | Gray  |
| PPTX | 📊   | Orange|

---

## ✨ Micro-interactions

1. **Button Click**
   - Scale: 0.95
   - Duration: 100ms

2. **File Drop**
   - Scale: 1.02 → 1.0
   - Duration: 200ms

3. **Insights Appear**
   - Opacity: 0 → 1
   - Transform: translateY(20px) → 0
   - Duration: 300ms

4. **Badge Hover**
   - Scale: 1.05
   - Duration: 150ms

---

This visual guide shows exactly what users will see and experience with the new AI-powered project onboarding system!
