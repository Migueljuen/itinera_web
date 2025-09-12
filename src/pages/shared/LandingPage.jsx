import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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

  const features = [
    {
      title: "Authentic Experiences",
      description:
        "Immerse yourself in unique, local adventures curated to help you live the culture, not just see it.",
    },
    {
      title: "Story-Driven Travel",
      description:
        "Every experience is a chapter. Build memories through curated moments that tell a story worth sharing.",
    },
    {
      title: "Moments That Matter",
      description:
        "From breathtaking views to quiet local rituals, find moments that make your trip truly meaningful.",
    },
  ];

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
      links: ["Destinations"],
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
                className="hover:text-[#1f2937]/60 transition-colors"
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

      {/* Section 2 */}
      <section className=" h-dvh flex flex-row justify-center w-11/12 mx-auto ">
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

      {/* Section 3*/}
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

      {/* What We Offer */}
      <section className=" py-16 lg:pb-42">
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
              Discover meaningful experiences that go beyond schedules. Explore,
              feel, and connect with each destination in a way that's truly
              unforgettable. ✨
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-10  transition-shadow duration-300 transform "
              >
                <div className="flex items-center mb-4">
                  <img
                    src={Undraw2Svg}
                    alt={feature.title}
                    className="w-12 h-12 mr-3"
                  />
                  <h4 className="text-xl font-bold text-[#1f2937]">
                    {feature.title}
                  </h4>
                </div>
                <p className="text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-white border-t border-gray-200 py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-8">
            <img
              src={logoImage}
              alt="Itinera Logo"
              className="w-24  mx-auto mb-4"
            />
            <p className="text-gray-500 max-w-md mx-auto">
              Turn your next trip into a hassle-free experience with Itinera.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {footerSections.map((section, index) => (
              <div key={index} className="text-center md:text-left">
                <h5 className="font-semibold mb-3 text-[#1f2937]">
                  {section.title}
                </h5>
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
            <p className="text-[#6b7280]">
              © 2025 Itinera. All rights reserved
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
