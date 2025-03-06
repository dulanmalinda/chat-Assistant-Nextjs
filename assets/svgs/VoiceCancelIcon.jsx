import React from "react";

export const VoiceCancelIcon = ({ onClick }) => {
  return (
    <svg
      onClick={onClick}
      width="35"
      height="35"
      viewBox="0 0 35 35"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="17.5" cy="17.5" r="17.5" fill="#49494F" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.5 15.2467L22.7467 10L25 12.2533L19.7533 17.5L25 22.7467L22.7467 25L17.5 19.7533L12.2533 25L10 22.7467L15.2467 17.5L10 12.2533L12.2533 10L17.5 15.2467Z"
        fill="black"
      />
    </svg>
  );
};
