// ServiceDetails.tsx
import React from "react";

interface ServiceDetailsProps {
  name: string;
  details: string;
}

const ServiceDetails: React.FC<ServiceDetailsProps> = ({ name, details }) => {
  return (
    <div>
      <h3 className="text-2xl font-semibold">{name}</h3>
      <p className="text-gray-600 mt-4">{details}</p>
    </div>
  );
};

export default ServiceDetails;
