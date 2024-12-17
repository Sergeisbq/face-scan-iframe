import { capitalizeFirstLetter } from "../../../utils";
import { Tooltip } from "@mui/material";

const getSizeClasses = (name) => {
  if (name.includes("Risk")) return "h-[54px]";
  if (name.includes("Pressure") || name.includes("Blood")) return "w-full h-[54px]";
  return "w-full";
};

const HealthResultItemBlock = ({ name, value, degree }) => {
  const sizeClasses = getSizeClasses(name);

  return (
    <div className={`flex items-start justify-between flex-col ${sizeClasses} py-2 px-4`}>
      <div className="flex flex-col justify-between w-full">
        <div className="flex flex-row items-center justify-between">
          <div>
            <div
              className={`text-sm font-sourceSans tablet:text-md ${
                degree === "excellent" ? "text-[#339A31]" : degree === "good" || degree === "average" ? "text-[#C1990B]" : "text-[#993331]"
              }`}
            >
              {capitalizeFirstLetter(degree)}
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

          <div
            className={`flex flex-row justify-start text-start font-sourceSans text-[18px] ${
              degree === "excellent" ? "text-[#339A31]" : degree === "good" || degree === "average" ? "text-[#C1990B]" : "text-[#993331]"
            }`}
          >
            <b>{value}</b>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthResultItemBlock;
