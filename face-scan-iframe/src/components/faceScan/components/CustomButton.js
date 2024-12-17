import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const CustomButton = ({ text, fullWidth, link, onClick, disabled, bgColor, textColor, isAllowedToStartAnalyzing }) => {
  const navigate = useNavigate();
  let btnBgColor = "#339A31";
  if (bgColor) btnBgColor = `#${bgColor}`;

  return (
    <Button
      className={`${bgColor ? "" : "!bg-[#339A31]"} ${disabled ? "!bg-white !border-black" : ""} h-[50px] ${
        fullWidth ? "w-full" : "tablet:w-[300px] w-[200px]"
      } whitespace-nowrap !rounded-[8px] ${bgColor ? "" : "hover:!bg-[#9CE452]"}`}
      onClick={link ? () => navigate(`/${link}`) : onClick}
      disabled={disabled}
      style={{
        backgroundColor: isAllowedToStartAnalyzing && btnBgColor,
        border: disabled && "solid 1px #000"
      }}
    >
      <div
        className={`flex flex-row items-center justify-center w-full text-lg ${
          disabled ? "text-black" : "text-white"
        } mobileN:text-[14px] font-sourceSans`}
      >
        <div className="w-[75%]">
          <div style={{ color: textColor && isAllowedToStartAnalyzing && `#${textColor}` }}>{text}</div>
        </div>
      </div>
    </Button>
  );
};

export default CustomButton;
