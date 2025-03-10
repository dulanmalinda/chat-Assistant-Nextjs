export const VoiceLoadingIcon = () => {
  return (
    <svg
      width="35"
      height="35"
      viewBox="0 0 35 35"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="cursor-pointer animate-pulse transition-colors duration-200"
    >
      <g className="transition-colors duration-200">
        <circle
          cx="17.5"
          cy="17.5"
          r="17.5"
          className="text-[#49494F] transition-colors duration-200"
          fill="currentColor"
        />
        <path
          d="M14 14.5C14 13.6716 14.6716 13 15.5 13C16.3284 13 17 13.6716 17 14.5V20.5C17 21.3284 16.3284 22 15.5 22C14.6716 22 14 21.3284 14 20.5V14.5Z"
          className="fill-white"
        />
        <path
          d="M18 12C18 11.1716 18.6716 10.5 19.5 10.5C20.3284 10.5 21 11.1716 21 12V22.5C21 23.3284 20.3284 24 19.5 24C18.6716 24 18 23.3284 18 22.5V12Z"
          className="fill-white opacity-75 animate-ping"
        />
      </g>
    </svg>
  );
};
