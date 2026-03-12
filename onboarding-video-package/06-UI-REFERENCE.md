# AFRIMERCATO UI REFERENCE GUIDE

## Screenshots & Elements to Capture for Video Production

This document lists all UI elements you need to screenshot from the Afrimercato app for your onboarding videos.

---

## VENDOR VIDEO - REQUIRED SCREENSHOTS

### 1. Registration & Onboarding

| Screenshot | Page/Route | Key Elements to Show |
|------------|------------|---------------------|
| Landing Page | `/` | "Partner With Us" button, navigation |
| Partner Page | `/partner` | Benefits, "Get Started" CTA |
| Registration Form | `/register` | Email, password fields, submit button |
| Vendor Onboarding | `/vendor/onboarding` | Store setup form fields |
| Pending Approval | `/vendor/pending-approval` | Waiting message, clock icon |

### 2. Vendor Dashboard

| Screenshot | Page/Route | Key Elements to Show |
|------------|------------|---------------------|
| Dashboard Overview | `/dashboard` | Full page with all cards visible |
| KPI Cards Close-up | `/dashboard` | Performance, Revenue, Orders, Customers cards |
| Sidebar Navigation | `/dashboard` | All menu items: Dashboard, Products, Orders, Reports, Subscription, Settings |
| Charts Section | `/dashboard` | Revenue chart, Orders chart, Category pie chart |
| Time Range Selector | `/dashboard` | 7d, 30d, 90d, 1y buttons |
| Greeting Section | `/dashboard` | "Good Morning/Afternoon, [Name]!" with avatar |

### 3. Products Management

| Screenshot | Page/Route | Key Elements to Show |
|------------|------------|---------------------|
| Products List (Empty) | `/vendor/products` | Empty state with "Add Product" button |
| Products List (With Items) | `/vendor/products` | Table with multiple products |
| Add Product Button | `/vendor/products` | Green "+ Add Product" button highlighted |
| Product Creation Form | `/vendor/products` | Modal with all form fields |
| Form: Name & Description | Modal | Product name, description textarea |
| Form: Category Dropdown | Modal | Category dropdown expanded |
| Form: Price & Unit | Modal | Price input, unit dropdown |
| Form: Stock Quantity | Modal | Stock number input |
| Form: Image Upload | Modal | Drag-and-drop area, uploaded images |
| Success Toast | `/vendor/products` | "Product created successfully" message |
| Product Row in Table | `/vendor/products` | Single product with image, name, price, stock, actions |
| Edit/Delete Buttons | `/vendor/products` | Action buttons on product row |
| Bulk Selection | `/vendor/products` | Multiple products selected with checkboxes |
| Bulk Actions Dropdown | `/vendor/products` | Dropdown menu with bulk options |

### 4. Orders Management

| Screenshot | Page/Route | Key Elements to Show |
|------------|------------|---------------------|
| Orders List | `/orders` | Multiple order cards with different statuses |
| Order Card - Pending | `/orders` | Yellow "Pending" badge |
| Order Card - Confirmed | `/orders` | Blue "Confirmed" badge |
| Order Card - Delivered | `/orders` | Green "Delivered" badge |
| Order Details Modal | `/orders` | Full order details popup |
| Order Items List | Modal | Products, quantities, prices |
| Customer Info | Modal | Name, address, phone |
| Status Update Buttons | Modal | Status change options |
| Order Filters | `/orders` | Status filter dropdown |

### 5. Reports & Settings

| Screenshot | Page/Route | Key Elements to Show |
|------------|------------|---------------------|
| Reports Page | `/reports` | Revenue charts, date filters |
| Export Button | `/reports` | Export/download option |
| Settings Page | `/settings` | Store profile form |
| Settings: Store Info | `/settings` | Name, description, category fields |
| Settings: Images | `/settings` | Logo and cover image upload |
| Settings: Contact | `/settings` | Phone, address fields |
| Save Button | `/settings` | Green save/update button |

---

## CUSTOMER VIDEO - REQUIRED SCREENSHOTS

### 1. Registration & Login

| Screenshot | Page/Route | Key Elements to Show |
|------------|------------|---------------------|
| Landing Page | `/` | Hero section, featured stores |
| Sign Up Button | `/` | Navigation "Sign Up" link |
| Registration Page | `/register` | Name, email, password fields |
| Login Page | `/login` | Email, password, login button |
| Profile Page | `/profile` | User info, address fields |

### 2. Store Discovery

| Screenshot | Page/Route | Key Elements to Show |
|------------|------------|---------------------|
| Landing Page - Stores Section | `/` | Featured stores carousel |
| Location Indicator | `/` | "Delivering to: [Location]" |
| Browse Stores Button | `/` | CTA to stores page |
| Stores Listing Page | `/stores` | Grid of store cards |
| Store Card | `/stores` | Logo, name, category, rating, distance |
| Search Bar | `/stores` | Store search input |
| Category Filters | `/stores` | Filter buttons/dropdown |
| Single Store Page | `/store/:id` | Store header, product grid |
| Store Header | `/store/:id` | Logo, cover image, description |

### 3. Product Browsing

| Screenshot | Page/Route | Key Elements to Show |
|------------|------------|---------------------|
| Products Page | `/products` | Full product grid |
| Product Card | `/products` | Image, name, price, rating, Add to Cart |
| Search Bar | `/products` | Product search input |
| Category Filters | `/products` | Category filter options |
| Sort Dropdown | `/products` | Sort by price/popularity |
| Product Detail Page | `/product/:id` | Full product view |
| Product Images Gallery | `/product/:id` | Multiple product images |
| Product Description | `/product/:id` | Full description text |
| Quantity Selector | `/product/:id` | - / + buttons with quantity |
| Add to Cart Button | `/product/:id` | Green "Add to Cart" button |
| Reviews Section | `/product/:id` | Customer reviews and ratings |
| Vendor Link | `/product/:id` | "Sold by [Vendor]" link |

### 4. Shopping Cart

| Screenshot | Page/Route | Key Elements to Show |
|------------|------------|---------------------|
| Cart Icon (Empty) | Navigation | Cart icon with (0) badge |
| Cart Icon (With Items) | Navigation | Cart icon with number badge |
| Add to Cart Animation | Any product | Item flying to cart (if possible) |
| Shopping Cart Page | `/cart` | Full cart view |
| Cart Item Row | `/cart` | Product image, name, price, quantity |
| Quantity Buttons | `/cart` | - / + adjustment buttons |
| Remove Button | `/cart` | Trash/remove icon |
| Cart Subtotal | `/cart` | Subtotal amount |
| Proceed to Checkout | `/cart` | Green checkout button |
| Empty Cart State | `/cart` | "Your cart is empty" message |

### 5. Checkout Process

| Screenshot | Page/Route | Key Elements to Show |
|------------|------------|---------------------|
| Checkout Step 1 | `/checkout` | Address form, progress indicator |
| Progress Bar | `/checkout` | Step 1 of 3 highlighted |
| Address Fields | `/checkout` | Name, phone, street, city, postcode |
| Special Instructions | `/checkout` | Optional notes field |
| Continue Button | `/checkout` | "Continue" to next step |
| Checkout Step 2 | `/checkout` | Payment form |
| Card Input Fields | `/checkout` | Card number, expiry, CVC |
| Order Summary Sidebar | `/checkout` | Items, subtotal, delivery fee, total |
| Delivery Fee Note | `/checkout` | "Free delivery over £50" |
| Save Card Checkbox | `/checkout` | "Save for future purchases" |
| Checkout Step 3 | `/checkout` | Review page |
| Address Summary | `/checkout` | Delivery address displayed |
| Payment Summary | `/checkout` | Card ending in **** |
| Order Items Summary | `/checkout` | Final item list |
| Place Order Button | `/checkout` | Green "Place Order" button |

### 6. Order Confirmation & Tracking

| Screenshot | Page/Route | Key Elements to Show |
|------------|------------|---------------------|
| Order Confirmation | `/order-confirmation/:id` | Success checkmark, order number |
| Confirmation Details | `/order-confirmation/:id` | Estimated delivery, items |
| Track Order Button | `/order-confirmation/:id` | Link to tracking page |
| Order Tracking Page | `/track-order/:id` | Full tracking view |
| Status Timeline | `/track-order/:id` | Vertical timeline with statuses |
| Status: Confirmed | Timeline | Checkmark, timestamp |
| Status: Preparing | Timeline | Active/pending indicator |
| Status: Out for Delivery | Timeline | Highlighted current status |
| Delivery Map | `/track-order/:id` | Map with rider location |
| Rider Info Card | `/track-order/:id` | Rider name, photo, contact |
| Status: Delivered | Timeline | Final delivery confirmation |
| Rate & Review Prompt | `/track-order/:id` | Review modal/buttons |

### 7. Additional Features

| Screenshot | Page/Route | Key Elements to Show |
|------------|------------|---------------------|
| Order History | `/orders` | List of past orders |
| Order History Card | `/orders` | Order details with "Reorder" button |
| Wishlist Page | `/wishlist` | Saved products grid |
| Wishlist Heart Icon | Any product | Heart/favorite icon |
| Notifications Icon | Navigation | Bell icon with badge |
| Notifications Center | `/notifications` | List of notifications |

---

## SCREENSHOT SPECIFICATIONS

### Image Settings
```
Resolution:     1920 x 1080 (16:9) preferred
                or match your display resolution
Format:         PNG (for quality) or JPG
Naming:         vendor-01-dashboard.png
                customer-01-landing.png
```

### Browser Setup
- Use Chrome or Firefox in desktop mode
- Hide browser bookmarks bar
- Use clean browser (no extensions visible)
- Set zoom to 100%
- Use light mode (not dark mode)

### Screenshot Tips
1. **Clean data:** Use realistic but fake data (not "test123")
2. **Consistent user:** Use same vendor/customer name throughout
3. **Populated states:** Show pages with content, not empty states (except where showing empty state specifically)
4. **Hover states:** Capture buttons in normal state (not hovered)
5. **No cursors:** Hide cursor when taking screenshots
6. **Full forms:** Show forms with example data filled in

---

## UI COMPONENT SPECIFICATIONS

### Vendor Sidebar Menu Items
```
📊 Dashboard
📦 Products
🛒 Orders
📈 Reports
💳 Subscription
⚙️ Settings
🚪 Logout (red)
```

### Customer Navigation
```
Logo | Products | Stores | [Search] | 🔔 | 🛒 Cart | Profile
```

### Status Badges (Colors)
```
Pending:        Yellow (#EAB308)
Confirmed:      Blue (#3B82F6)
Preparing:      Orange (#F97316)
Packed:         Purple (#8B5CF6)
Out for Delivery: Indigo (#6366F1)
Delivered:      Green (#22C55E)
Cancelled:      Red (#EF4444)
```

### Button Styles
```
Primary (CTA):  Green background (#22C55E), white text
Secondary:      White background, green border, green text
Danger:         Red background (#EF4444), white text
Ghost:          Transparent, gray text
```

---

## CAPTURING WORKFLOW

### Vendor Video Capture Order
```
1. Fresh browser → Registration page
2. Fill registration → Submit
3. Vendor onboarding form
4. Pending approval screen
5. Login as approved vendor
6. Dashboard (capture multiple times for different data)
7. Products page (empty state)
8. Add product flow (step by step)
9. Products page (with products)
10. Bulk actions demo
11. Orders page (multiple order states)
12. Order details modal
13. Reports page
14. Settings page
```

### Customer Video Capture Order
```
1. Landing page (logged out)
2. Registration page
3. Landing page (logged in)
4. Stores page
5. Single store page
6. Products page
7. Product detail page
8. Add to cart (multiple items)
9. Cart page
10. Checkout step 1
11. Checkout step 2
12. Checkout step 3
13. Order confirmation
14. Order tracking (various statuses)
15. Order history
16. Wishlist
17. Notifications
```

---

## SCREEN RECORDING TIPS

If recording screens instead of screenshots:

1. **Resolution:** Record at 1920x1080 or higher
2. **Frame rate:** 30fps minimum, 60fps preferred
3. **Mouse movements:** Smooth, deliberate movements
4. **Pause between actions:** Wait 1-2 seconds after each action
5. **Clicks:** Make clicks visible (use screen recording software with click highlights)
6. **Scrolling:** Scroll slowly and smoothly
7. **Forms:** Type slowly enough for viewers to follow
8. **Errors:** Don't record error states unless intentional

### Recommended Screen Recording Software
- **Loom** (free, easy)
- **OBS Studio** (free, powerful)
- **ScreenFlow** (Mac, paid)
- **Camtasia** (paid, professional)
- **Arcade** (free tier, auto-callouts)

