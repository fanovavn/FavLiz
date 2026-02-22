"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getFirebaseAnalytics, trackPageView } from "@/lib/firebase";

/** Map pathname to a readable screen name for GA */
function getScreenName(pathname: string): string {
    if (pathname === "/") return "landing";
    if (pathname === "/login") return "login";
    if (pathname === "/register") return "register";
    if (pathname === "/forgot-password") return "forgot_password";
    if (pathname === "/dashboard") return "dashboard";
    if (pathname === "/items/new") return "item_create";
    if (/^\/items\/[^/]+\/edit$/.test(pathname)) return "item_edit";
    if (/^\/items\/[^/]+$/.test(pathname)) return "item_detail";
    if (pathname === "/items") return "items_list";
    if (pathname === "/lists/new") return "list_create";
    if (pathname === "/lists/uncategorized") return "uncategorized";
    if (/^\/lists\/[^/]+\/edit$/.test(pathname)) return "list_edit";
    if (/^\/lists\/[^/]+$/.test(pathname)) return "list_detail";
    if (pathname === "/lists") return "lists";
    if (/^\/tags\/[^/]+$/.test(pathname)) return "tag_detail";
    if (pathname === "/tags") return "tags";
    if (pathname === "/settings") return "settings";
    if (/^\/share\/item\//.test(pathname)) return "share_item";
    if (/^\/share\/list\//.test(pathname)) return "share_list";
    if (/^\/u\//.test(pathname)) return "public_profile";
    return pathname.replace(/\//g, "_").replace(/^_/, "");
}

export function FirebaseAnalytics() {
    const pathname = usePathname();

    // Initialize analytics on mount
    useEffect(() => {
        getFirebaseAnalytics();
    }, []);

    // Track page views on route changes
    useEffect(() => {
        const screenName = getScreenName(pathname);
        trackPageView(screenName, pathname);
    }, [pathname]);

    return null;
}
