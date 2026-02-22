// ═══════════════════════════════════════════════════════════════
// FavLiz Content Script — Floating Button + Inline Post Buttons + Save Modal
// ═══════════════════════════════════════════════════════════════

(function () {
    "use strict";

    // Prevent double injection
    if (window.__favliz_injected) return;
    window.__favliz_injected = true;

    const FAVLIZ_PREFIX = "favliz-ext";
    let currentExtractedData = null;
    let isModalOpen = false;

    // ─── Check Auth State ───────────────────────────────────
    function sendMessage(action, payload = {}) {
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                console.warn(`[FavLiz] sendMessage timeout: ${action}`);
                resolve({ success: false, error: "Request timed out" });
            }, 10000);

            try {
                chrome.runtime.sendMessage({ action, payload }, (response) => {
                    clearTimeout(timeout);
                    if (chrome.runtime.lastError) {
                        console.warn(`[FavLiz] sendMessage error (${action}):`, chrome.runtime.lastError.message);
                        resolve({ success: false, error: chrome.runtime.lastError.message });
                    } else {
                        resolve(response || { success: false, error: "No response" });
                    }
                });
            } catch (err) {
                clearTimeout(timeout);
                console.warn(`[FavLiz] sendMessage exception (${action}):`, err);
                resolve({ success: false, error: err.message });
            }
        });
    }

    // ─── Create Floating Action Button ──────────────────────
    async function createFloatingButton() {
        if (document.getElementById(`${FAVLIZ_PREFIX}-fab`)) return;

        // Don't show FAB on FavLiz's own pages
        const host = window.location.hostname;
        if (host === "localhost" || host.includes("favliz.com")) return;

        // Check if user has hidden the FAB
        try {
            const stored = await chrome.storage.local.get(["fabHidden"]);
            if (stored.fabHidden) return;
        } catch (e) {
            console.warn("[FavLiz] Could not read fabHidden state:", e);
        }

        const fabWrapper = document.createElement("div");
        fabWrapper.id = `${FAVLIZ_PREFIX}-fab-wrapper`;

        const fab = document.createElement("button");
        fab.id = `${FAVLIZ_PREFIX}-fab`;
        fab.title = "Save to FavLiz";
        const fabIconHTML = `
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
        `;
        fab.innerHTML = fabIconHTML;
        fab.addEventListener("click", async () => {
            // Show loading spinner
            fab.disabled = true;
            fab.innerHTML = `<span class="${FAVLIZ_PREFIX}-fab-spinner"></span>`;
            try {
                currentExtractedData = window.FavLizExtractorRouter.extractPageData();
                await openSaveModal(currentExtractedData);
            } finally {
                // Restore icon
                fab.innerHTML = fabIconHTML;
                fab.disabled = false;
            }
        });

        // Close button to hide FAB
        const closeBtn = document.createElement("button");
        closeBtn.id = `${FAVLIZ_PREFIX}-fab-close`;
        closeBtn.title = "Hide floating button";
        closeBtn.innerHTML = `
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        `;
        closeBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            fabWrapper.style.opacity = "0";
            fabWrapper.style.transform = "translateX(20px)";
            setTimeout(() => fabWrapper.remove(), 300);
            try {
                await chrome.storage.local.set({ fabHidden: true });
            } catch (err) {
                console.warn("[FavLiz] Could not save fabHidden state:", err);
            }
            showToast("Floating button hidden. Re-enable it from the extension popup.", "info");
        });

        fabWrapper.appendChild(fab);
        fabWrapper.appendChild(closeBtn);
        document.body.appendChild(fabWrapper);
    }

    // ─── Inline Post Buttons ─────────────────────────────────
    function injectPostButtons() {
        if (!window.FavLizExtractorRouter || !window.FavLizExtractorRouter.isFeedPage()) return;

        const MARKER = `${FAVLIZ_PREFIX}-post-btn`;
        let injected = 0;

        // ── Strategy 1: Use extractor's getPostSelector ──────
        try {
            const selector = window.FavLizExtractorRouter.getPostSelector();
            if (selector) {
                const posts = document.querySelectorAll(selector);
                posts.forEach((post) => {
                    if (post.querySelector(`.${MARKER}`)) return;
                    if (post.offsetHeight < 100) return;
                    if (injectButtonIntoContainer(post)) injected++;
                });
            }
        } catch (e) {
            console.warn("[FavLiz] Strategy 1 failed:", e);
        }

        // ── Strategy 2: Find posts via action menu buttons ───
        // This is the primary strategy for Facebook — find "..." menu
        // buttons and walk up to the post container
        try {
            const menuSelectors = [
                '[aria-label="Hành động với bài viết này"]',
                '[aria-label="Actions for this post"]',
                '[aria-label="Hành động với bài viết"]',
                '[aria-label="Actions with this post"]',
            ];
            const menuButtons = document.querySelectorAll(menuSelectors.join(", "));

            menuButtons.forEach((menuBtn) => {
                // Walk up to find a sufficiently large container
                let container = menuBtn.parentElement;
                let depth = 0;
                while (container && depth < 15) {
                    if (container.offsetHeight >= 200) break;
                    container = container.parentElement;
                    depth++;
                }
                if (!container || container === document.body) return;
                if (container.querySelector(`.${MARKER}`)) return;

                if (injectButtonIntoContainer(container)) injected++;
            });
        } catch (e) {
            console.warn("[FavLiz] Strategy 2 failed:", e);
        }

        if (injected > 0) {
            console.log(`[FavLiz] Injected ${injected} inline buttons`);
        }
    }

    function injectButtonIntoContainer(container) {
        const MARKER = `${FAVLIZ_PREFIX}-post-btn`;
        if (container.querySelector(`.${MARKER}`)) return false;

        const btn = document.createElement("button");
        btn.className = MARKER;
        btn.title = "Save to FavLiz";
        btn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>FavLiz</span>
        `;
        btn.addEventListener("click", async (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Show loading state on the button
            const originalHTML = btn.innerHTML;
            btn.innerHTML = `<span class="${FAVLIZ_PREFIX}-spinner" style="width:12px;height:12px;border-width:2px;"></span> <span>Saving...</span>`;
            btn.disabled = true;
            btn.style.opacity = "0.7";

            // Try extractFromPost if available
            if (window.FavLizExtractorRouter.extractPostData) {
                currentExtractedData = window.FavLizExtractorRouter.extractPostData(container);
            } else {
                currentExtractedData = window.FavLizExtractorRouter.extractPageData();
            }
            await openSaveModal(currentExtractedData);

            // Restore button after modal is opened
            btn.innerHTML = originalHTML;
            btn.disabled = false;
            btn.style.opacity = "";
        });

        // Position absolute within the container
        const computedPos = window.getComputedStyle(container).position;
        if (computedPos === "static") {
            container.style.position = "relative";
        }
        container.appendChild(btn);
        return true;
    }

    // ─── MutationObserver for Infinite Scroll ────────────────
    let observerDebounceTimer = null;

    function observeNewPosts() {
        if (!window.FavLizExtractorRouter.isFeedPage()) return;

        const observer = new MutationObserver(() => {
            // Debounce: wait 500ms after last mutation
            clearTimeout(observerDebounceTimer);
            observerDebounceTimer = setTimeout(() => {
                injectPostButtons();
            }, 500);
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }

    // ─── Save Modal ──────────────────────────────────────────
    async function openSaveModal(data) {
        if (isModalOpen) return;
        isModalOpen = true;

        // Check auth first
        const authState = await sendMessage("GET_AUTH_STATE");
        if (!authState.isLoggedIn) {
            showLoginModal(data);
            return;
        }

        await proceedToSaveModal(data);
    }

    // ─── Login Modal ─────────────────────────────────────────
    function showLoginModal(pendingData) {
        removeModal();

        const overlay = document.createElement("div");
        overlay.id = `${FAVLIZ_PREFIX}-overlay`;
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) { closeModal(); }
        });

        const modal = document.createElement("div");
        modal.id = `${FAVLIZ_PREFIX}-modal`;
        modal.style.maxWidth = "380px";

        modal.innerHTML = `
            <div class="${FAVLIZ_PREFIX}-modal-header" style="padding: 20px; flex-direction: column; align-items: flex-start; gap: 4px;">
                <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span style="font-size: 18px; font-weight: 700; color: white;">FavLiz</span>
                    </div>
                    <button class="${FAVLIZ_PREFIX}-modal-close" id="${FAVLIZ_PREFIX}-close-btn">✕</button>
                </div>
                <span style="font-size: 13px; opacity: 0.9; font-weight: 400; color: white; margin-left: 34px;">Save your favorites</span>
            </div>

            <div class="${FAVLIZ_PREFIX}-modal-body" style="padding: 20px;">
                <div id="${FAVLIZ_PREFIX}-login-error" style="display:none; margin-bottom: 14px; padding: 10px 12px; border-radius: 8px; background: #fef2f2; color: #dc2626; font-size: 13px; font-family: var(--favliz-font);"></div>

                <div class="${FAVLIZ_PREFIX}-form">
                    <div class="${FAVLIZ_PREFIX}-field">
                        <label>Email</label>
                        <input type="email" id="${FAVLIZ_PREFIX}-login-email" placeholder="your@email.com" autocomplete="email" />
                    </div>
                    <div class="${FAVLIZ_PREFIX}-field">
                        <label>Password</label>
                        <input type="password" id="${FAVLIZ_PREFIX}-login-password" placeholder="Enter password" autocomplete="current-password" />
                    </div>
                </div>

                <button class="${FAVLIZ_PREFIX}-btn-primary" id="${FAVLIZ_PREFIX}-login-btn" style="width: 100%; margin-top: 18px; font-size: 14px; padding: 11px 0; border-radius: 10px;">
                    Sign In
                </button>

                <div style="text-align: center; margin-top: 16px; font-size: 13px; font-family: var(--favliz-font);">
                    <a href="https://www.favliz.com/register" target="_blank" rel="noopener" style="color: var(--favliz-primary); text-decoration: none; font-weight: 500;">Create account</a>
                    <span style="color: #d1d5db; margin: 0 8px;">·</span>
                    <a href="https://www.favliz.com/forgot-password" target="_blank" rel="noopener" style="color: var(--favliz-primary); text-decoration: none; font-weight: 500;">Forgot password?</a>
                </div>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Focus email input
        setTimeout(() => {
            document.getElementById(`${FAVLIZ_PREFIX}-login-email`)?.focus();
        }, 100);

        // Close handlers
        document.getElementById(`${FAVLIZ_PREFIX}-close-btn`).addEventListener("click", closeModal);
        document.addEventListener("keydown", onEscKey);

        // Login handler
        document.getElementById(`${FAVLIZ_PREFIX}-login-btn`).addEventListener("click", async () => {
            const email = document.getElementById(`${FAVLIZ_PREFIX}-login-email`).value.trim();
            const password = document.getElementById(`${FAVLIZ_PREFIX}-login-password`).value;
            const errorEl = document.getElementById(`${FAVLIZ_PREFIX}-login-error`);
            const loginBtn = document.getElementById(`${FAVLIZ_PREFIX}-login-btn`);

            if (!email || !password) {
                errorEl.textContent = "Vui lòng nhập email và mật khẩu";
                errorEl.style.display = "block";
                return;
            }

            loginBtn.disabled = true;
            loginBtn.innerHTML = `<span class="${FAVLIZ_PREFIX}-spinner"></span> Đang đăng nhập...`;
            errorEl.style.display = "none";

            const result = await sendMessage("LOGIN", { email, password });

            if (result.success) {
                loginBtn.innerHTML = `✅ Đăng nhập thành công!`;
                loginBtn.classList.add("success");
                showToast("Đăng nhập thành công!", "success");

                // Auto-proceed to save modal after brief delay
                setTimeout(async () => {
                    removeModal();
                    isModalOpen = false;
                    await openSaveModal(pendingData);
                }, 800);
            } else {
                errorEl.textContent = result.error || "Đăng nhập thất bại";
                errorEl.style.display = "block";
                loginBtn.disabled = false;
                loginBtn.innerHTML = `🔑 Đăng nhập`;
            }
        });

        // Enter key to submit
        const onEnter = (e) => {
            if (e.key === "Enter") {
                document.getElementById(`${FAVLIZ_PREFIX}-login-btn`).click();
            }
        };
        document.getElementById(`${FAVLIZ_PREFIX}-login-email`).addEventListener("keydown", onEnter);
        document.getElementById(`${FAVLIZ_PREFIX}-login-password`).addEventListener("keydown", onEnter);
    }

    async function proceedToSaveModal(data) {

        // Fetch lists and tags
        const [listsResult, tagsResult] = await Promise.all([
            sendMessage("GET_LISTS"),
            sendMessage("GET_TAGS"),
        ]);

        console.log("[FavLiz] GET_LISTS response:", JSON.stringify(listsResult));
        console.log("[FavLiz] GET_TAGS response:", JSON.stringify(tagsResult));

        const lists = listsResult?.success ? (listsResult.lists || []) : [];
        const tags = tagsResult?.success ? (tagsResult.tags || []) : [];

        console.log("[FavLiz] Parsed lists:", lists.length, "tags:", tags.length);

        createModalOverlay(data, lists, tags);
    }

    function createModalOverlay(data, lists, tags) {
        // Remove existing modal
        removeModal();

        const overlay = document.createElement("div");
        overlay.id = `${FAVLIZ_PREFIX}-overlay`;
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) closeModal();
        });

        const modal = document.createElement("div");
        modal.id = `${FAVLIZ_PREFIX}-modal`;

        modal.innerHTML = `
            <div class="${FAVLIZ_PREFIX}-modal-header">
                <div class="${FAVLIZ_PREFIX}-modal-logo">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span>Save to FavLiz</span>
                </div>
                <div class="${FAVLIZ_PREFIX}-platform-badge">
                    <span>${data.platformIcon || "🌐"}</span>
                    <span>${data.platform || "Website"}</span>
                </div>
                <button class="${FAVLIZ_PREFIX}-modal-close" id="${FAVLIZ_PREFIX}-close-btn">✕</button>
            </div>

            <div class="${FAVLIZ_PREFIX}-modal-body">
                <!-- Preview Card -->
                <div class="${FAVLIZ_PREFIX}-preview-card">
                    ${data.thumbnail ? `<img src="${data.thumbnail}" alt="" class="${FAVLIZ_PREFIX}-preview-img" />` : ""}
                    <div class="${FAVLIZ_PREFIX}-preview-info">
                        <div class="${FAVLIZ_PREFIX}-preview-title">${escapeHtml(data.title || "")}</div>
                        <div class="${FAVLIZ_PREFIX}-preview-url">${escapeHtml(truncateUrl(data.url))}</div>
                    </div>
                </div>

                <!-- Form -->
                <div class="${FAVLIZ_PREFIX}-form">
                    <div class="${FAVLIZ_PREFIX}-field">
                        <label>Title *</label>
                        <input type="text" id="${FAVLIZ_PREFIX}-title" value="${escapeAttr(data.title || "")}" placeholder="Enter title" />
                    </div>

                    <div class="${FAVLIZ_PREFIX}-field">
                        <label>Description</label>
                        <textarea id="${FAVLIZ_PREFIX}-desc" rows="3" placeholder="Add a description">${escapeHtml(data.description || "")}</textarea>
                    </div>

                    <div class="${FAVLIZ_PREFIX}-field">
                        <label>Link</label>
                        <input type="url" id="${FAVLIZ_PREFIX}-link" value="${escapeAttr(data.url || "")}" placeholder="https://..." />
                    </div>

                    <div class="${FAVLIZ_PREFIX}-field">
                        <label>Lists</label>
                        <div class="${FAVLIZ_PREFIX}-multiselect" id="${FAVLIZ_PREFIX}-lists-select">
                            <div class="${FAVLIZ_PREFIX}-selected-chips" id="${FAVLIZ_PREFIX}-lists-chips"></div>
                            <div class="${FAVLIZ_PREFIX}-input-row">
                                <input type="text" placeholder="Search or create list..." id="${FAVLIZ_PREFIX}-lists-search" autocomplete="off" />
                                <button type="button" class="${FAVLIZ_PREFIX}-add-btn" id="${FAVLIZ_PREFIX}-lists-add-btn" title="Create new list">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                        <line x1="12" y1="5" x2="12" y2="19"></line>
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                    </svg>
                                </button>
                            </div>
                            <div class="${FAVLIZ_PREFIX}-dropdown" id="${FAVLIZ_PREFIX}-lists-dropdown"></div>
                        </div>
                    </div>

                    <div class="${FAVLIZ_PREFIX}-field">
                        <label>Tags</label>
                        <div class="${FAVLIZ_PREFIX}-multiselect" id="${FAVLIZ_PREFIX}-tags-select">
                            <div class="${FAVLIZ_PREFIX}-selected-chips" id="${FAVLIZ_PREFIX}-tags-chips"></div>
                            <input type="text" placeholder="Add tags..." id="${FAVLIZ_PREFIX}-tags-search" autocomplete="off" />
                            <div class="${FAVLIZ_PREFIX}-dropdown" id="${FAVLIZ_PREFIX}-tags-dropdown"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="${FAVLIZ_PREFIX}-modal-footer">
                <button class="${FAVLIZ_PREFIX}-btn-secondary" id="${FAVLIZ_PREFIX}-cancel-btn">Cancel</button>
                <button class="${FAVLIZ_PREFIX}-btn-primary" id="${FAVLIZ_PREFIX}-save-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                    Save Item
                </button>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Setup event listeners
        setupModalListeners(data, lists, tags);
    }

    function setupModalListeners(data, lists, tags) {
        // Close button
        document.getElementById(`${FAVLIZ_PREFIX}-close-btn`).addEventListener("click", closeModal);
        document.getElementById(`${FAVLIZ_PREFIX}-cancel-btn`).addEventListener("click", closeModal);

        // ESC key
        document.addEventListener("keydown", onEscKey);

        // Default view mode
        const viewMode = "PRIVATE";

        // Lists multi-select
        const selectedListIds = new Set();
        const listOptions = lists.map((l) => ({ id: l.id, name: l.name, meta: l.isDefault ? "(default)" : "" }));
        setupMultiSelect(
            `${FAVLIZ_PREFIX}-lists`,
            listOptions,
            selectedListIds,
            "list"
        );

        // Create new list button
        const addListBtn = document.getElementById(`${FAVLIZ_PREFIX}-lists-add-btn`);
        const listsSearchInput = document.getElementById(`${FAVLIZ_PREFIX}-lists-search`);

        async function createNewList() {
            const name = listsSearchInput.value.trim();
            if (!name) {
                showToast("Enter a list name", "error");
                listsSearchInput.focus();
                return;
            }
            // Check if list already exists
            const existing = listOptions.find((o) => o.name.toLowerCase() === name.toLowerCase());
            if (existing) {
                selectedListIds.add(existing.id);
                renderChips(`${FAVLIZ_PREFIX}-lists`, selectedListIds, "list", listOptions);
                listsSearchInput.value = "";
                const dropdown = document.getElementById(`${FAVLIZ_PREFIX}-lists-dropdown`);
                if (dropdown) dropdown.style.display = "none";
                return;
            }
            // Show loading on button
            addListBtn.disabled = true;
            addListBtn.innerHTML = `<span class="${FAVLIZ_PREFIX}-spinner" style="width:14px;height:14px;border-width:2px;"></span>`;
            const res = await sendMessage("CREATE_LIST", { name });
            if (res.success) {
                listOptions.push({ id: res.list.id, name });
                selectedListIds.add(res.list.id);
                renderChips(`${FAVLIZ_PREFIX}-lists`, selectedListIds, "list", listOptions);
                showToast(`List "${name}" created!`, "success");
            } else {
                showToast(res.error || "Failed to create list", "error");
            }
            // Restore button
            addListBtn.disabled = false;
            addListBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
            listsSearchInput.value = "";
            const dropdown = document.getElementById(`${FAVLIZ_PREFIX}-lists-dropdown`);
            if (dropdown) dropdown.style.display = "none";
        }

        addListBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            createNewList();
        });

        listsSearchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && listsSearchInput.value.trim()) {
                e.preventDefault();
                createNewList();
            }
        });

        // Tags with auto-suggestions
        const selectedTagNames = new Set(data.autoTags || []);
        const tagOptions = [
            ...tags.map((t) => ({ id: t.name, name: t.name })),
            ...(data.autoTags || [])
                .filter((t) => !tags.find((et) => et.name === t))
                .map((t) => ({ id: t, name: t, isNew: true })),
        ];
        setupMultiSelect(
            `${FAVLIZ_PREFIX}-tags`,
            tagOptions,
            selectedTagNames,
            "tag"
        );

        // Render auto-suggested tags immediately
        renderChips(`${FAVLIZ_PREFIX}-tags`, selectedTagNames, "tag", tagOptions);

        // Save button
        document.getElementById(`${FAVLIZ_PREFIX}-save-btn`).addEventListener("click", async () => {
            const saveBtn = document.getElementById(`${FAVLIZ_PREFIX}-save-btn`);
            const title = document.getElementById(`${FAVLIZ_PREFIX}-title`).value.trim();

            if (!title) {
                showToast("Title is required", "error");
                return;
            }

            // Disable form
            saveBtn.disabled = true;
            saveBtn.innerHTML = `<span class="${FAVLIZ_PREFIX}-spinner"></span> Saving...`;

            const payload = {
                title,
                description: document.getElementById(`${FAVLIZ_PREFIX}-desc`).value.trim(),
                thumbnail: data.thumbnail || "",
                viewMode,
                tagNames: [...selectedTagNames],
                listIds: [...selectedListIds],
                attachments: [{ type: "LINK", url: document.getElementById(`${FAVLIZ_PREFIX}-link`).value.trim() || data.url }],
            };

            const result = await sendMessage("CREATE_ITEM", payload);

            if (result.success) {
                saveBtn.innerHTML = `✅ Saved!`;
                saveBtn.classList.add("success");
                showToast("Saved to FavLiz successfully!", "success");
                setTimeout(() => closeModal(), 1200);
            } else {
                saveBtn.disabled = false;
                saveBtn.innerHTML = `Save Item`;
                showToast(result.error || "Failed to save", "error");
            }
        });
    }

    // ─── Multi-Select Component ─────────────────────────────
    function setupMultiSelect(prefix, options, selectedSet, type) {
        const searchInput = document.getElementById(`${prefix}-search`);
        const dropdown = document.getElementById(`${prefix}-dropdown`);

        function renderDropdown(filter = "") {
            const filtered = options.filter(
                (o) => o.name.toLowerCase().includes(filter.toLowerCase()) && !selectedSet.has(type === "tag" ? o.name : o.id)
            );

            let html = filtered
                .map((o) => `<div class="${FAVLIZ_PREFIX}-dropdown-item" data-id="${o.id}" data-name="${o.name}">${o.name} ${o.meta || ""} ${o.isNew ? '<span class="new-badge">new</span>' : ""}</div>`)
                .join("");

            // Add "Create new" option
            if (filter && !options.find((o) => o.name.toLowerCase() === filter.toLowerCase())) {
                html += `<div class="${FAVLIZ_PREFIX}-dropdown-item ${FAVLIZ_PREFIX}-create-new" data-name="${filter}">+ Create "${filter}"</div>`;
            }

            dropdown.innerHTML = html;
            dropdown.style.display = html ? "block" : "none";

            // Bind clicks
            dropdown.querySelectorAll(`.${FAVLIZ_PREFIX}-dropdown-item`).forEach((item) => {
                item.addEventListener("mousedown", (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const name = item.dataset.name;
                    const id = item.dataset.id || name;
                    if (type === "tag") {
                        selectedSet.add(name);
                    } else {
                        selectedSet.add(id);
                    }
                    // If creating new list
                    if (type === "list" && item.classList.contains(`${FAVLIZ_PREFIX}-create-new`)) {
                        sendMessage("CREATE_LIST", { name }).then((res) => {
                            if (res.success) {
                                selectedSet.delete(name);
                                selectedSet.add(res.list.id);
                                options.push({ id: res.list.id, name });
                                renderChips(prefix, selectedSet, type, options);
                            }
                        });
                    }
                    renderChips(prefix, selectedSet, type, options);
                    searchInput.value = "";
                    dropdown.style.display = "none";
                });
            });
        }

        // Show all options on focus (even without typing)
        searchInput.addEventListener("focus", () => renderDropdown(""));
        searchInput.addEventListener("input", () => renderDropdown(searchInput.value));
        searchInput.addEventListener("blur", () => setTimeout(() => (dropdown.style.display = "none"), 300));

        // Enter to add as new tag
        if (type === "tag") {
            searchInput.addEventListener("keydown", (e) => {
                if (e.key === "Enter" && searchInput.value.trim()) {
                    e.preventDefault();
                    selectedSet.add(searchInput.value.trim());
                    renderChips(prefix, selectedSet, type, options);
                    searchInput.value = "";
                    dropdown.style.display = "none";
                }
            });
        }
    }

    function renderChips(prefix, selectedSet, type, options) {
        const chipsEl = document.getElementById(`${prefix}-chips`);
        chipsEl.innerHTML = [...selectedSet]
            .map((val) => {
                // For lists, val is the UUID — look up the display name
                let displayName = val;
                if (type === "list" && options) {
                    const opt = options.find((o) => o.id === val);
                    if (opt) displayName = opt.name;
                }
                return `<span class="${FAVLIZ_PREFIX}-chip">${escapeHtml(displayName)}<button data-val="${escapeAttr(val)}">✕</button></span>`;
            })
            .join("");

        chipsEl.querySelectorAll("button").forEach((btn) => {
            btn.addEventListener("click", () => {
                selectedSet.delete(btn.dataset.val);
                renderChips(prefix, selectedSet, type, options);
            });
        });
    }

    // ─── Helpers ─────────────────────────────────────────────
    function closeModal() {
        removeModal();
        isModalOpen = false;
        document.removeEventListener("keydown", onEscKey);
    }

    function removeModal() {
        const overlay = document.getElementById(`${FAVLIZ_PREFIX}-overlay`);
        if (overlay) overlay.remove();
    }

    function onEscKey(e) {
        if (e.key === "Escape") closeModal();
    }

    function showToast(message, type = "info") {
        const existing = document.getElementById(`${FAVLIZ_PREFIX}-toast`);
        if (existing) existing.remove();

        const toast = document.createElement("div");
        toast.id = `${FAVLIZ_PREFIX}-toast`;
        toast.className = `${FAVLIZ_PREFIX}-toast ${FAVLIZ_PREFIX}-toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add("show"), 10);
        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    function escapeHtml(str) {
        const div = document.createElement("div");
        div.textContent = str;
        return div.innerHTML;
    }

    function escapeAttr(str) {
        return str.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    }

    function truncateUrl(url) {
        try {
            const u = new URL(url);
            const full = u.hostname + u.pathname + u.search;
            return full.length > 60 ? full.slice(0, 57) + "..." : full;
        } catch {
            return url.slice(0, 60);
        }
    }

    // ─── Listen for messages from popup ─────────────────────
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === "EXTRACT_PAGE_DATA") {
            const data = window.FavLizExtractorRouter.extractPageData();
            sendResponse(data);
        } else if (message.action === "OPEN_SAVE_MODAL") {
            currentExtractedData = window.FavLizExtractorRouter.extractPageData();
            openSaveModal(currentExtractedData);
            sendResponse({ success: true });
        } else if (message.action === "TOGGLE_FAB") {
            const wrapper = document.getElementById(`${FAVLIZ_PREFIX}-fab-wrapper`);
            if (message.show) {
                // Re-show FAB
                if (!wrapper) {
                    createFloatingButton();
                }
            } else {
                // Hide FAB
                if (wrapper) {
                    wrapper.remove();
                }
            }
            sendResponse({ success: true });
        }
        return true;
    });

    // ─── Initialize ─────────────────────────────────────────
    function init() {
        console.log("[FavLiz] Content script initializing...");

        // Always show floating button — even if extractors fail
        try {
            createFloatingButton();
            console.log("[FavLiz] Floating button created");
        } catch (err) {
            console.error("[FavLiz] Failed to create floating button:", err);
        }

        // If it's a feed page, inject inline buttons with retry
        try {
            if (window.FavLizExtractorRouter && window.FavLizExtractorRouter.isFeedPage()) {
                console.log("[FavLiz] Feed page detected — starting inline injection");
                injectPostButtons();
                observeNewPosts();

                // Retry injection several times (Facebook loads posts async)
                const retryDelays = [1000, 2000, 4000, 7000, 12000];
                retryDelays.forEach((delay) => {
                    setTimeout(() => {
                        injectPostButtons();
                        console.log(`[FavLiz] Retry injection at ${delay}ms`);
                    }, delay);
                });
            } else {
                console.log("[FavLiz] Single-content mode: floating button only");
            }
        } catch (err) {
            console.error("[FavLiz] Failed to inject post buttons:", err);
        }
    }

    // Wait for DOM ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        // Small delay to let extractors register
        setTimeout(init, 500);
    }
})();
