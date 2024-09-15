import React from "react";
import { useSelector } from "react-redux";
import CustomButton from "./CustomButton";

export default function VideoEvaluateButton({ startScanning, bgColor, textColor }) {
  const demoVideoConditions = useSelector((state) => state.appSettings.demoVideoConditions);
  const isAllowedToStartAnalyzing = Object.values(demoVideoConditions).every((item) => item);

  return (
    <CustomButton
      text="Start Evaluation"
      fullWidth
      onClick={startScanning}
      bgColor={bgColor}
      textColor={textColor}
      isAllowedToStartAnalyzing={isAllowedToStartAnalyzing}
      disabled={!isAllowedToStartAnalyzing}
    />
  );
}
