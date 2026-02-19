"use client";

import { useTagPopup } from "@/components/tag-detail-popup";

interface TagChipButtonProps {
    tagId: string;
    tagName: string;
}

export function TagChipButton({ tagId, tagName }: TagChipButtonProps) {
    const { openTag } = useTagPopup();

    return (
        <button
            onClick={() => openTag(tagId, tagName)}
            className="tag-chip cursor-pointer hover:opacity-80 transition-opacity"
            style={{ border: "none" }}
        >
            {tagName}
        </button>
    );
}
