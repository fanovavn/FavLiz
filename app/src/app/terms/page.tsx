import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service – FavLiz",
    description: "FavLiz Terms of Service - Rules and guidelines for using FavLiz services.",
};

export default function TermsOfServicePage() {
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
                        Terms of Service
                    </h1>
                    <p className="text-sm mb-10" style={{ color: "#94A3B8" }}>
                        Last updated: February 24, 2026
                    </p>

                    <div className="prose-custom space-y-8">
                        <section>
                            <h2>1. Acceptance of Terms</h2>
                            <p>
                                By accessing or using FavLiz (&ldquo;the Service&rdquo;), including our web application, Chrome extension,
                                and mobile application, you agree to be bound by these Terms of Service. If you do not agree
                                to these terms, please do not use the Service.
                            </p>
                        </section>

                        <section>
                            <h2>2. Description of Service</h2>
                            <p>
                                FavLiz is a personal bookmarking and content organization platform that allows users to:
                            </p>
                            <ul>
                                <li>Save and organize links, bookmarks, and content</li>
                                <li>Create collections and tag items for easy retrieval</li>
                                <li>Share selected items publicly via shareable links</li>
                                <li>Access saved content across web, extension, and mobile platforms</li>
                            </ul>
                        </section>

                        <section>
                            <h2>3. User Accounts</h2>
                            <h3>3.1 Registration</h3>
                            <p>
                                You must create an account to use the Service. You agree to provide accurate information
                                and keep your account credentials secure. You are responsible for all activities under your account.
                            </p>
                            <h3>3.2 Account Security</h3>
                            <p>
                                You are responsible for maintaining the confidentiality of your password.
                                Notify us immediately if you suspect unauthorized access to your account.
                            </p>
                        </section>

                        <section>
                            <h2>4. User Content</h2>
                            <h3>4.1 Ownership</h3>
                            <p>
                                You retain all rights to the content you save, create, and upload to FavLiz.
                                We do not claim ownership of your content.
                            </p>
                            <h3>4.2 License</h3>
                            <p>
                                By using the Service, you grant FavLiz a limited license to store, display, and process
                                your content solely for the purpose of providing the Service to you.
                            </p>
                            <h3>4.3 Public Content</h3>
                            <p>
                                Content you mark as &ldquo;Public&rdquo; may be accessible to anyone with the shared link.
                                You are responsible for ensuring you have the right to share such content publicly.
                            </p>
                        </section>

                        <section>
                            <h2>5. Acceptable Use</h2>
                            <p>You agree <strong>not</strong> to:</p>
                            <ul>
                                <li>Use the Service for any illegal or unauthorized purpose</li>
                                <li>Upload or share content that infringes intellectual property rights</li>
                                <li>Distribute malware, spam, or harmful content</li>
                                <li>Attempt to gain unauthorized access to other accounts or systems</li>
                                <li>Use automated tools to scrape or abuse the Service</li>
                                <li>Interfere with or disrupt the Service&apos;s infrastructure</li>
                            </ul>
                        </section>

                        <section>
                            <h2>6. Intellectual Property</h2>
                            <p>
                                The FavLiz name, logo, and all related trademarks, service marks, and branding are the
                                property of FavLiz. The Service&apos;s design, code, and features are protected by copyright
                                and other intellectual property laws.
                            </p>
                        </section>

                        <section>
                            <h2>7. Third-Party Links</h2>
                            <p>
                                The Service allows you to save links to third-party websites. We are not responsible for
                                the content, accuracy, or practices of external websites. Accessing third-party links is
                                at your own risk.
                            </p>
                        </section>

                        <section>
                            <h2>8. Service Availability</h2>
                            <p>
                                We strive to maintain high availability but do not guarantee uninterrupted access.
                                The Service may be temporarily unavailable due to maintenance, updates, or circumstances
                                beyond our control. We reserve the right to modify, suspend, or discontinue features
                                at any time.
                            </p>
                        </section>

                        <section>
                            <h2>9. Limitation of Liability</h2>
                            <p>
                                FavLiz is provided &ldquo;as is&rdquo; without warranties of any kind. To the maximum extent
                                permitted by law, FavLiz shall not be liable for any indirect, incidental, special,
                                or consequential damages arising from your use of the Service, including loss of data
                                or content.
                            </p>
                        </section>

                        <section>
                            <h2>10. Account Termination</h2>
                            <p>
                                You may delete your account at any time through the Settings page. We reserve the right
                                to suspend or terminate accounts that violate these Terms. Upon termination, your data
                                will be deleted in accordance with our Privacy Policy.
                            </p>
                        </section>

                        <section>
                            <h2>11. Changes to Terms</h2>
                            <p>
                                We may update these Terms from time to time. Continued use of the Service after changes
                                constitutes acceptance of the updated Terms. We will notify users of significant changes
                                via email or in-app notification.
                            </p>
                        </section>

                        <section>
                            <h2>12. Governing Law</h2>
                            <p>
                                These Terms shall be governed by and construed in accordance with the laws of Vietnam.
                                Any disputes arising from these Terms shall be resolved through good-faith negotiation
                                or, if necessary, through the appropriate courts of Vietnam.
                            </p>
                        </section>

                        <section>
                            <h2>13. Contact Us</h2>
                            <p>
                                If you have any questions about these Terms, please contact us at:{" "}
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
