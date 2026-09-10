// shared/src/components/ui/Button.jsx
import React from "react";
import clsx from "clsx";

export const Button = ({ children, onClick, type = "button", className, disabled }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50",
        className
      )}
    >
      {children}
    </button>
  );
};

export default Button;
