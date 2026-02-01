import React, { useState } from "react";

export const ProtectedData = ({ value, type = "text" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const handleReveal = () => setIsVisible(!isVisible);

  if (isVisible) {
    if (type === "tel") return <a href={`tel:${value}`}>{value}</a>;
    if (type === "email") return <a href={`mailto:${value}`}>{value}</a>;
    return <span>{value}</span>;
  }

  // Máscara por defecto
  const maskedValue =
    type === "text"
      ? "********"
      : type === "tel"
        ? "***-****"
        : "********@***.com";

  return (
    <div className="flex items-center gap-2">
      <span>{maskedValue}</span>
      <button
        onClick={handleReveal}
        className="text-blue-500 hover:text-blue-700 text-sm"
      >
        Ver
      </button>
    </div>
  );
};
