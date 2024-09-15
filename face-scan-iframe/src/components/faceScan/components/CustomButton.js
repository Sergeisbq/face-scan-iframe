import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const CustomButton = ({ text, fullWidth, link, onClick, disabled, bgColor, textColor, isAllowedToStartAnalyzing }) => {
  const navigate = useNavigate();
  let btnBgColor = "#339A31";
  if (bgColor) btnBgColor = `#${bgColor}`;

  return (
    <Button
      className={`${bgColor ? "" : "!bg-[#339A31]"} ${disabled ? "!bg-[#898989]" : ""} h-[50px] ${
        fullWidth ? "w-full" : "tablet:w-[300px] w-[200px]"
      } whitespace-nowrap !rounded-none ${bgColor ? "" : "hover:!bg-[#9CE452]"}`}
      onClick={link ? () => navigate(`/${link}`) : onClick}
      disabled={disabled}
      style={{
        backgroundColor: isAllowedToStartAnalyzing && btnBgColor
      }}
    >
      <div className="flex flex-row items-center justify-center w-full px-1 py-1 text-lg text-white mobileN:text-[14px] font-grotesk font-300">
        <div className="absolute top-0 left-0 w-4 h-4 bg-[#013000]"></div>
        <div className="w-[75%]">
          <div style={{ color: textColor && isAllowedToStartAnalyzing && `#${textColor}` }}>{text}</div>
        </div>
      </div>
    </Button>
  );
};

export default CustomButton;
