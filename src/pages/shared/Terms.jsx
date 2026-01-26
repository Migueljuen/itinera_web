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
                        <p className="flex-1 text-base font-display text-black/50">{it}</p>
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
                            "By creating an account, accessing, or using the Platform, you agree to these Terms and any linked policies (including the Refund & Cancellation Policy).",
                            "If you do not agree, do not use the Platform.",
                        ]}
                    />

                    <SectionCard
                        title="2. What the Platform Is"
                        items={[
                            "The Platform helps connect Travelers who create itineraries and request/book services.",
                            "Creators who list Experiences (activities/places).",
                            "Guides and Drivers who provide trip services.",
                            "Admins who manage verification, itinerary payments, and policy enforcement.",
                            "Unless explicitly stated, the Platform is not a travel agency and does not directly provide Experiences or transport services.",
                            "Partners (Creators/Guides/Drivers) are responsible for delivering their services.",
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
                            "Partners may be asked for additional information for verification (e.g., government-issued ID, vehicle information, certifications, background checks).",
                            "Partners offering paid Experiences or services may be required to submit a valid business permit or proof of legal authority to operate, in accordance with applicable local laws.",
                            "Failure to provide required documents may result in delayed approval, listing removal, or account suspension.",
                            "Verification may reduce risk but is not a guarantee of quality or safety.",
                        ]}
                    />

                    <SectionCard
                        title="5. Bookings and Itineraries"
                        items={[
                            "An itinerary may include multiple Experiences and services.",
                            'A "Booking" is considered confirmed only when the payment has been acknowledged by the admin.',
                            "Time slots, price, and meeting locations are set by Partners and may change with notice.",
                        ]}
                    />

                    <SectionCard
                        title="6. Payments (Manual via GCash)"
                        items={[
                            "Important: The Platform does not process payments in-app. Payments are made manually via GCash between Traveler and the Platform Admin.",
                            "Payment Instructions: You will only pay using the official payment details shown in the Platform.",
                            "Proof of Payment: You may be required to upload/send proof of payment (screenshot/receipt reference).",
                            "Confirmation: A booking is not fully confirmed until the admin confirms receipt.",
                            "Fees: Any GCash fees or transfer charges are paid by Traveler unless stated otherwise.",
                            "Wrong Transfers / Scams: If you send money to the wrong number or a scammer, the Platform's ability to recover funds may be limited. Always verify details before sending.",
                        ]}
                    />

                    <SectionCard
                        title="7. Refunds, Cancellations, No-Shows"
                        items={[
                            "Refunds and cancellations are governed by the Refund & Cancellation Policy, which is part of these Terms.",
                        ]}
                    />

                    <SectionCard
                        title="8. User Conduct"
                        items={[
                            "You must not harass, threaten, scam, or discriminate against others.",
                            "You must not post fraudulent listings, fake reviews, or misleading booking details.",
                            "You must not attempt to bypass platform rules (e.g., manipulating proof of payment).",
                            "You must not upload illegal content.",
                        ]}
                    />

                    <SectionCard
                        title="9. Listings, Accuracy, and Partner Responsibilities"
                        items={[
                            "Partners are responsible for accurate listings (price, inclusions, schedules, safety requirements).",
                            "Partners must deliver what is promised in the listing and confirmed in booking messages.",
                        ]}
                    />

                    <SectionCard
                        title="10. Messaging and Communication"
                        items={[
                            "The Platform provides in-app messaging.",
                            "We may review messages when necessary to investigate abuse reports, prevent fraud, or comply with law.",
                        ]}
                    />

                    <SectionCard
                        title="11. User Content (Reviews, Photos, Listings)"
                        items={[
                            "You keep ownership of your content, but you grant the Platform permission to store, display, and use it to operate the Platform.",
                            "Content must be truthful and non-infringing.",
                        ]}
                    />

                    <SectionCard
                        title="12. Safety Disclaimer / Assumption of Risk"
                        items={[
                            "Travel and activities involve risks (weather, terrain, transport, third parties).",
                            "You are responsible for assessing suitability and following safety guidance.",
                        ]}
                    />

                    <SectionCard
                        title="13. Disclaimers"
                        items={[
                            'The Platform is provided "as is" and "as available."',
                            "We do not guarantee uninterrupted service or that all listings will be error-free.",
                        ]}
                    />

                    <SectionCard
                        title="14. Limitation of Liability"
                        items={[
                            "To the fullest extent allowed by law, the Platform is not liable for indirect or consequential damages.",
                        ]}
                    />

                    <SectionCard
                        title="15. Suspension and Termination"
                        items={[
                            "We may suspend or terminate accounts for fraud, abuse, policy violations, or safety concerns.",
                        ]}
                    />

                    <SectionCard
                        title="16. Governing Law"
                        items={[
                            "These Terms are governed by the laws of the Republic of the Philippines.",
                            "Disputes will be handled in the appropriate courts, unless consumer protection laws require otherwise.",
                        ]}
                    />

                    {/* Refund & Cancellation Policy Section */}
                    <div className="mt-6 mb-4">
                        <h2 className="text-2xl font-display font-semibold text-black/90 leading-tight">
                            Refund &amp; Cancellation Policy
                        </h2>
                        <p className="mt-2 text-base text-black/50 font-display">
                            This policy applies to bookings arranged through the Platform where payment is made manually via GCash.
                        </p>
                    </div>

                    <SectionCard
                        title="A. Payment Types"
                        items={[
                            "Downpayment: 50% of the total itinerary price.",
                            "Fully Paid: 100% of the total itinerary price.",
                        ]}
                    />

                    <SectionCard
                        title="B. Traveler-Initiated Cancellation"
                        items={[
                            "Each activity in your itinerary is treated as a separate booking.",
                            "Downpayment (50%): Non-refundable. If you cancel a booking, the activity is removed and no refund shall be processed.",
                            "Fully paid (100%): 50% of the cancelled activity's cost will be refunded.",
                            "Any GCash fees/transfer charges are non-refundable.",
                            "Refunds are processed back to the payer's GCash number.",
                        ]}
                    />

                    <SectionCard
                        title="C. No-Show Policy"
                        items={[
                            "If you do not arrive for a scheduled activity, it is treated as a no-show for that booking.",
                            "No-shows are not refundable, whether downpayment or fully paid.",
                        ]}
                    />

                    <SectionCard
                        title="D. Partner-Initiated Cancellation"
                        items={[
                            "If the Partner cancels a confirmed booking (except force majeure/safety), the Traveler is entitled to a full refund of amounts paid (downpayment or full).",
                            "The Partner must provide valid proof/reason for cancelling (e.g., emergency, verified safety issue, unavailability due to uncontrollable circumstances).",
                            "Frequent or repeated Partner-initiated cancellations may result in warnings, reduced visibility, temporary suspension, or account termination.",
                        ]}
                    />

                    <SectionCard
                        title="E. Force Majeure / Safety Cancellations"
                        items={[
                            "Events outside reasonable control may include severe weather warnings, natural disasters, government restrictions, or safety risks.",
                            "Outcome: Reschedule without penalty.",
                        ]}
                    />

                    <SectionCard
                        title="F. Disputes and Evidence Window"
                        items={[
                            "If you believe a service was not delivered as agreed, report it within 48 hours of the scheduled start time.",
                            "Provide evidence (messages, photos, receipts).",
                            "The Platform may mediate but does not guarantee recovery because payments are manual/off-platform.",
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
