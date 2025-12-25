import { useNavigate } from "react-router-dom";
import React from "react";
import { motion } from "framer-motion";
import creatorImg from "../../../../assets/images/category.png";
import guideImg from "../../../../assets/images/category1.png";
import driverImg from "../../../../assets/images/car.png";

const Step00RoleSelection = ({ formData, setFormData, onNext }) => {
  const navigate = useNavigate();

  const roles = [
    {
      role_id: "Creator",
      name: "Share Activity",
      description: "Offer activities and experiences to travelers",
      image: creatorImg,
    },
    {
      role_id: "Guide",
      name: "Tour Guide",
      description: "Guide travelers through destinations and activities",
      image: guideImg,
    },
    {
      role_id: "Driver",
      name: "Transport Provider",
      description: "Provide itinerary-based transportation services",
      image: driverImg,
    },
  ];

  const handleRoleSelect = (role) => {
    setFormData({
      ...formData,
      creator_role: role.role_id,
      creator_role_label: role.name,
    });

    setTimeout(() => {
      onNext();
    }, 300);
  };

  return (
    <div className="">
      {/* Header */}
      <div className="text-center my-24 font-display">
        <h1 className="text-4xl md:text-5xl font-semibold  text-black/90 leading-tight">
          How would you like to
          <br />
          partner with Itinera?
        </h1>
        <p className="mt-4 text-gray-600">
          Choose the role that best describes the services you offer
        </p>
      </div>

      {/* Role Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto font-display">
        {roles.map((role) => (
          <motion.button
            key={role.role_id}
            layoutId={`role-${role.role_id}`}
            onClick={() => handleRoleSelect(role)}
            className={`
              group relative px-10 py-12 rounded-xl cursor-pointer border-2 transition-all duration-200 aspect-square
              ${
                formData.creator_role === role.role_id
                  ? "border-gray-900 bg-gray-50"
                  : "border-gray-300 hover:border-gray-900"
              }
            `}
          >
            {/* Image */}
            <div className="w-24 h-24 mx-auto mb-6 rounded-xl flex items-center justify-center overflow-hidden">
              <img
                src={role.image}
                alt={role.name}
                className="w-24 h-24 object-contain"
              />
            </div>

            {/* Role Name */}
            <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
              {role.name}
            </h3>

            {/* Role Description */}
            <p className="text-sm text-gray-600 text-center px-2">
              {role.description}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default Step00RoleSelection;
