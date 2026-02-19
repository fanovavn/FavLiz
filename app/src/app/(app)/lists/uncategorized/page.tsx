import Link from "next/link";
import { ArrowLeft, Inbox } from "lucide-react";
import { getUncategorizedItems } from "@/lib/list-actions";
import { getItemsLabel, getLanguage } from "@/lib/user-actions";
import { t } from "@/lib/i18n";
import { ItemCard } from "@/components/item-card";

export default async function UncategorizedPage() {
    const items = await getUncategorizedItems();
    const itemsLabel = await getItemsLabel();
    const locale = await getLanguage();
    const singleItemLabel =
        itemsLabel === "Items"
            ? t(locale, "items.title").toLowerCase()
            : itemsLabel.toLowerCase();

    return (
        <div className="px-4 sm:px-6 md:px-10 py-6 md:py-8 max-w-[1280px] mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 md:mb-8">
                <div className="flex items-center gap-3 min-w-0">
                    <Link
                        href="/lists"
                        className="w-9 h-9 flex items-center justify-center cursor-pointer transition-colors shrink-0"
                        style={{
                            borderRadius: "var(--radius-md)",
                            background: "rgba(255,255,255,0.6)",
                            border: "1px solid rgba(226,232,240,0.8)",
                            color: "var(--muted)",
                            textDecoration: "none",
                        }}
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div className="min-w-0">
                        <h1
                            className="text-xl sm:text-2xl font-bold truncate"
                            style={{ color: "#1E293B" }}
                        >
                            {t(locale, "lists.uncategorized")}
                        </h1>
                        <p
                            className="text-sm mt-0.5"
                            style={{ color: "var(--muted)" }}
                        >
                            {t(locale, "lists.uncategorizedDesc", {
                                item: singleItemLabel,
                            })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Items */}
            {items.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        style={{
                            background:
                                "color-mix(in srgb, var(--primary) 8%, transparent)",
                        }}
                    >
                        <Inbox
                            className="w-8 h-8"
                            style={{ color: "var(--primary)" }}
                        />
                    </div>
                    <h3
                        className="text-lg font-semibold mb-1"
                        style={{ color: "#1E293B" }}
                    >
                        {t(locale, "lists.noItemsInList", {
                            item: singleItemLabel,
                        })}
                    </h3>
                    <p
                        className="text-sm"
                        style={{ color: "var(--muted)" }}
                    >
                        {t(locale, "lists.noItemsInListDesc", {
                            item: singleItemLabel,
                        })}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {items.map((item) => (
                        <ItemCard key={item.id} item={item} />
                    ))}
                </div>
            )}
        </div>
    );
}
