import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

// Import your images here
import logoImage from "../../assets/images/logo.png";
import UndrawSvg from "../../assets/images/undraw.svg";
import Undraw1Svg from "../../assets/images/undraw1.svg";
import Undraw2Svg from "../../assets/images/undraw2.svg";
import Button from "../../components/Button";
import mockup from "../../assets/images/test2.png";
import mockup1 from "../../assets/images/mockup1.png";
import mockup2 from "../../assets/images/mockup2.png";
import {
  MapIcon,
  SparklesIcon,
  CalendarDaysIcon,
  UsersIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  GlobeAltIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/solid";

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignIn = () => {
    navigate("/login");
  };

  const footerSections = [
    {
      title: "Legal",
      links: ["Terms and Conditions", "Privacy Policy"],
    },
    {
      title: "Support",
      links: ["Contact Us"],
    },
    {
      title: "Other",
      links: ["FAQs", "About Us"],
    },
    {
      title: "Itineraries",
      links: ["Destinations", "Become a host"],
    },
  ];

  return (
    <div className="min-h-screen bg-white font-display">
      {/* Header */}
      <header
        className={`fixed top-5 w-full z-50 transition-all duration-300 ' `}
      >
        <div className="container bg-white/50 md:w-[90%] lg:w-11/12 xl:w-4/5 max-w-[1440px]  mx-auto rounded-full p-4 drop-shadow-xl backdrop-blur-sm  ">
          <div className="xl:grid xl:grid-cols-3 xl:items-center md:flex md:justify-between md:items-center">
            {/* Logo */}
            <div className="ml-4 mb-2">
              <img
                src={logoImage}
                alt="Itinera Logo"
                className="w-24 cursor-pointer transition-transform"
              />
            </div>

            {/* Nav Links (center column) */}
            <div className="flex justify-center space-x-10 text-base font-medium text-[#1f2937] ">
              <a
                href="#features"
                className="hover:text-[#1f2937]/60 transition-colors "
              >
                Features
              </a>
              <a
                href="#why"
                className="hover:text-[#1f2937]/60 transition-colors"
              >
                Why Itinera
              </a>
              <a
                href="#pricing"
                className="hover:text-[#1f2937]/60 transition-colors"
              >
                Pricing
              </a>
              <a
                href="#about"
                className="hover:text-[#1f2937]/60 transition-colors"
              >
                About
              </a>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4">
              <Button
                bgColor="#f3f4f6"
                textColor="#000000"
                onClick={handleSignIn}
                hoverColor="#ffffff"
              >
                Login
              </Button>
              <Button onClick={handleSignIn} />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="z-10 min-h-screen lg:min-h-[120vh] pt-24 pb-24 lg:pt-0 bg-gradient-to-b from-[#54a056eb]/15 to-gray-50 relative">
        <div className="z-10 mx-auto flex flex-col justify-center min-h-screen lg:min-h-[120vh] font-display text-center px-4">
          {/* Main text and CTA*/}
          <div className="flex-1 flex flex-col justify-center items-center pt-8 lg:pt-60 pb-4 lg:pb-8">
            <h1 className="text-4xl lg:text-5xl font-medium text-[#1f2937]">
              <span className="block">
                Smart itinerary planning for travelers
              </span>
              <span className="block">who want more.</span>
            </h1>
            <p className="text-black/60 text-base lg:text-lg max-w-[80%] mx-auto my-8 lg:my-12">
              Travel smarter. Stress less. Your journey, your way.
            </p>
            <Button onClick={handleSignIn}>See How It Works</Button>
          </div>

          {/* Mockup Section */}
          <div className="flex-1 flex items-center justify-center py-8">
            <img
              src={mockup}
              alt="mockup"
              className="w-4/6 max-w-4xl cursor-pointer transition-transform"
            />
          </div>

          {/* Bottom hero */}
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-24 flex justify-center w-11/12 mx-auto"
      >
        {/* Text & Features */}
        <div className="flex flex-col justify-center items-center w-full">
          {/* Upper texts */}
          <div className="mb-16 flex flex-col items-center justify-center">
            <h2 className="text-[#397ff1] font-semibold">Features</h2>
            <h1 className="text-[#1f2937] text-5xl pt-2 pb-6 font-semibold text-center">
              All the tools you need
            </h1>
            <p className="w-5/6 text-black/80 text-lg text-center">
              Itinera offers intuitive tools for travelers and locals alike —
              from building itineraries to managing listings with ease.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid mt-8 grid-cols-1 md:grid-cols-2 gap-16 w-full md:w-4/5">
            {/* Traveler Feature 1 */}
            <div className="flex gap-3">
              <span className="bg-[#397ff1] p-2 rounded-lg flex items-center justify-center">
                <AdjustmentsHorizontalIcon className="h-7 w-7 text-white" />
              </span>
              <span className="text-black/80 w-5/6">
                <span className="text-[#1f2937] font-semibold">
                  Custom Itinerary Builder
                </span>{" "}
                — Create and adjust your travel plans effortlessly with flexible
                functionality.
              </span>
            </div>

            {/* Traveler Feature 2 */}
            <div className="flex gap-3">
              <span className="bg-[#397ff1] p-2 rounded-lg flex items-center justify-center">
                <EyeIcon className="h-7 w-7 text-white" />
              </span>
              <span className="text-black/80 w-5/6">
                <span className="text-[#1f2937] font-semibold">
                  Activity Discovery
                </span>{" "}
                — Browse authentic local activities and hidden gems recommended
                by locals.
              </span>
            </div>

            {/* Creator Feature 1 */}
            <div className="flex gap-3">
              <span className="bg-[#397ff1] p-2 rounded-lg flex items-center justify-center">
                <MapIcon className="h-7 w-7 text-white" />
              </span>
              <span className="text-black/80 w-5/6">
                <span className="font-semibold text-[#1f2937]">
                  Admin Dashboard
                </span>{" "}
                — Add, manage, and track your activities while connecting
                directly with travelers.
              </span>
            </div>

            {/* Creator Feature 2 */}
            <div className="flex gap-3">
              <span className="bg-[#397ff1] p-2 rounded-lg flex items-center justify-center">
                <UsersIcon className="h-7 w-7 text-white" />
              </span>
              <span className="text-black/80 w-5/6">
                <span className="font-semibold text-[#1f2937]">
                  Audience Reach
                </span>{" "}
                — Promote your offerings and connect with the right travelers
                looking for authentic experiences.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Why us 1 */}
      <section
        id="why"
        className=" h-dvh flex flex-row justify-center w-11/12 mx-auto "
      >
        {/* Left content */}
        <div className=" flex-[0.5] flex flex-col justify-center  items-center  ">
          {/* Upper texts */}
          <div className=" h-2/6 flex flex-col justify-end ">
            <h2 className="text-[#397ff1] font-semibold">Discover more</h2>
            <h1 className="text-[#1f2937] text-5xl pt-2 pb-6 font-semibold ">
              Personalized journeys.
            </h1>
            <p className="w-5/6 text-black/80 text-lg">
              Plan stress-free trips with tailor-made itineraries, cultural
              gems, and flexible options designed just for your style of travel.
            </p>
          </div>
          {/* Lower texts */}
          <div className="h-3/6  pt-12 flex flex-col gap-8 w-full">
            <p className="flex gap-3">
              <AdjustmentsHorizontalIcon className="h-7 text-[#397ff1]" />
              <span className="text-black/80 w-5/6">
                <span className="text-[#1f2937] font-semibold">
                  Personalized itineraries
                </span>{" "}
                — Get curated travel plans based on your interests: food,
                adventure, culture, or relaxation.
              </span>
            </p>

            <p className="flex gap-3">
              <EyeIcon className="h-7 text-[#397ff1]" />
              <span className=" text-black/80 w-5/6">
                <span className="text-[#1f2937] font-semibold">
                  Hidden gems
                </span>{" "}
                — Discover local experiences beyond mainstream tours,
                recommended by community creators.
              </span>
            </p>

            <p className="flex gap-3">
              <MapIcon className="h-7 text-[#397ff1]" />
              <span className="text-black/80 w-5/6">
                <span className="font-semibold text-[#1f2937]">
                  Flexible plans
                </span>{" "}
                — Rearrange, adapt, and customize your schedule anytime during
                your trip.
              </span>
            </p>
          </div>
        </div>

        {/* Mockup */}
        <div className=" flex-[0.5] flex justify-center items-center">
          <img
            src={mockup1}
            alt="mockup1"
            className="h-5/6  cursor-pointer transition-transform drop-shadow-2xl"
          />
        </div>
      </section>

      {/* Why us 2*/}
      <section className=" h-dvh flex flex-row justify-center   w-11/12 mx-auto ">
        {/* Mockup */}
        <div className="flex-[0.6] flex justify-center items-center relative">
          <img
            src={mockup2}
            alt="Mockup"
            className="absolute object-contain cursor-pointer transition-transform drop-shadow-2xl -left-[25%] scale-115"
            // Options: scale-110, scale-125, scale-150, scale-[1.3], etc.
          />
        </div>
        {/* Right content */}
        <div className=" flex-[0.5] flex flex-col justify-center  items-center  ">
          {/* Upper texts */}
          <div className=" h-2/6 flex flex-col justify-end ">
            <h2 className="text-[#397ff1] font-semibold">For storytellers</h2>
            <h1 className="text-[#1f2937] text-5xl pt-2 pb-6 font-semibold ">
              Share authentic activities.
            </h1>
            <p className="w-11/12 text-black/80 text-lg">
              Bring your knowledge of local culture, food, and traditions to
              life by listing activities on Itinera. Manage your offerings with
              ease and connect with travelers who value authenticity.
            </p>
          </div>
          {/* Lower texts */}
          <div className="h-3/6  pt-12 flex flex-col gap-8">
            <p className="flex gap-3">
              <GlobeAltIcon className="h-7 text-[#397ff1]" />
              <span className="text-black/80 w-5/6">
                <span className="text-[#1f2937] font-semibold">
                  Share your activities.
                </span>{" "}
                — Showcase unique activities and cultural insights that
                travelers can’t find in mainstream tours.
              </span>
            </p>

            <p className="flex gap-3">
              <Cog6ToothIcon className="h-7 text-[#397ff1]" />
              <span className=" text-black/80 w-5/6">
                <span className="text-[#1f2937] font-semibold">
                  Manage with ease
                </span>{" "}
                — Add, update, and organize your offerings in a simple,
                streamlined dashboard.
              </span>
            </p>

            <p className="flex gap-3">
              <UsersIcon className="h-7 text-[#397ff1]" />
              <span className="text-black/80 w-5/6">
                <span className="font-semibold text-[#1f2937]">
                  Reach the right audience.
                </span>{" "}
                — Connect directly with travelers seeking authentic activities.
              </span>
            </p>
          </div>
        </div>
      </section>

      <footer className=" py-24  bg-gradient-to-b from-gray-50 to-[#54a056eb]/15">
        <div className="w-11/12 mx-auto max-w-[1440px]">
          {/* Main footer content */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 mb-16">
            {/* Brand section */}
            <div className="lg:col-span-2 ">
              <p className="text-black/60  leading-relaxed mb-8 max-w-md">
                Turn your next trip into a hassle-free experience with
                personalized itineraries and authentic local discoveries.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-[#397ff1] rounded-lg flex items-center justify-center cursor-pointer hover:bg-[#397ff1]/80 transition-colors">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </div>
                <div className="w-10 h-10 bg-[#397ff1] rounded-lg flex items-center justify-center cursor-pointer hover:bg-[#397ff1]/80 transition-colors">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                  </svg>
                </div>
                <div className="w-10 h-10 bg-[#397ff1] rounded-lg flex items-center justify-center cursor-pointer hover:bg-[#397ff1]/80 transition-colors">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Footer links */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {footerSections.map((section, index) => (
                  <div key={index}>
                    <h5 className="font-semibold text-[#1f2937] text-lg mb-6">
                      {section.title}
                    </h5>
                    <div className="space-y-4">
                      {section.links.map((link, linkIndex) => (
                        <Link
                          key={linkIndex}
                          className="block text-black/80 hover:text-[#397ff1] transition-colors duration-300 text-base"
                          to={
                            link === "About Us"
                              ? "/about"
                              : link === "Contact Us"
                              ? "/contact"
                              : link === "Become a host"
                              ? "/host"
                              : "/"
                          }
                        >
                          {link}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Newsletter section */}
          <div className="border border-y-gray-300 border-x-white p-8 lg:p-12 mb-16">
            <div className="text-center">
              <h3 className="text-[#1f2937] text-2xl lg:text-3xl font-semibold mb-4">
                Stay updated with travel insights
              </h3>
              <p className="text-black/80 text-lg mb-8 max-w-2xl mx-auto">
                Get the latest travel tips, destination guides, and exclusive
                offers delivered to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#397ff1]/20 focus:border-[#397ff1] text-base"
                />
                <button className="bg-[#397ff1] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#397ff1]/80 transition-colors duration-300">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Bottom section */}
          <div className="flex flex-col lg:flex-row justify-between items-center pt-8 border-t border-gray-200">
            <p className="text-black/60 text-base mb-4 lg:mb-0">
              © 2025 Itinera. All rights reserved
            </p>
            <div className="flex space-x-8 text-base">
              <a
                href="#"
                className="text-black/60 hover:text-[#397ff1] transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-black/60 hover:text-[#397ff1] transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-black/60 hover:text-[#397ff1] transition-colors"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
