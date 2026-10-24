# UI, UX, and Styling Constraints

This document defines design system constraints, styling rules, accessibility standards, and component composition patterns for the application.

---

## 1. Tailwind CSS 4 Architecture

This project is built on **Tailwind CSS v4** with the Vite compiler plugin (`@tailwindcss/vite`).

### Core Rules:

1. **No `tailwind.config.js`**:
    - Configuration is defined natively in CSS via `@import 'tailwindcss';` in `app/assets/css/main.css`.
2. **CSS Custom Properties (HSL Tokens)**:
    - All colors and theme boundaries are declared in CSS custom properties using HSL format (without the `hsl()` wrapper inside the variable value to allow opacity manipulation).
    - Variables include: `--background`, `--foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--card`, `--border`, `--ring`, `--radius`.
    - Brand color standard: TailAdmin Emerald Green (`--primary: 134 61% 39%`).
3. **Dark Mode Variant**:
    - Declared via `@custom-variant dark (&:where(.dark, .dark *));`.
    - Dark theme is toggled by adding/removing the `dark` class on the `<html>` root element.
    - All UI elements must specify both light and dark mode classes (e.g. `bg-background text-foreground dark:bg-card`).

---

## 2. shadcn-vue Primitives (`app/components/ui/`)

Reusable atomic UI components are modeled on shadcn-vue and built on top of **Radix Vue** unstyled primitives.

### Component Guidelines:

1. **Component Location**:
    - Place all atomic primitives in `app/components/ui/<component-name>/`.
    - Use `index.ts` to export compound components where applicable (e.g. `Dialog`, `DialogContent`, `DialogHeader`, `DialogFooter`).
2. **Variant Management (`cva`)**:
    - Use `class-variance-authority` (`cva`) for styling variants (e.g., button variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`).
3. **Class Merging Utility (`cn`)**:
    - Always wrap dynamic and user-provided classes with `cn(...)` from `app/lib/utils.ts` (`clsx` + `tailwind-merge`) to avoid Tailwind utility conflicts.

```vue
<script setup lang="ts">
import { cn } from '~/lib/utils'
import { buttonVariants } from './button'

const props = defineProps<{
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost'
    size?: 'default' | 'sm' | 'lg' | 'icon'
    class?: string
}>()
</script>

<template>
    <button :class="cn(buttonVariants({ variant, size }), props.class)">
        <slot />
    </button>
</template>
```

---

## 3. Typography & Icons

1. **Font Family**:
    - Primary typeface is **Outfit** (weights 300 to 800), configured via Google Fonts and `@nuxt/fonts`.
    - Standard body styling: `font-family: 'Outfit', sans-serif; -webkit-font-smoothing: antialiased;`.
2. **Icons**:
    - Standard icon library is **`lucide-vue-next`**.
    - Always import icons directly by name (e.g., `import { User, LogOut, Check, AlertCircle } from 'lucide-vue-next'`).
    - Standard sizes: `h-4 w-4` for button/table icons; `h-5 w-5` for headers; `h-8 w-8` for prominent indicators.

---

## 4. Accessibility & Interaction (WCAG 2.1 AA)

All user-facing components must comply with accessibility baselines:

1. **Keyboard Navigability**:
    - All modals/dialogs must support `Escape` key dismissal and focus trapping inside the active dialog.
    - Interactive elements must have clear `:focus-visible` ring indicators (`ring-2 ring-primary ring-offset-2`).
2. **ARIA Standards**:
    - Form controls must have associated `<Label>` elements with matching `for` and `id` attributes.
    - Icon-only buttons must supply an `aria-label` or `<span class="sr-only">Description</span>`.
    - Error messages must be linked to inputs using `aria-describedby` and inputs must reflect `aria-invalid="true"`.
3. **Contrast Ratios**:
    - Text elements must maintain a minimum contrast ratio of 4.5:1 against their backgrounds in both light and dark modes.

---

## 5. Toast Notifications & Feedback (`useToast`)

- Transient user feedback (success confirmations, error alerts) must use the application's central toast system (`app/components/ui/toast/` and `useToast()` composable).
- Do not use native browser `alert()` or `confirm()`. Use the shadcn `<Dialog>` for confirmations and `toast({ title, description, variant })` for notifications.
