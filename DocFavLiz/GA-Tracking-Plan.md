# FavLiz — GA Event Tracking Plan

## 1. Page View Tracking (Tự động)

Firebase Analytics tự động track `page_view` cho mỗi route. Component `FirebaseAnalytics` trong `layout.tsx` + `useFirebasePageView` hook sẽ gửi `screen_view` event khi chuyển trang.

| Page | Route | Screen Name |
|------|-------|-------------|
| Landing | `/` | `landing` |
| Login | `/login` | `login` |
| Register | `/register` | `register` |
| Forgot Password | `/forgot-password` | `forgot_password` |
| Dashboard | `/dashboard` | `dashboard` |
| Items List | `/items` | `items_list` |
| Item Detail | `/items/[id]` | `item_detail` |
| Item Create | `/items/new` | `item_create` |
| Item Edit | `/items/[id]/edit` | `item_edit` |
| Lists | `/lists` | `lists` |
| List Detail | `/lists/[id]` | `list_detail` |
| List Create | `/lists/new` | `list_create` |
| List Edit | `/lists/[id]/edit` | `list_edit` |
| Uncategorized | `/lists/uncategorized` | `uncategorized` |
| Tags | `/tags` | `tags` |
| Tag Detail | `/tags/[id]` | `tag_detail` |
| Settings | `/settings` | `settings` |
| Share Item | `/share/item/[slug]` | `share_item` |
| Share List | `/share/list/[slug]` | `share_list` |
| Public Profile | `/u/[username]/[slug]` | `public_profile` |

---

## 2. Custom Event Tracking

### 2.1 Landing Page Events

| Event Name | Trigger | Parameters |
|------------|---------|------------|
| `landing_cta_click` | Click "Bắt đầu miễn phí" / "Vào ứng dụng" | `location`: `hero` \| `cta_section` |
| `landing_chrome_ext_click` | Click "Cài Chrome Extension" | `location`: `hero` \| `cta_section` |
| `landing_nav_click` | Click nav link | `target`: `features` \| `usecases` \| `products` \| `comparison` |
| `landing_login_click` | Click "Đăng nhập" | — |
| `landing_register_click` | Click "Bắt đầu miễn phí" (navbar) | — |

### 2.2 Auth Events

| Event Name | Trigger | Parameters |
|------------|---------|------------|
| `auth_login_submit` | Submit login form | — |
| `auth_register_submit` | Submit register form | — |
| `auth_forgot_password` | Submit forgot password | — |
| `auth_logout` | Click logout | — |

### 2.3 Item Events

| Event Name | Trigger | Parameters |
|------------|---------|------------|
| `item_create` | Create new item | `has_thumbnail`: bool, `tags_count`: number |
| `item_edit` | Edit item | — |
| `item_delete` | Delete item | — |
| `item_view` | View item detail | `view_mode`: `public` \| `private` |
| `item_share` | Toggle item to public | — |

### 2.4 List Events

| Event Name | Trigger | Parameters |
|------------|---------|------------|
| `list_create` | Create new list | — |
| `list_edit` | Edit list | — |
| `list_delete` | Delete list | — |
| `list_view` | View list detail | `items_count`: number |
| `list_share` | Toggle list to public | — |

### 2.5 Tag Events

| Event Name | Trigger | Parameters |
|------------|---------|------------|
| `tag_view` | View tag detail | `items_count`: number |

### 2.6 Share/Public Events

| Event Name | Trigger | Parameters |
|------------|---------|------------|
| `share_page_view` | View shared item/list | `type`: `item` \| `list` |
| `public_profile_view` | View public profile | `username`: string |

---

## 3. Implementation

- **Page views**: `useFirebasePageView()` hook trong `FirebaseAnalytics` component (auto)
- **Custom events**: `trackEvent(name, params)` helper function, gọi tại từng component
