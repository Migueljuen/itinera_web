// pages/(shared)/Terms.jsx (Web)
// React + react-router-dom + TailwindCSS
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function SectionCard({ title, items }) {
    return (
        <div className="py-4 mb-4 rounded-2xl bg-white">
            <div className="flex items-center mb-1">
                <div className="flex-1">
                    <h3 className="text-lg font-display font-semibold text-black/90">
                        {title}
                    </h3>
                </div>
            </div>

            <div className="space-y-2">
                {items.map((it, idx) => (
                    <div key={`${title}-${idx}`} className="flex items-baseline gap-3">
                        <div className="w-2 h-2 bg-black/70 rounded-full flex-shrink-0 mt-1.5" />
                        <p className="flex-1 text-base font-display text-black/70">{it}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function Terms() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white">
            {/* Header with back button */}
            <div className="flex items-center px-6 pt-12 pb-4">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors"
                    aria-label="Go back"
                >
                    <ArrowLeft size={24} className="text-[#191313]" />
                </button>
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-10 pb-16">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-display font-semibold text-black/90 leading-tight">
                        Terms of Service
                    </h1>
                    <p className="mt-2 text-base text-black/50 font-display">
                        Effective Date: January 24, 2026
                    </p>
                    <p className="mt-1 text-sm text-black/40 font-display">
                        Contact: itinera.team.app@gmail.com
                    </p>
                </div>

                <div className="animate-fade-in">
                    <SectionCard
                        title="1. Acceptance of Terms"
                        items={[
                            "By creating an account, accessing, or using the Platform, you agree to these Terms and any linked policies.",
                            "If you do not agree, do not use the Platform.",
                        ]}
                    />

                    <SectionCard
                        title="2. What the Platform Is"
                        items={[
                            "The Platform helps connect Travelers who create itineraries and book Experiences/services from Partners.",
                            "Partners may include Experience Creators (activity publishers), Guides, and Drivers.",
                            "The Platform provides discovery, itinerary planning tools, booking coordination, and account/verification workflows.",
                            "Unless explicitly stated, the Platform is not a travel agency and does not directly provide Experiences, tours, guiding, or transport services.",
                            "Partners are responsible for delivering the services they list and offer.",
                        ]}
                    />

                    <SectionCard
                        title="3. Eligibility and Accounts"
                        items={[
                            "You agree to provide accurate information and keep your login secure.",
                            "You are responsible for all activity under your account.",
                        ]}
                    />

                    <SectionCard
                        title="4. Roles and Partner Verification"
                        items={[
                            "Partners may be asked for additional information for verification (e.g., government-issued ID, certifications, vehicle information).",
                            "Partners offering paid Experiences or services may be required to submit a valid business permit or proof of legal authority to operate, in accordance with applicable local laws.",
                            "Failure to provide required documents may result in delayed approval, listing removal, or account suspension.",
                            "Verification may reduce risk but is not a guarantee of quality or safety.",
                        ]}
                    />

                    {/* ✅ UPDATED: pricing + subscription requirement */}
                    <SectionCard
                        title="5. Partner Registration Fee and Subscription Requirement"
                        items={[
                            "New Partners are required to pay a one-time registration fee to activate their Partner account.",
                            "Registration fee: ₱1,299 (one-time).",
                            "The registration fee includes one (1) month of basic subscription access starting from activation.",
                            "After the 1 month: Basic subscription is ₱599/month and Pro subscription is ₱999/month.",
                            "Only subscribed Partners can preview their activity/listing as it appears to Travelers and receive bookings through the Platform.",
                            "If a Partner’s subscription ends, their ability to receive bookings and certain Partner features may be restricted until subscription is renewed.",
                            "Subscription tiers, inclusions, and pricing may be updated with notice on the Platform.",
                        ]}
                    />

                    <SectionCard
                        title="6. Bookings and Itineraries"
                        items={[
                            "An itinerary may include multiple Experiences and services; each booked Experience/service is treated as a separate booking.",
                            'A booking may be "Pending" (awaiting required payment) or "Confirmed" (ready/secured).',
                            "If an Experience requires payment, the booking remains Pending until payment is completed and acknowledged in the Platform.",
                            "Time slots, price, inclusions, meeting points, and policies are set by Partners and may change with notice (changes will not apply retroactively to already-confirmed bookings unless required for safety/legal reasons).",
                            "Availability and capacity limits apply per time slot/date. Attempts to book beyond capacity may be rejected or cancelled.",
                        ]}
                    />

                    <SectionCard
                        title="7. Payments and Fees"
                        items={[
                            "Payments are handled directly per booking and are not processed by the Platform unless explicitly stated in-product.",
                            "The Platform does not charge Travelers a platform commission per booking. The Platform earns through Partner registration and subscription fees.",
                            "Partners are responsible for setting the price of their Experiences/services and for communicating any additional requirements clearly (where applicable).",
                        ]}
                    />

                    <SectionCard
                        title="8. Disputes, Cancellations, and Service Issues"
                        items={[
                            "Cancellations, reschedules, no-shows, and refund eligibility (if any) are determined by the Partner’s stated booking policy and any applicable consumer protection laws.",
                            "If you believe a service was not delivered as agreed, report the issue within a reasonable time and provide relevant evidence (messages, photos, receipts).",
                            "The Platform may assist with communication or mediation, but outcomes may depend on the Partner’s policies and the payment method used.",
                            "Force majeure and safety-related disruptions (e.g., severe weather, government restrictions) may require rescheduling or cancellation for safety.",
                        ]}
                    />

                    <SectionCard
                        title="9. User Conduct"
                        items={[
                            "You must not harass, threaten, scam, or discriminate against others.",
                            "You must not post fraudulent listings, fake reviews, or misleading booking details.",
                            "You must not attempt to bypass platform rules or abuse booking/availability systems.",
                            "You must not upload illegal, harmful, or infringing content.",
                        ]}
                    />

                    <SectionCard
                        title="10. Listings, Accuracy, and Partner Responsibilities"
                        items={[
                            "Partners are responsible for accurate listings (price, inclusions, schedules, safety requirements, and any restrictions).",
                            "Partners must deliver what is promised in the listing and confirmed in booking messages.",
                            "Partners must comply with applicable laws and regulations relevant to their services.",
                        ]}
                    />

                    <SectionCard
                        title="11. Messaging and Communication"
                        items={[
                            "The Platform may provide in-app messaging for coordination.",
                            "We may review messages when necessary to investigate abuse reports, prevent fraud, ensure safety, or comply with law.",
                        ]}
                    />

                    <SectionCard
                        title="12. User Content (Reviews, Photos, Listings)"
                        items={[
                            "You keep ownership of your content, but you grant the Platform permission to store, display, and use it to operate and improve the Platform.",
                            "Content must be truthful, lawful, and non-infringing.",
                        ]}
                    />

                    <SectionCard
                        title="13. Safety Disclaimer / Assumption of Risk"
                        items={[
                            "Travel and activities involve risks (weather, terrain, transport, third parties).",
                            "You are responsible for assessing suitability and following safety guidance and local rules.",
                        ]}
                    />

                    <SectionCard
                        title="14. Disclaimers"
                        items={[
                            'The Platform is provided "as is" and "as available."',
                            "We do not guarantee uninterrupted service or that all listings will be error-free.",
                            "We do not guarantee outcomes of bookings, Partner performance, or Traveler satisfaction.",
                        ]}
                    />

                    <SectionCard
                        title="15. Limitation of Liability"
                        items={[
                            "To the fullest extent allowed by law, the Platform is not liable for indirect, incidental, or consequential damages.",
                            "To the extent permitted by law, any liability related to the Platform is limited to amounts paid to the Platform for registration/subscription (if any) within a reasonable period.",
                        ]}
                    />

                    <SectionCard
                        title="16. Suspension and Termination"
                        items={[
                            "We may suspend or terminate accounts for fraud, abuse, policy violations, repeated cancellations, safety concerns, or misuse of the Platform.",
                            "We may restrict Partner visibility or booking access for non-compliance, expired subscription, or verification failures.",
                        ]}
                    />

                    <SectionCard
                        title="17. Governing Law"
                        items={[
                            "These Terms are governed by the laws of the Republic of the Philippines.",
                            "Disputes will be handled in the appropriate courts, unless consumer protection laws require otherwise.",
                        ]}
                    />

                    {/* Contact Section */}
                    <div className="mt-4 mb-8 py-4 px-5 bg-black/5 rounded-xl">
                        <h3 className="text-base font-display font-semibold text-black/90 mb-2">
                            Contact
                        </h3>
                        <p className="text-base font-display text-black/50 whitespace-pre-line">
                            For support, disputes, or policy questions:{"\n"}
                            itinera.team.app@gmail.com
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
