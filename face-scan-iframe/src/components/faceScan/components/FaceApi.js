import { useEffect, useRef } from "react";
import * as faceapi from "face-api.js";
import { GetHealthStage } from "react-vital-sign-camera";
import { createDummyImage } from "./DummyPhoto";

export async function FaceApiWarmUp() {
  // Warm Up the Face API....
  const dummyImage = await createDummyImage();
  await faceapi.detectSingleFace(dummyImage, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
  await faceapi.detectSingleFace(dummyImage, new faceapi.TinyFaceDetectorOptions()).withAgeAndGender();
}

const FaceApi = ({ video, userFaceInfo, analysisStatus }) => {
  const intervalId = useRef();
  const ageDetectedCounter = useRef(0);
  const genderDetectionHelper = useRef({});

  useEffect(() => {
    if (video && !intervalId.current && analysisStatus === GetHealthStage.CollectingData) {
      intervalId.current = setInterval(async () => {
        if (analysisStatus !== GetHealthStage.CollectingData) {
          clearInterval(intervalId.current);
          return;
        }

        const detectionWithExpressions = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
        const detectionWithAgeAndGender = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withAgeAndGender();

        if (!detectionWithExpressions && !detectionWithAgeAndGender) return;

        const newDetectedExpressions = detectionWithExpressions?.expressions;
        const newDetectedAge = detectionWithAgeAndGender?.age;
        const newDetectedGender = detectionWithAgeAndGender?.gender === "male" ? 0 : 1;

        const focusUserFaceDetails = userFaceInfo.current;

        if (newDetectedAge) {
          ageDetectedCounter.current++;
          focusUserFaceDetails.age =
            (focusUserFaceDetails.age * (ageDetectedCounter.current - 1) + newDetectedAge) / ageDetectedCounter.current;
        }

        if (newDetectedExpressions) {
          Object.entries(newDetectedExpressions).forEach(([expressionType, value]) => {
            if (value < 0.65) return;
            if (!focusUserFaceDetails.expressions[expressionType]) {
              focusUserFaceDetails.expressions[expressionType] = { percentLevelOfDetection: value, count: 1 };
            } else {
              const currentExpression = focusUserFaceDetails.expressions[expressionType];
              currentExpression.count++;
              currentExpression.percentLevelOfDetection =
                (currentExpression.percentLevelOfDetection * (currentExpression.count - 1) + value) / currentExpression.count;
            }
          });
        }

        if (detectionWithAgeAndGender?.genderProbability > 0.85) {
          if (!genderDetectionHelper.current[newDetectedGender]) genderDetectionHelper.current[newDetectedGender] = 0;
          genderDetectionHelper.current[newDetectedGender]++;
          focusUserFaceDetails.gender = Object.keys(genderDetectionHelper.current).reduce((a, b) =>
            Math.max(a, genderDetectionHelper.current[b])
          );
        }

        userFaceInfo.current = focusUserFaceDetails;
      }, 1000);

      return () => {
        clearInterval(intervalId.current);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video, analysisStatus]);

  return;
};

export default FaceApi;
