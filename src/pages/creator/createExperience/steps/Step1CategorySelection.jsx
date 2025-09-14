import { useNavigate } from "react-router-dom";
import React from "react";
import { motion } from "framer-motion";
import cat from "../../../../assets/images/category.png";
import cat1 from "../../../../assets/images/category1.png";
import cat2 from "../../../../assets/images/category2.png";
import cat3 from "../../../../assets/images/category3.png";
import cat4 from "../../../../assets/images/category4.png";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
const Step1CategorySelection = ({ formData, setFormData, onNext }) => {
  const navigate = useNavigate();
  const categories = [
    {
      category_id: 1,
      name: "Art and design",
      image: cat,
    },
    {
      category_id: 2,
      name: "Fitness and wellness",
      image: cat1,
    },
    {
      category_id: 3,
      name: "Food and drink",
      image: cat2,
    },
    {
      category_id: 4,
      name: "History and culture",
      image: cat3,
    },
    {
      category_id: 5,
      name: "Nature and outdoors",
      image: cat4,
    },
  ];

  const handleCategorySelect = (category) => {
    setFormData({
      ...formData,
      category_id: category.category_id,
      category_name: category.name,
      category_image: category.image,
    });

    setTimeout(() => {
      onNext();
    }, 300);
  };

  return (
    <div className="">
      {/* <ChevronLeftIcon
        className="h-8 cursor-pointer hover:text-black/90 absolute top-10 left-10"
        onClick={() => navigate("/dashboard")}
      /> */}
      {/* Header */}
      <div className="text-center mb-24">
        <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 leading-tight">
          What experience will
          <br />
          you offer guests?
        </h1>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 max-w-7xl mx-auto">
        {categories.map((category) => (
          <motion.button
            key={category.category_id}
            layoutId={`category-${category.category_id}`} // 🔑 shared id
            onClick={() => handleCategorySelect(category)}
            className={`
              group relative px-12 py-12 rounded-xl cursor-pointer border-2 transition-all duration-200 aspect-square w-full max-h-90
              ${
                formData.category === category.category_id
                  ? "border-gray-900 bg-gray-50"
                  : "border-gray-300 hover:border-gray-900"
              }
            `}
          >
            {/* Image Container */}
            <div
              className={`
             w-24 h-24 mx-auto mb-6 rounded-xl flex items-center justify-center overflow-hidden
              ${category.bgColor}
            `}
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-24 h-24 object-contain"
              />
            </div>

            {/* Category Name */}
            <h3 className="text-base font-medium text-gray-900 text-center leading-tight min-h-10">
              {category.name}
            </h3>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default Step1CategorySelection;
