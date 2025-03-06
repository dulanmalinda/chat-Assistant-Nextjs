export const VoiceIcon = ({ onClick }) => {
  return (
    <svg
      width="35"
      height="35"
      viewBox="0 0 35 35"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      className="cursor-pointer transition-colors duration-200 group"
    >
      <g className="transition-colors duration-200 md:group-hover:text-white">
        <circle
          cx="17.5"
          cy="17.5"
          r="17.5"
          className="text-[#49494F] transition-colors duration-200 md:group-hover:text-black"
          fill="currentColor"
        />

        <path
          d="M17.7368 20.2632C19.5716 20.2632 21.0416 18.7821 21.0416 16.9474L21.0526 10.3158C21.0526 8.48105 19.5716 7 17.7368 7C15.9021 7 14.4211 8.48105 14.4211 10.3158V16.9474C14.4211 18.7821 15.9021 20.2632 17.7368 20.2632ZM23.5947 16.9474C23.5947 20.2632 20.7874 22.5842 17.7368 22.5842C14.6863 22.5842 11.8789 20.2632 11.8789 16.9474H10C10 20.7163 13.0063 23.8332 16.6316 24.3747V28H18.8421V24.3747C22.4674 23.8442 25.4737 20.7274 25.4737 16.9474H23.5947Z"
          className="text-black transition-colors duration-200 md:group-hover:text-white"
          fill="currentColor"
        />
      </g>
    </svg>
  );
};
