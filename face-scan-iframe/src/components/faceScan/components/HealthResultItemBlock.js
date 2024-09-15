import CheckIcon from "@mui/icons-material/Check";
import { capitalizeFirstLetter } from "../../../utils";
import atRiskIcon from "../../../assets/svgs/at-risk-icon.svg";
import { Tooltip } from "@mui/material";

const getSizeClasses = (name) => {
  if (name.includes("Risk")) return "tablet:w-[45%] w-full tablet:h-[180px] h-[110px]";
  if (name.includes("Pressure") || name.includes("Blood")) return "tablet:w-[30%] w-full tablet:h-[180px] h-[110px]";
  return "w-full h-[110px]";
};

const getBorderColor = (degree) => {
  switch (degree) {
    case "excellent":
      return "border-[#339A31]";
    case "good":
    case "average":
      return "border-[#C1990B]";
    default:
      return "border-[#993331]";
  }
};

const getBackgroundClasses = (name, degree) => {
  if (name.includes("Stress") || name.includes("Respiratory")) {
    return `bg-[#FAFAFA] border-[1px] ${getBorderColor(degree)}`;
  }
  return "bg-[#fff]";
};

const HealthResultItemBlock = ({ name, value, degree }) => {
  const sizeClasses = getSizeClasses(name);
  const backgroundClasses = getBackgroundClasses(name, degree);

  return (
    <div className={`flex items-start justify-between flex-col ${sizeClasses} ${backgroundClasses} shadow-xl p-5`}>
      <div className="flex flex-col justify-between w-full">
        <div className="flex flex-row items-center justify-between">
          <div
            className={`text-sm font-grotesk tablet:text-md ${
              degree === "excellent" ? "text-[#339A31]" : degree === "good" || degree === "average" ? "text-[#C1990B]" : "text-[#993331]"
            }`}
          >
            {capitalizeFirstLetter(degree)}
          </div>

          <div
            className={`flex items-center justify-center ml-2 rounded-full ${
              degree === "excellent" ? "bg-[#339A31]" : degree === "good" || degree === "average" ? "bg-[#C1990B]" : ""
            }`}
          >
            {degree === "poor" || degree === "at risk" ? (
              <img src={atRiskIcon} width="12" height="12" alt="atRisk" />
            ) : (
              <CheckIcon sx={{ color: "#fff", fontSize: "12px", fontWeight: "bold", padding: "2px" }} />
            )}
          </div>
        </div>
        <div
          className={`flex flex-row justify-start text-start font-grotesk text-[24px] ${
            degree === "excellent" ? "text-[#339A31]" : degree === "good" || degree === "average" ? "text-[#C1990B]" : "text-[#993331]"
          }`}
        >
          {value}
        </div>
      </div>
      <div>
        {["SDNN", "RMSSD"].includes(name) ? (
          <Tooltip
            title={
              name === "SDNN"
                ? "SDNN (Standard Deviation of NN intervals) is a measure of heart rate variability that reflects the overall variability in time between heartbeats. It provides insight into the autonomic nervous system's regulation of the heart."
                : "RMSSD (Root Mean Square of Successive Differences) is a measure of heart rate variability, reflecting short-term variations between heartbeats and indicating autonomic nervous system activity."
            }
            arrow
          >
            <div className="flex flex-row text-start justify-start text-[12px]">{name}</div>
          </Tooltip>
        ) : (
          <div className={`flex flex-row text-start justify-start text-[12px] ${name === "Risk of Stroke" ? "h-[37.7px]" : ""}`}>
            {name}
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthResultItemBlock;
