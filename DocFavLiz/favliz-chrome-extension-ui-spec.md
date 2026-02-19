# FavLiz Chrome Extension – UI Design Specification

## 1. Overview

FavLiz Chrome Extension cho phép người dùng lưu nội dung từ:

- YouTube
- Facebook
- Reddit
- Instagram
- Bất kỳ website nào

Mục tiêu UX:
- Lưu nội dung trong 3–5 giây
- Autofill tối đa
- Ít thao tác nhất có thể

Thiết kế:
- Modern tech
- Light theme
- Pink–Red gradient accent
- Glassmorphism
- Typography rõ ràng, dễ đọc

---

# 2. UI Architecture

Extension gồm 3 giao diện chính:

1. Popup UI (khi click icon extension)
2. Injected Floating Button (hiển thị trên trang web)
3. Inline Save Modal (mở khi click floating button)

---

# 3. Popup UI

## 3.1 Layout

- Width: 360px
- Padding: 16px
- Rounded corners
- Glass container

### Sections:
1. Header
2. Content Preview
3. Edit Form
4. Action Buttons

---

## 3.2 Header

- Logo FavLiz (left)
- Title: "Save to FavLiz"
- User email / avatar (right)
- Logout icon

---

## 3.3 Content Preview Card

Hiển thị auto-detected data:

- Thumbnail (left)
- Title (bold)
- Platform label (YouTube / Reddit / Website)
- URL (truncated)

Style:
- Glass card
- Gradient accent border
- Subtle shadow

---

## 3.4 Edit Form

### Title
- Text input
- Pre-filled
- Editable
- Required

### Description
- Textarea
- Optional
- Prefill nếu detect được

### Lists
- Multi-select dropdown
- Searchable
- "+ Create new list" inline option

### Tags
- Multi-select
- Chip style
- Create new inline

### View Mode
Toggle:
- Private
- Public

---

## 3.5 Action Buttons

Primary:
- "Save Item"
- Full width
- Pink-Red gradient

Secondary:
- "Open in FavLiz"
- Ghost style

Loading state:
- Spinner inside button
- Disable form

Success state:
- Check icon
- Text: "Saved successfully"
- Auto close after 1.5 seconds

---

# 4. Floating Button (Injected UI)

Hiển thị trên:

- YouTube
- Reddit
- Facebook
- Instagram

Position:
- Bottom-right
- Circular button

Style:
- Pink-red gradient
- Icon: Bookmark / Heart
- Hover scale effect
- Subtle shadow

Click → mở Inline Save Modal

---

# 5. Inline Save Modal

Center overlay modal

Glass card

Fields giống Popup nhưng:

- Thumbnail lớn hơn
- Platform badge hiển thị rõ

Buttons:
- Save
- Cancel

---

# 6. Platform-Specific Preview Rules

## YouTube
- Video thumbnail
- Video title
- Channel name
- Duration badge

Attachment type: YOUTUBE

---

## Reddit
- Post title
- Subreddit
- Author
- Thumbnail nếu có

Attachment type: REDDIT

---

## Facebook
- Post snippet
- Author
- Thumbnail nếu detect được

Fallback:
- Page title + URL

---

## Instagram
- Username
- Caption (first 120 chars)
- Thumbnail

Fallback:
- URL + page title

---

# 7. Login View (If Not Authenticated)

Layout:

- Center logo
- Title: "Login to FavLiz"
- Email input
- Password input
- Login button
- Link: Register on web

Style:
- Minimal
- Pink focus ring
- Clean spacing

---

# 8. States & UX Behavior

## Loading
- Skeleton preview
- Spinner on save button

## Error
Toast notification:
- "Failed to save item"
- "Session expired"

## Session Expired
- Auto redirect to login view

---

# 9. Design Guidelines

## Theme
Light theme only.

Primary gradient:
#FF4D6D → #FF1E56

## Typography
- Title: font-weight 600
- Body: medium weight
- No tiny text

## Glass Effect
- Backdrop blur
- White transparency
- 1px soft border

---

# 10. Interaction Goals

- Save in under 5 seconds
- Autofill everything possible
- Minimal typing
- Clear feedback

---

# 11. MVP Scope

Include:
- Popup UI
- Login
- Metadata detection
- Save item
- List & tag selection
- View mode toggle
- Floating button

Exclude:
- Screenshot capture
- AI tag suggestion
- Keyboard shortcut
- Deep DOM edge-case parsing

---

# 12. Future Enhancements

- One-click quick save
- AI auto-tagging
- Screenshot capture
- Highlight text save
- Keyboard shortcut (Cmd + Shift + S)
- Smart list suggestion

---

# 13. UX Principle

Extension phải:
- Nhanh
- Tối giản
- Tự động
- Ít ma sát
- Đồng bộ cảm xúc với FavLiz Web App
