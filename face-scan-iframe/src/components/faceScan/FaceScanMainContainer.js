import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import * as faceapi from "face-api.js";
import FaceScanIFrameAdapter from "./FaceScanIFrameAdapter";

const pathName = window.location.pathname;

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const FaceScanMainContainer = ({ isMobile }) => {
  const [isFaceApiModelsLoaded, setIsFaceApiModelsLoaded] = useState(false);

  const query = useQuery();
  const videoToken = query.get("videoToken");
  const noDesign = query.get("noDesign")?.toLowerCase() === "true";
  const buttonBgColor = query.get("buttonBgColor");
  const buttonTextColor = query.get("buttonTextColor");
  const showResults = query.get("showResults");
  const ageString = query.get("age");
  const age = ageString ? parseInt(query.get("age"), 10) : null;
  const gender = query.get("gender");
  const isVoiceAnalysisOn = query.get("isVoiceAnalysisOn")?.toLowerCase() === "true";

  const faceApiModels = () => [
    faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
    faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
    faceapi.nets.faceExpressionNet.loadFromUri("/models"),
    faceapi.nets.ageGenderNet.loadFromUri("/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/models")
  ];

  useEffect(() => {
    const loadFaceApiModels = async () => {
      await Promise.all(faceApiModels());
      setIsFaceApiModelsLoaded(true);
    };

    if (!age || !gender) {
      loadFaceApiModels();
    } else {
      setIsFaceApiModelsLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {isFaceApiModelsLoaded && pathName === "/" && (
        <FaceScanIFrameAdapter
          isMobile={isMobile}
          videoToken={videoToken}
          noDesign={noDesign}
          buttonBgColor={buttonBgColor}
          buttonTextColor={buttonTextColor}
          showResults={showResults}
          age={age}
          gender={gender}
          isVoiceAnalysisOn={isVoiceAnalysisOn}
        />
      )}
    </>
  );
};

export default FaceScanMainContainer;
