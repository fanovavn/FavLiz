"use client";

import { createContext, useContext, ReactNode } from "react";

interface ItemsLabelContextType {
    itemsLabel: string;       // e.g. "Món ăn", "Items"
    singleItemLabel: string;  // e.g. "món ăn", "item"
}

const ItemsLabelContext = createContext<ItemsLabelContextType>({
    itemsLabel: "Items",
    singleItemLabel: "item",
});

function deriveSingle(label: string): string {
    if (!label || label === "Items") return "item";
    // For custom labels, return lowercase version
    return label.toLowerCase();
}

interface Props {
    itemsLabel: string | null;
    children: ReactNode;
}

export function ItemsLabelProvider({ itemsLabel, children }: Props) {
    const label = itemsLabel || "Items";
    const single = deriveSingle(label);

    return (
        <ItemsLabelContext.Provider value={{ itemsLabel: label, singleItemLabel: single }}>
            {children}
        </ItemsLabelContext.Provider>
    );
}

export function useItemsLabel() {
    return useContext(ItemsLabelContext);
}
