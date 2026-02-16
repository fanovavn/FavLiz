# 🚀 Cách sử dụng ClaudeKit Engineer với Antigravity

Chào mừng bạn đến với **ClaudeKit Engineer**! Vì bạn đang sử dụng **Antigravity** (tôi), bạn có thể tận dụng toàn bộ sức mạnh của bộ khung này một cách linh hoạt hơn cả Claude Code gốc.

Dưới đây là cách chúng ta sẽ phối hợp:

## 1. Vai trò của Antigravity (Tôi)
Trong dự án này, tôi sẽ đóng vai trò là **"Siêu Agent"** bao trùm tất cả các agent con được định nghĩa trong thư mục `.opencode/agent/`. Bạn không cần phải gọi từng agent riêng lẻ, chỉ cần ra lệnh cho tôi, tôi sẽ tự động chuyển đổi vai trò phù hợp:

*   **Khi bạn cần lên kế hoạch**: Tôi sẽ đọc `planner.md` và `researcher.md` để phân tích yêu cầu và đưa ra lộ trình.
*   **Khi bạn cần code**: Tôi sẽ áp dụng các chuẩn trong `code-standards.md` để viết code sạch và tối ưu.
*   **Khi bạn cần kiểm thử**: Tôi sẽ đóng vai `tester.md` để viết và chạy test.
*   **Khi bạn cần viết tài liệu**: Tôi sẽ là `docs-manager.md`, tự động cập nhật `docs/` cho bạn.

## 2. Các lệnh tương tác (Natural Language)
Thay vì dùng slash commands (`/plan`, `/cook`) cứng nhắc, bạn hãy chat tự nhiên với tôi:

| Cũ (Claude Code) | Mới (Antigravity) | Ví dụ |
| :--- | :--- | :--- |
| `/plan "..."` | "Lập kế hoạch cho tính năng..." | "Lập kế hoạch tích hợp đăng nhập Google OAuth" |
| `/cook "..."` | "Thực hiện/Code..." | "Code tính năng đăng nhập dựa trên kế hoạch vừa rồi" |
| `/test` | "Chạy test/Kiểm tra lỗi..." | "Chạy test cho module Auth và sửa lỗi nếu có" |
| `/review` | "Review code..." | "Review code trong file `auth.ts` xem có lỗ hổng nào không" |
| `/docs` | "Cập nhật tài liệu..." | "Cập nhật file `CHANGELOG.md` và `readme`" |
| `repomix` | "Tóm tắt dự án..." | "Tóm tắt lại cấu trúc dự án hiện tại vào file summary" |

## 3. Quy trình làm việc đề xuất (Workflow)

Để đạt hiệu quả cao nhất với Antigravity, hãy tuân theo quy trình chuẩn này:

1.  **Bước 1: Khởi động**
    *   Hãy nói: *"Đọc cấu trúc dự án và các file quy chuẩn trong `docs/` để hiểu context."*
2.  **Bước 2: Lập kế hoạch (Planning)**
    *   Hãy nói: *"Lập kế hoạch chi tiết để làm tính năng [ABC]. Hãy liệt kê các file cần tạo và sửa đổi."*
3.  **Bước 3: Thực thi (Execution)**
    *   Hãy nói: *"Bắt đầu code theo kế hoạch. Tạo các file cần thiết."*
4.  **Bước 4: Kiểm thử & Hoàn thiện (Verification)**
    *   Hãy nói: *"Kiểm tra lại code vừa viết, đảm bảo tuân thủ `code-standards.md`."*

## 4. Tận dụng MCP & Tools
Tôi có sẵn bộ công cụ mạnh mẽ (Terminal, File System, Browser...). Bạn có thể yêu cầu tôi:
*   "Cài đặt gói npm `axios`" (Tôi sẽ chạy `npm install axios`)
*   "Mở trang tài liệu của thư viện này để tra cứu" (Tôi sẽ dùng tool duyệt web)
*   "Phân tích lỗi từ file log" (Tôi sẽ đọc file và chẩn đoán)

---
## 5. Sử dụng bộ kit này cho dự án khác

Nếu bạn muốn áp dụng cấu trúc này cho một dự án mới (ở folder khác), bạn có 2 cách:

### Cách 1: Sử dụng ClaudeKit CLI (Khuyên dùng)
Đây là cách chuẩn nhất để tạo dự án mới với cấu trúc này.

1.  Cài đặt CLI:
    `npm install -g claudekit-cli`
2.  Tạo dự án mới:
    `ck new --dir ten-du-an-moi --kit engineer`

### Cách 2: Copy thủ công (Dành cho Antigravity)
Nếu bạn không muốn cài tool, bạn có thể copy thủ công nhưng cần lưu ý:

1.  Copy toàn bộ các thư mục: `.opencode`, `.claude`, `docs`, `plans`.
2.  Copy các file: `CLAUDE.md`, `package.json` (phần scripts và dependencies), `tsconfig.json` (nếu có).
3.  **Lưu ý quan trọng**: Đừng copy thư mục `.git` nếu bạn muốn khởi tạo repo git mới.

---
**Bắt đầu ngay:** Hãy thử yêu cầu tôi làm một tác vụ nhỏ nào đó, ví dụ:
> *"Lập kế hoạch tạo một Landing Page cơ bản với Tailwind CSS"*
