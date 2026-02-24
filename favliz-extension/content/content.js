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
            <svg width="22" height="22" viewBox="0 0 370 314" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M176.772 0.111476C177.127 0.0411644 177.488 0 177.85 0H178.16C182.597 0.537917 187.8 0.568213 192.036 1.42365C213.304 5.7191 229.208 18.9398 241.912 35.7651C252.528 49.8243 262.227 63.3873 272.253 77.4414L304.277 121.662L331.48 159.156C346.419 179.717 362.203 199.417 367.753 224.682C368.242 226.897 368.947 233.583 369.608 236.531C369.798 237.38 370 238.25 370 239.12V248.157C370 249.054 369.74 249.937 369.547 250.813C369.159 252.579 369.157 255.16 368.847 256.662C368.383 258.928 367.933 261.105 367.378 263.366C363.495 279.735 353.262 293.882 338.939 302.684C328.225 309.169 315.771 312.593 303.432 313.661C275.293 316.356 249.724 302.431 224.994 291.072C208.42 283.457 193.581 278.299 175.032 280.446C161.589 282 148.651 287.834 136.499 293.6C110.801 305.794 85.9416 316.297 56.9824 309.105C50.6683 307.484 44.5566 305.16 38.7626 302.171C17.9249 291.515 7.20299 275.372 1.92503 253.074C1.50321 251.292 1.18955 247.007 0.561624 244.568C0.307439 243.581 0 242.57 0 241.551V232.344C0 231.162 0.314228 229.939 0.527737 228.776C1.04426 225.963 1.40173 220.738 1.69877 219.199C7.121 191.111 25.8354 167.436 41.7507 144.379C53.5497 127.074 65.498 109.871 77.5949 92.7731L103.896 54.5114C113.355 40.7769 122.724 25.2509 136.043 14.788C144.87 7.85368 155.183 3.32668 166.231 1.39229C169.635 0.796452 173.298 0.798666 176.772 0.111476ZM216.351 221.014C229.294 203.799 241.145 188.086 252.049 169.216C265.048 146.72 271.229 123.653 247.914 105.241C240.327 99.2487 230.256 96.7714 220.721 98.1595C206.014 100.309 197.068 109.336 181.92 109.672C164.814 110.051 151.745 95.5442 135.302 97.794C125.009 98.1922 117.031 103 110.189 110.432C104.638 116.463 100.076 126.445 100.402 134.765C101.285 157.321 125.688 189.328 139.001 207.243C147.173 218.24 155.134 229.651 165.329 238.912C170.138 243.281 177.338 246.995 183.975 246.695C192.021 246.33 199.35 241.256 204.582 235.43C208.677 230.87 212.769 225.984 216.351 221.014Z" fill="white"/>
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

        const modal = document.createElement("div");
        modal.id = `${FAVLIZ_PREFIX}-modal`;

        modal.innerHTML = `
            <div class="${FAVLIZ_PREFIX}-modal-header" style="padding: 20px; flex-direction: column; align-items: flex-start; gap: 4px;">
                <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <img src="${chrome.runtime.getURL('assets/icon-48.png')}" alt="FavLiz" width="24" height="24" style="border-radius: 4px;">
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

        document.body.appendChild(modal);

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
                    // If we have a URL but no real data, fetch metadata first
                    if (pendingData?.url && !pendingData.title) {
                        await openSaveModalFromUrl(pendingData.url);
                    } else {
                        await openSaveModal(pendingData);
                    }
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
        // Remove existing sidebar
        removeModal();

        const modal = document.createElement("div");
        modal.id = `${FAVLIZ_PREFIX}-modal`;

        modal.innerHTML = `
            <div class="${FAVLIZ_PREFIX}-modal-header">
                <div class="${FAVLIZ_PREFIX}-modal-logo">
                    <img src="${chrome.runtime.getURL('assets/icon-48.png')}" alt="FavLiz" width="20" height="20" style="border-radius: 4px;">
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
                        <textarea id="${FAVLIZ_PREFIX}-title" rows="1" placeholder="Enter title" style="resize:none;overflow:hidden;font-size:24px;font-weight:700;">${escapeHtml(data.title || "")}</textarea>
                    </div>

                    <div class="${FAVLIZ_PREFIX}-field">
                        <label>Description</label>
                        <div style="position:relative;">
                            <textarea id="${FAVLIZ_PREFIX}-desc" rows="3" placeholder="Add a description" style="resize:none;overflow-y:auto;max-height:300px;padding-bottom:22px;">${escapeHtml(data.description || "")}</textarea>
                            <span class="${FAVLIZ_PREFIX}-char-counter" id="${FAVLIZ_PREFIX}-desc-counter">${(data.description || "").length}/5000</span>
                        </div>
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

        document.body.appendChild(modal);

        // Setup event listeners
        setupModalListeners(data, lists, tags);

        // Setup auto-resize for title and description textareas
        setupAutoResize(`${FAVLIZ_PREFIX}-title`, 500, null);
        setupAutoResize(`${FAVLIZ_PREFIX}-desc`, 5000, `${FAVLIZ_PREFIX}-desc-counter`, 300);
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
                showToast("Saved to FavLiz successfully!", "success", {
                    countdown: 5,
                    link: "https://www.favliz.com/items",
                });
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

    // ─── Auto-Resize Textareas with Char Counter ────────────
    function setupAutoResize(elementId, maxLength, counterId, maxHeight) {
        const el = document.getElementById(elementId);
        const counter = document.getElementById(counterId);
        if (!el) return;

        function resize() {
            el.style.height = 'auto';
            if (maxHeight) {
                el.style.height = Math.min(el.scrollHeight, maxHeight) + 'px';
            } else {
                el.style.height = el.scrollHeight + 'px';
            }
        }

        function updateCounter() {
            if (!counter) return;
            const len = el.value.length;
            counter.textContent = `${len}/${maxLength}`;
            const threshold = maxLength * 0.9;
            counter.style.color = len > threshold ? '#ef4444' : 'rgba(148,163,184,0.6)';
        }

        el.addEventListener('input', () => {
            if (el.value.length > maxLength) {
                el.value = el.value.slice(0, maxLength);
            }
            resize();
            updateCounter();
        });

        // Initial sizing
        resize();
        updateCounter();
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
        const modal = document.getElementById(`${FAVLIZ_PREFIX}-modal`);
        if (overlay) overlay.remove();
        if (modal) modal.remove();
    }

    function onEscKey(e) {
        if (e.key === "Escape") closeModal();
    }

    function showToast(message, type = "info", opts = {}) {
        const existing = document.getElementById(`${FAVLIZ_PREFIX}-toast`);
        if (existing) existing.remove();
        if (existing?._timer) clearInterval(existing._timer);

        const toast = document.createElement("div");
        toast.id = `${FAVLIZ_PREFIX}-toast`;
        toast.className = `${FAVLIZ_PREFIX}-toast ${FAVLIZ_PREFIX}-toast-${type}`;

        if (opts.countdown && opts.link) {
            // Enhanced success toast with countdown + link
            let remaining = opts.countdown;
            toast.innerHTML = `
                <div class="${FAVLIZ_PREFIX}-toast-row">
                    <span class="${FAVLIZ_PREFIX}-toast-icon">✅</span>
                    <span class="${FAVLIZ_PREFIX}-toast-msg">${escapeHtml(message)}</span>
                    <button class="${FAVLIZ_PREFIX}-toast-close" id="${FAVLIZ_PREFIX}-toast-close">✕</button>
                </div>
                <a href="${escapeAttr(opts.link)}" target="_blank" rel="noopener" class="${FAVLIZ_PREFIX}-toast-link" id="${FAVLIZ_PREFIX}-toast-link">
                    📂 View in FavLiz
                </a>
                <div class="${FAVLIZ_PREFIX}-toast-progress">
                    <div class="${FAVLIZ_PREFIX}-toast-progress-bar" id="${FAVLIZ_PREFIX}-toast-bar"></div>
                </div>
            `;
            document.body.appendChild(toast);
            setTimeout(() => toast.classList.add("show"), 10);

            const bar = document.getElementById(`${FAVLIZ_PREFIX}-toast-bar`);
            const totalMs = remaining * 1000;
            const startTime = Date.now();

            const interval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const pct = Math.max(0, 100 - (elapsed / totalMs) * 100);
                if (bar) bar.style.width = `${pct}%`;
                if (elapsed >= totalMs) {
                    clearInterval(interval);
                    toast.classList.remove("show");
                    setTimeout(() => toast.remove(), 300);
                }
            }, 50);
            toast._timer = interval;

            // Close button
            document.getElementById(`${FAVLIZ_PREFIX}-toast-close`)?.addEventListener("click", () => {
                clearInterval(interval);
                toast.classList.remove("show");
                setTimeout(() => toast.remove(), 300);
            });
        } else {
            toast.textContent = message;
            document.body.appendChild(toast);
            setTimeout(() => toast.classList.add("show"), 10);
            setTimeout(() => {
                toast.classList.remove("show");
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }
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

    function isSameOriginUrl(url1, url2) {
        try {
            const a = new URL(url1);
            const b = new URL(url2);
            return a.hostname === b.hostname;
        } catch {
            return false;
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
        } else if (message.action === "CONTEXT_MENU_SAVE") {
            // Triggered from right-click context menu — open save modal directly
            if (message.url) {
                openSaveModalFromUrl(message.url);
            }
            sendResponse({ success: true });
        }
        return true;
    });

    // ─── Direct Save from URL (used by context menu) ─────────
    async function openSaveModalFromUrl(url) {
        if (isModalOpen) return;

        // Check auth FIRST — don't waste time fetching if not logged in
        const authState = await sendMessage("GET_AUTH_STATE");
        if (!authState.isLoggedIn) {
            isModalOpen = true;
            showLoginModal({ url, title: "", description: "", thumbnail: "", platform: "Website", platformIcon: "🔗", autoTags: [], attachments: [{ type: "LINK", url }] });
            return;
        }

        // Show loading overlay immediately
        showFetchingOverlay(url);

        let data = null;

        // Strategy 1: If URL is same origin, use extractors
        const currentUrl = window.location.href;
        if (isSameOriginUrl(url, currentUrl) && window.FavLizExtractorRouter) {
            try {
                data = window.FavLizExtractorRouter.extractPageData();
                if (data) {
                    data.url = url;
                    data.attachments = [{ type: "LINK", url }];
                }
            } catch (e) {
                console.warn("[FavLiz] Extractor failed:", e);
            }
        }

        // Strategy 2: Fetch metadata via background
        if (!data || !data.title) {
            try {
                const result = await sendMessage("FETCH_URL_METADATA", { url });
                if (result.success && result.metadata) {
                    data = {
                        ...result.metadata,
                        attachments: [{ type: "LINK", url }],
                    };
                }
            } catch (e) {
                console.warn("[FavLiz] Metadata fetch failed:", e);
            }
        }

        // Strategy 3: Fallback
        if (!data) {
            data = {
                title: "", description: "", url, thumbnail: "",
                platform: "Website", platformIcon: "🔗",
                autoTags: [], attachments: [{ type: "LINK", url }],
            };
            try {
                const parsed = new URL(url);
                data.title = parsed.hostname.replace("www.", "") + parsed.pathname;
            } catch { data.title = url; }
        }

        // Remove loading overlay
        removeFetchingOverlay();

        currentExtractedData = data;
        await openSaveModal(data);
    }

    function showFetchingOverlay(url) {
        removeFetchingOverlay();

        const iconUrl = chrome.runtime.getURL("assets/icon-48.png");
        let displayHost = "";
        try { displayHost = new URL(url).hostname.replace("www.", ""); } catch { displayHost = "..."; }

        const overlay = document.createElement("div");
        overlay.id = `${FAVLIZ_PREFIX}-fetching-overlay`;
        // Set visible immediately via inline style
        overlay.style.cssText = "position:fixed!important;inset:0!important;background:rgba(0,0,0,0.55)!important;backdrop-filter:blur(6px)!important;display:flex!important;align-items:center!important;justify-content:center!important;z-index:2147483640!important;font-family:-apple-system,BlinkMacSystemFont,sans-serif!important;";
        overlay.innerHTML = `
            <style>@keyframes favlizSpin{to{transform:rotate(360deg)}}</style>
            <div style="display:flex;flex-direction:column;align-items:center;gap:14px;padding:32px 40px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.12);border-radius:20px;min-width:180px;">
                <img src="${iconUrl}" alt="FavLiz" width="36" height="36" style="border-radius:10px;">
                <div style="width:24px;height:24px;border:3px solid rgba(255,255,255,0.15);border-top-color:white;border-radius:50%;animation:favlizSpin 0.8s linear infinite;"></div>
                <p style="font-size:14px;font-weight:600;color:rgba(255,255,255,0.92);margin:0;">Loading info...</p>
                <p style="font-size:12px;color:rgba(255,255,255,0.45);margin:0;font-family:monospace;">${escapeHtml(displayHost)}</p>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    function removeFetchingOverlay() {
        const el = document.getElementById(`${FAVLIZ_PREFIX}-fetching-overlay`);
        if (el) el.remove();
    }

    // ─── Clipboard URL Prompt ─────────────────────────────────
    let clipboardPromptTimeout = null;

    function showClipboardPrompt(url) {
        // Don't show if modal is already open
        if (isModalOpen) return;

        // Remove existing prompt
        dismissClipboardPrompt();

        const prompt = document.createElement("div");
        prompt.id = `${FAVLIZ_PREFIX}-clipboard-prompt`;

        const iconUrl = chrome.runtime.getURL("assets/icon-48.png");
        const displayUrl = truncateClipboardUrl(url);

        prompt.innerHTML = `
            <div class="${FAVLIZ_PREFIX}-clipboard-header">
                <div class="${FAVLIZ_PREFIX}-clipboard-header-left">
                    <img src="${iconUrl}" alt="FavLiz" width="20" height="20">
                    <span class="${FAVLIZ_PREFIX}-clipboard-header-text">📋 Link copied — Save to FavLiz?</span>
                </div>
                <button class="${FAVLIZ_PREFIX}-clipboard-close" id="${FAVLIZ_PREFIX}-clipboard-close-btn">✕</button>
            </div>
            <div class="${FAVLIZ_PREFIX}-clipboard-body">
                <div class="${FAVLIZ_PREFIX}-clipboard-url">
                    <svg class="${FAVLIZ_PREFIX}-clipboard-url-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                    </svg>
                    <span class="${FAVLIZ_PREFIX}-clipboard-url-text" title="${escapeAttr(url)}">${escapeHtml(displayUrl)}</span>
                </div>
                <div class="${FAVLIZ_PREFIX}-clipboard-actions">
                    <button class="${FAVLIZ_PREFIX}-clipboard-save" id="${FAVLIZ_PREFIX}-clipboard-save-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                        </svg>
                        Save now
                    </button>
                    <button class="${FAVLIZ_PREFIX}-clipboard-dismiss" id="${FAVLIZ_PREFIX}-clipboard-dismiss-btn">No thanks</button>
                </div>
            </div>
        `;

        document.body.appendChild(prompt);

        // Animate in
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                prompt.classList.add("show");
            });
        });

        // Bind events
        document.getElementById(`${FAVLIZ_PREFIX}-clipboard-close-btn`).addEventListener("click", dismissClipboardPrompt);
        document.getElementById(`${FAVLIZ_PREFIX}-clipboard-dismiss-btn`).addEventListener("click", dismissClipboardPrompt);
        document.getElementById(`${FAVLIZ_PREFIX}-clipboard-save-btn`).addEventListener("click", async () => {
            const saveBtn = document.getElementById(`${FAVLIZ_PREFIX}-clipboard-save-btn`);
            saveBtn.disabled = true;
            saveBtn.innerHTML = `<span class="${FAVLIZ_PREFIX}-spinner" style="width:14px;height:14px;border-width:2px;"></span> Loading...`;

            dismissClipboardPrompt();

            // Check auth FIRST
            const authState = await sendMessage("GET_AUTH_STATE");
            if (!authState.isLoggedIn) {
                isModalOpen = true;
                showLoginModal({ url, title: "", description: "", thumbnail: "", platform: "Website", platformIcon: "🔗", autoTags: [], attachments: [{ type: "LINK", url }] });
                return;
            }

            let data = null;

            // Strategy 1: If copied URL is the current page, use extractors (same as FAB)
            const currentUrl = window.location.href;
            const isSamePage = isSameOriginUrl(url, currentUrl);

            if (isSamePage && window.FavLizExtractorRouter) {
                try {
                    data = window.FavLizExtractorRouter.extractPageData();
                    // Override URL with the exact copied URL (it may have different params)
                    if (data) {
                        data.url = url;
                        data.attachments = [{ type: "LINK", url: url }];
                    }
                } catch (e) {
                    console.warn("[FavLiz] Extractor failed for clipboard URL:", e);
                }
            }

            // Strategy 2: Fetch metadata from the URL via background script
            if (!data || !data.title) {
                try {
                    const result = await sendMessage("FETCH_URL_METADATA", { url });
                    if (result.success && result.metadata) {
                        data = {
                            ...result.metadata,
                            attachments: [{ type: "LINK", url: url }],
                        };
                    }
                } catch (e) {
                    console.warn("[FavLiz] Metadata fetch failed:", e);
                }
            }

            // Strategy 3: Fallback to minimal data
            if (!data) {
                data = {
                    title: "",
                    description: "",
                    url: url,
                    thumbnail: "",
                    platform: "Website",
                    platformIcon: "🔗",
                    autoTags: [],
                    attachments: [{ type: "LINK", url: url }],
                };
                try {
                    const parsed = new URL(url);
                    data.title = parsed.hostname.replace("www.", "") + parsed.pathname;
                    if (data.title.length > 80) data.title = data.title.slice(0, 77) + "...";
                } catch {
                    data.title = url;
                }
            }

            currentExtractedData = data;
            await openSaveModal(data);
        });

        // Auto-dismiss after 8 seconds
        clipboardPromptTimeout = setTimeout(() => {
            dismissClipboardPrompt();
        }, 8000);
    }

    function dismissClipboardPrompt() {
        clearTimeout(clipboardPromptTimeout);
        const prompt = document.getElementById(`${FAVLIZ_PREFIX}-clipboard-prompt`);
        if (prompt) {
            prompt.classList.remove("show");
            prompt.classList.add("hiding");
            setTimeout(() => prompt.remove(), 350);
        }
    }

    function truncateClipboardUrl(url) {
        try {
            const u = new URL(url);
            const full = u.hostname + u.pathname + u.search;
            return full.length > 50 ? full.slice(0, 47) + "..." : full;
        } catch {
            return url.length > 50 ? url.slice(0, 47) + "..." : url;
        }
    }

    // Listen for clipboard URL events from clipboard-watcher.js
    window.addEventListener("favliz-url-copied", (e) => {
        if (e.detail && e.detail.url) {
            console.log("[FavLiz] URL copied detected:", e.detail.url, "source:", e.detail.source);
            showClipboardPrompt(e.detail.url);
        }
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
    }

    // Wait for DOM ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        // Small delay to let extractors register
        setTimeout(init, 500);
    }
})();
