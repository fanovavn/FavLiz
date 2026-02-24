import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy – FavLiz",
    description: "FavLiz Privacy Policy - How we collect, use, and protect your personal information.",
};

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 no-underline">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logo.png" alt="FavLiz" style={{ height: "28px", width: "auto" }} />
                    </Link>
                    <Link
                        href="/"
                        className="text-sm font-medium no-underline"
                        style={{ color: "var(--primary)" }}
                    >
                        ← Back to Home
                    </Link>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-6 py-12">
                <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm border border-gray-100">
                    <h1 className="text-3xl font-bold mb-2" style={{ color: "#1E293B" }}>
                        Privacy Policy
                    </h1>
                    <p className="text-sm mb-10" style={{ color: "#94A3B8" }}>
                        Last updated: February 24, 2026
                    </p>

                    <div className="prose-custom space-y-8">
                        <section>
                            <h2>1. Introduction</h2>
                            <p>
                                Welcome to FavLiz. We respect your privacy and are committed to protecting your personal data.
                                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when
                                you use our web application, Chrome extension, and mobile application (collectively, the &ldquo;Services&rdquo;).
                            </p>
                        </section>

                        <section>
                            <h2>2. Information We Collect</h2>
                            <h3>2.1 Account Information</h3>
                            <p>When you create an account, we collect:</p>
                            <ul>
                                <li>Email address</li>
                                <li>Display name (optional)</li>
                                <li>Password (encrypted)</li>
                            </ul>

                            <h3>2.2 Content Data</h3>
                            <p>When you use our Services, we store:</p>
                            <ul>
                                <li>Links and bookmarks you save</li>
                                <li>Titles, descriptions, and notes you add</li>
                                <li>Tags and lists you create</li>
                                <li>Images you upload as attachments</li>
                                <li>Metadata fetched from saved URLs (thumbnails, page titles)</li>
                            </ul>

                            <h3>2.3 Usage Data</h3>
                            <p>We may automatically collect:</p>
                            <ul>
                                <li>Browser type and version</li>
                                <li>Device information</li>
                                <li>Access times and dates</li>
                                <li>Pages viewed within the application</li>
                            </ul>
                        </section>

                        <section>
                            <h2>3. How We Use Your Information</h2>
                            <p>We use the information we collect to:</p>
                            <ul>
                                <li>Provide, maintain, and improve our Services</li>
                                <li>Process and store your saved content</li>
                                <li>Authenticate your identity and manage your account</li>
                                <li>Send important service-related notifications</li>
                                <li>Respond to your requests and support inquiries</li>
                                <li>Analyze usage patterns to improve user experience</li>
                            </ul>
                        </section>

                        <section>
                            <h2>4. Data Sharing</h2>
                            <p>We do <strong>not</strong> sell your personal data. We may share information only in these cases:</p>
                            <ul>
                                <li><strong>Public content:</strong> Items you mark as &ldquo;Public&rdquo; may be visible to others via shared links.</li>
                                <li><strong>Service providers:</strong> We use trusted third-party services (e.g., hosting, storage) that may process data on our behalf.</li>
                                <li><strong>Legal requirements:</strong> If required by law, regulation, or legal process.</li>
                            </ul>
                        </section>

                        <section>
                            <h2>5. Data Storage & Security</h2>
                            <p>
                                Your data is stored securely using industry-standard encryption. We use Supabase for database
                                and file storage, which provides enterprise-grade security measures including:
                            </p>
                            <ul>
                                <li>Encryption at rest and in transit</li>
                                <li>Row-level security policies</li>
                                <li>Regular security audits</li>
                            </ul>
                        </section>

                        <section>
                            <h2>6. Chrome Extension</h2>
                            <p>Our Chrome Extension:</p>
                            <ul>
                                <li>Only accesses page data when you explicitly save a link</li>
                                <li>Does not track your browsing history</li>
                                <li>Does not inject ads or third-party scripts</li>
                                <li>Stores authentication tokens locally using Chrome&apos;s secure storage API</li>
                            </ul>
                        </section>

                        <section>
                            <h2>7. Cookies</h2>
                            <p>
                                We use essential cookies and local storage to maintain your session and preferences.
                                We do not use tracking cookies or third-party advertising cookies.
                            </p>
                        </section>

                        <section>
                            <h2>8. Your Rights</h2>
                            <p>You have the right to:</p>
                            <ul>
                                <li>Access your personal data</li>
                                <li>Correct inaccurate data</li>
                                <li>Delete your account and associated data</li>
                                <li>Export your data</li>
                                <li>Withdraw consent at any time</li>
                            </ul>
                        </section>

                        <section>
                            <h2>9. Children&apos;s Privacy</h2>
                            <p>
                                Our Services are not intended for children under 13 years of age.
                                We do not knowingly collect personal data from children.
                            </p>
                        </section>

                        <section>
                            <h2>10. Changes to This Policy</h2>
                            <p>
                                We may update this Privacy Policy from time to time. We will notify you of any changes by
                                posting the new policy on this page and updating the &ldquo;Last updated&rdquo; date.
                            </p>
                        </section>

                        <section>
                            <h2>11. Contact Us</h2>
                            <p>
                                If you have any questions about this Privacy Policy, please contact us at:{" "}
                                <a href="mailto:support@favliz.com" style={{ color: "var(--primary)" }}>
                                    support@favliz.com
                                </a>
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <style>{`
                .prose-custom h2 {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #1E293B;
                    margin-bottom: 0.75rem;
                }
                .prose-custom h3 {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #334155;
                    margin-top: 1rem;
                    margin-bottom: 0.5rem;
                }
                .prose-custom p {
                    font-size: 0.925rem;
                    line-height: 1.7;
                    color: #475569;
                    margin-bottom: 0.75rem;
                }
                .prose-custom ul {
                    list-style: disc;
                    padding-left: 1.5rem;
                    margin-bottom: 0.75rem;
                }
                .prose-custom li {
                    font-size: 0.925rem;
                    line-height: 1.7;
                    color: #475569;
                    margin-bottom: 0.25rem;
                }
                .prose-custom a {
                    text-decoration: none;
                    font-weight: 500;
                }
                .prose-custom a:hover {
                    text-decoration: underline;
                }
            `}</style>
        </div>
    );
}
