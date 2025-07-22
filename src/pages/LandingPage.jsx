import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Import your images here
import logoImage from '../assets/images/logo.png';
import UndrawSvg from '../assets/images/undraw.svg';
import Undraw1Svg from '../assets/images/undraw1.svg';
import Undraw2Svg from '../assets/images/undraw2.svg';

const LandingPage = () => {
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSignIn = () => {
        navigate('/login');
    };


    const features = [
        {
            title: "Authentic Experiences",
            description: "Immerse yourself in unique, local adventures curated to help you live the culture, not just see it."
        },
        {
            title: "Story-Driven Travel",
            description: "Every experience is a chapter. Build memories through curated moments that tell a story worth sharing."
        },
        {
            title: "Moments That Matter",
            description: "From breathtaking views to quiet local rituals, find moments that make your trip truly meaningful."
        }
    ];

    const footerSections = [
        {
            title: "Legal",
            links: ["Terms and Conditions", "Privacy Policy"]
        },
        {
            title: "Support",
            links: ["Contact Us"]
        },
        {
            title: "Other",
            links: ["FAQs", "About Us"]
        },
        {
            title: "Itineraries",
            links: ["Destinations"]
        }
    ];

    return (
        <div className="min-h-screen bg-white ">
            {/* Header */}
            <header
                className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
                    }`}
            >
                <div className="container mx-auto px-4 lg:px-8 ">
                    <div className="flex justify-between items-center">
                        <img
                            src={logoImage}
                            alt="Itinera Logo"
                            className="w-20 h-20 lg:w-24 lg:h-24 cursor-pointer transition-transform hover:scale-105"
                        />
                        <button
                            onClick={handleSignIn}
                            className="bg-[#274b46] text-white px-4 py-2 lg:px-6 lg:py-3 rounded-md hover:bg-[#376a63] transition-all duration-300 transform hover:scale-105"
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-32 lg:pt-48 pb-16 lg:pb-48 bg-gradient-to-br from-gray-50 to-white">
                <div className="container mx-auto px-4 lg:px-8 text-center">
                    <h1 className="text-4xl lg:text-6xl font-medium text-[#1f2937] mb-4">
                        <span className="block">Experience more.</span>
                        <span className="block">Plan less.</span>
                    </h1>
                    <p className="text-[#6b7280] text-lg lg:text-xl max-w-2xl mx-auto mb-8">
                        Craft Your Perfect Journey: Tailored Itineraries for Every Adventure.
                    </p>
                    <button
                        onClick={handleSignIn}
                        className="bg-[#7dcb80] text-white px-6 py-3 lg:px-8 lg:py-4 rounded-md hover:bg-[#fdd744] transition-all duration-300 transform hover:scale-105 text-lg"
                    >
                        Get started
                    </button>
                </div>
            </section>

            {/* Uncover Section */}
            <section className="bg-[#376a63] py-16 lg:py-24">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="max-w-4xl mx-auto lg:mx-0">
                        <h2 className="text-3xl lg:text-5xl font-extrabold text-white mb-4">
                            <span className="text-[#fdd744]">Uncover</span> Real Experiences
                        </h2>
                        <p className="text-gray-300 text-lg lg:text-xl max-w-2xl">
                            Go beyond the itinerary—discover unique moments that make every trip unforgettable.
                        </p>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-16 lg:py-24">
                <div className="container mx-auto px-4 lg:px-8">
                    {/* Personalized Recommendations */}
                    <div className="grid lg:grid-cols-2 gap-16 mb-16 items-center">
                        <div className="order-2 lg:order-1 flex justify-center">
                            <img
                                src={UndrawSvg}
                                alt="Personalized Recommendations"
                                className="w-48 h-48 lg:w-64 lg:h-64"
                            />
                        </div>
                        <div className="order-1 lg:order-2 text-left lg:text-right">
                            <h3 className="text-3xl lg:text-4xl font-extrabold text-[#1f2937] mb-4">
                                Personalized{' '}
                                <span className="bg-[#7dcb80] text-white px-2 py-1">Recommendations</span>
                            </h3>
                            <p className="text-[#6b7280] text-lg">
                                Plan, customize, and optimize your trips. Whether it's for vacations or everyday adventures.
                            </p>
                        </div>
                    </div>

                    {/* Feel Every Moment */}
                    <div className="grid lg:grid-cols-2 gap-16 items-center">

                        <div>
                            <h3 className="text-3xl lg:text-4xl font-extrabold text-[#1f2937] mb-4">
                                <span className="bg-[#7dcb80] text-white px-2 py-1">Feel</span> Every Moment
                            </h3>
                            <p className="text-[#6b7280] text-lg">
                                It's not about where you go, but how it makes you feel. Travel with meaning.
                            </p>
                        </div>
                        <div className="flex justify-center">
                            <img
                                src={Undraw1Svg}
                                alt="Feel Every Moment"
                                className="w-48 h-48 lg:w-64 lg:h-64"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* What We Offer */}
            <section className="bg-gray-50 py-16 lg:py-24">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="text-center mb-12">
                        <img
                            src={Undraw2Svg}
                            alt="What We Offer"
                            className="w-32 h-32 mx-auto mb-6"
                        />
                        <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1f2937] mb-4">
                            What We Offer
                        </h2>
                        <p className="text-[#6b7280] text-lg max-w-3xl mx-auto">
                            Discover meaningful experiences that go beyond schedules. Explore, feel, and connect with each destination in a way that's truly unforgettable. ✨
                        </p>
                    </div>

                    {/* Feature Cards */}
                    <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-lg transition-shadow duration-300 transform hover:scale-105"
                            >
                                <div className="flex items-center mb-4">
                                    <img
                                        src={Undraw2Svg}
                                        alt={feature.title}
                                        className="w-12 h-12 mr-3"
                                    />
                                    <h4 className="text-xl font-bold text-[#1f2937]">{feature.title}</h4>
                                </div>
                                <p className="text-gray-500">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-16">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="text-center mb-8">
                        <img
                            src={logoImage}
                            alt="Itinera Logo"
                            className="w-24 h-24 mx-auto mb-4"
                        />
                        <p className="text-gray-500 max-w-md mx-auto">
                            Turn your next trip into a hassle-free experience with Itinera.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        {footerSections.map((section, index) => (
                            <div key={index} className="text-center md:text-left">
                                <h5 className="font-semibold mb-3 text-[#1f2937]">{section.title}</h5>
                                {section.links.map((link, linkIndex) => (
                                    <a
                                        key={linkIndex}
                                        href="#"
                                        className="block text-gray-500 hover:text-[#274b46] transition-colors duration-300 mb-1"
                                    >
                                        {link}
                                    </a>
                                ))}
                            </div>
                        ))}
                    </div>

                    <div className="text-center pt-8 border-t border-gray-200">
                        <p className="text-[#6b7280]">© 2025 Itinera. All rights reserved</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;