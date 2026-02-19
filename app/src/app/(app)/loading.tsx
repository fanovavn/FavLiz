export default function AppLoading() {
    return (
        <div className="px-6 md:px-10 py-8 max-w-[1280px] mx-auto animate-pulse">
            {/* Header skeleton */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div
                        className="w-9 h-9"
                        style={{
                            borderRadius: "var(--radius-md)",
                            background: "rgba(0,0,0,0.06)",
                        }}
                    />
                    <div>
                        <div
                            className="h-7 w-48 mb-2"
                            style={{
                                borderRadius: "var(--radius-sm)",
                                background: "rgba(0,0,0,0.06)",
                            }}
                        />
                        <div
                            className="h-4 w-72"
                            style={{
                                borderRadius: "var(--radius-sm)",
                                background: "rgba(0,0,0,0.04)",
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Content skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                        key={i}
                        className="overflow-hidden"
                        style={{
                            borderRadius: "var(--radius-lg)",
                            background: "rgba(255,255,255,0.6)",
                            border: "1px solid rgba(226,232,240,0.5)",
                        }}
                    >
                        <div
                            className="w-full"
                            style={{
                                aspectRatio: "16/10",
                                background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(236,72,153,0.06))",
                            }}
                        />
                        <div className="p-4">
                            <div
                                className="h-4 w-3/4 mb-2"
                                style={{
                                    borderRadius: "var(--radius-sm)",
                                    background: "rgba(0,0,0,0.06)",
                                }}
                            />
                            <div
                                className="h-3 w-full mb-3"
                                style={{
                                    borderRadius: "var(--radius-sm)",
                                    background: "rgba(0,0,0,0.04)",
                                }}
                            />
                            <div className="flex gap-1.5 mb-3">
                                {[1, 2].map((j) => (
                                    <div
                                        key={j}
                                        className="h-5 w-12"
                                        style={{
                                            borderRadius: "var(--radius-full)",
                                            background: "rgba(0,0,0,0.04)",
                                        }}
                                    />
                                ))}
                            </div>
                            <div className="flex items-center justify-between">
                                <div
                                    className="h-3 w-20"
                                    style={{
                                        borderRadius: "var(--radius-sm)",
                                        background: "rgba(0,0,0,0.04)",
                                    }}
                                />
                                <div
                                    className="h-5 w-16"
                                    style={{
                                        borderRadius: "var(--radius-full)",
                                        background: "rgba(0,0,0,0.04)",
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
