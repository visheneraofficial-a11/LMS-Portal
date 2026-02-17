# Frontend Styling - Quick Reference Guide

## 🎨 Color Tokens
```css
--primary: #0f172a           /* Dark Navy - Main brand color */
--primary-light: #3b82f6     /* Bright Blue - Links & highlights */
--accent: #f59e0b            /* Gold - Call-to-action */
--success: #10b981           /* Green - Success messages */
--danger: #ef4444            /* Red - Errors */
```

## 🎯 Common Classes

### Buttons
```html
<button class="btn btn-primary btn-lg">Primary Button</button>
<button class="btn btn-secondary btn-md">Secondary Button</button>
<button class="btn btn-accent btn-sm">Accent Button</button>
<button class="btn btn-outline-white">Outline Button</button>
<button class="btn btn-ghost">Ghost Button</button>
```

### Cards
```html
<div class="card">
  <div class="card-header">Header Content</div>
  <div class="card-body">Body Content</div>
  <div class="card-footer">Footer Content</div>
</div>

<div class="feature-card">
  <div class="feature-icon blue"><i class="fas fa-star"></i></div>
  <h3>Feature Title</h3>
  <p>Feature description goes here</p>
</div>
```

### Typography
```html
<h1>Main Heading (800 weight)</h1>
<h2>Section Heading</h2>
<h3>Subsection Heading</h3>

<p class="text-muted">Muted text (gray-500)</p>
<p class="text-light">Light text (gray-400)</p>
<p class="text-dark">Dark text (gray-900)</p>

<span class="font-bold">Bold text</span>
<span class="font-semibold">Semibold text</span>
<span class="font-medium">Medium text</span>
```

### Spacing
```html
<!-- Margin Top -->
<div class="mt-xs">8px margin top</div>
<div class="mt-sm">16px margin top</div>
<div class="mt-md">24px margin top</div>
<div class="mt-lg">32px margin top</div>

<!-- Margin Bottom (mb-*) -->
<!-- Padding Horizontal (px-sm, px-md, px-lg) -->
<!-- Gap (gap-xs, gap-sm, gap-md, gap-lg, gap-xl) -->
```

### Layout
```html
<!-- Flexbox -->
<div class="d-flex flex-center">Centered flex</div>
<div class="d-flex flex-between">Space between</div>
<div class="d-flex flex-start">Align start</div>

<!-- Grid -->
<div class="d-grid">Grid layout</div>

<!-- Block & Inline -->
<div class="d-block">Block display</div>
<span class="d-inline">Inline display</span>
```

### Badges & Labels
```html
<span class="badge badge-primary">Primary Badge</span>
<span class="badge badge-accent">Accent Badge</span>
<span class="badge badge-success">Success Badge</span>
<span class="badge badge-danger">Danger Badge</span>
```

## 🎬 Animations
```css
@keyframes fadeInUp { /* Fade in with upward motion */ }
@keyframes slideInRight { /* Slide from left */ }
@keyframes bounce { /* Vertical bounce */ }
@keyframes pulse { /* Opacity pulse */ }
```

Usage with Data Attributes:
```html
<div data-aos="fade-up">Content fades in moving up</div>
<div data-aos="fade-left" data-aos-delay="100">Delayed fade</div>
<div data-aos="zoom-in">Zoom in effect</div>
```

## 📱 Responsive Breakpoints
```css
/* Tablets & Small Laptops */
@media (max-width: 1024px) { }

/* Tablets & Large Phones */
@media (max-width: 768px) { }

/* Small Phones */
@media (max-width: 576px) { }
```

## ⚡ Shadow Hierarchy
```css
--shadow-xs      /* Minimal shadow */
--shadow-sm      /* Small shadow */
--shadow         /* Standard shadow */
--shadow-lg      /* Large shadow - Card hover */
--shadow-xl      /* Extra large shadow */
--shadow-glow    /* Blue glow effect */
```

## 📐 Border Radius
```css
--radius-sm: 6px          /* Small corners */
--radius-md: 10px         /* Medium corners */
--radius-lg: 14px         /* Large corners */
--radius-xl: 20px         /* Extra large corners */
--radius-full: 9999px     /* Circular/pill */
```

## 🎨 Icon Usage
```html
<!-- Font Awesome Icons -->
<i class="fas fa-star"></i>
<i class="fas fa-users"></i>
<i class="fas fa-chart-line"></i>
<i class="fas fa-graduation-cap"></i>
<i class="fas fa-check-circle"></i>
<i class="fas fa-exclamation-circle"></i>
```

## 📝 Section Pattern
```html
<section class="section">
  <div class="container">
    <div class="section-header">
      <span class="section-badge">Badge</span>
      <h2>Section Title</h2>
      <p>Section description</p>
      <div class="section-divider"></div>
    </div>
    <!-- Content here -->
  </div>
</section>
```

## 🎪 Feature Card Pattern
```html
<div class="feature-card">
  <div class="feature-icon blue">
    <i class="fas fa-star"></i>
  </div>
  <h3>Card Title</h3>
  <p>Card description</p>
  <a href="#" class="feature-link">Learn More →</a>
</div>
```

Icon colors: `.blue`, `.purple`, `.green`, `.amber`, `.rose`, `.cyan`

## ✨ Pro Tips

1. **Use `clamp()`** for responsive typography
   ```css
   font-size: clamp(1.5rem, 4vw, 2.5rem);
   ```

2. **Always include transitions**
   ```css
   transition: all var(--transition);
   ```

3. **Use design tokens** instead of hardcoded colors
   ```css
   background: var(--primary-bg);
   border-color: var(--primary-light);
   ```

4. **Mobile-first approach**
   - Style for mobile first
   - Add larger screens with media queries

5. **Gradient patterns**
   ```css
   background: var(--gradient-primary); /* #0f172a to #3b82f6 */
   background: var(--gradient-accent);  /* #f59e0b */
   ```

## 📊 Login Page Classes

```html
<div class="login-page">      <!-- Main container -->
  <div class="login-sidebar"> <!-- Branded sidebar -->
  <div class="login-form-area"> <!-- Form area -->
    <div class="login-form-box">
      <div class="form-group">
        <label>Label Text</label>
        <input type="text" class="form-control">
      </div>
    </div>
  </div>
</div>
```

## 🔄 Transitions
```css
--transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);        /* Standard */
--transition-fast: 0.15s cubic-bezier(0.4, 0, 0.2, 1);  /* Fast */
--transition-smooth: 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);  /* Smooth */
--transition-slow: 0.6s cubic-bezier(0.4, 0, 0.2, 1);   /* Slow */
```

---

**Last Updated**: February 14, 2026
**Version**: 2.0 Professional Edition
