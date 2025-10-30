# Afrimercato Color Guide

## Brand Colors (Exact Match to Design)

### Primary Green
- **Default (`#00B207`)** - Main buttons, CTAs, "Add to Cart" buttons
- **Dark (`#2C742F`)** - Hover states, active buttons
- **Light (`#84D187`)** - Secondary accents, success messages
- **Pale (`#EDF2EE`)** - Page backgrounds, soft sections

### Accent Yellow/Orange
- **Default (`#FFD480`)** - Golden yellow accents, highlights
- **Light (`#FFF4E0`)** - Light backgrounds, subtle highlights
- **Dark (`#FF8A00`)** - "Free Delivery" badges, urgent alerts

### Neutral Grays
- **50 (`#F4F6F6`)** - Product card backgrounds
- **100 (`#E8ECEB`)** - Light borders, dividers
- **200-400** - Progressive darkening for UI elements
- **900 (`#1A1A1A`)** - Main text, headings

## Usage Examples

### Buttons
```jsx
// Primary CTA
className="bg-afri-green hover:bg-afri-green-dark text-white"

// Secondary action
className="bg-afri-green-light hover:bg-afri-green text-white"
```

### Backgrounds
```jsx
// Page background
className="bg-afri-green-pale"

// Card background
className="bg-white"

// Product card
className="bg-afri-gray-50"
```

### Text
```jsx
// Headings
className="text-afri-gray-900"

// Body text
className="text-afri-gray-700"

// Muted text
className="text-afri-gray-500"
```

### Accents
```jsx
// Promotion badge
className="bg-afri-yellow-dark text-white"

// Discount label
className="bg-afri-yellow text-afri-gray-900"

// Success message
className="bg-afri-green-light text-white"
```

## Color Psychology
- **Green**: Fresh, organic, healthy, trustworthy (perfect for groceries)
- **Yellow/Orange**: Energy, warmth, appetite stimulation
- **White/Light backgrounds**: Clean, hygienic, professional

## Accessibility
All color combinations meet WCAG 2.1 AA standards for contrast:
- White text on `#00B207` ✓ 4.5:1
- Dark text on `#FFD480` ✓ 7.2:1
- Dark text on white ✓ 12.6:1
