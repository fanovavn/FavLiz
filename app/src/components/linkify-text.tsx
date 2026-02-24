"use client";

import React from "react";

const URL_REGEX = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/g;

export function LinkifyText({ text, className, style }: {
    text: string;
    className?: string;
    style?: React.CSSProperties;
}) {
    const parts = text.split(URL_REGEX);

    return (
        <p className={className} style={style}>
            {parts.map((part, i) =>
                URL_REGEX.test(part) ? (
                    <a
                        key={i}
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            color: "var(--primary)",
                            textDecoration: "underline",
                            textUnderlineOffset: "2px",
                            wordBreak: "break-all",
                        }}
                    >
                        {part}
                    </a>
                ) : (
                    <React.Fragment key={i}>{part}</React.Fragment>
                )
            )}
        </p>
    );
}
