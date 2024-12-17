import { useState, useEffect, useRef } from "react";
import { GetHealthStage } from "react-vital-sign-camera";
import { msgParentWindow } from "../../../utils";

const VideoTimeAndStatus = ({ onTimerFinished, analysisStatus, isVoiceScanAdded, noDesign }) => {
  const [scanTimeRemaining, setScanTimeRemaining] = useState(isVoiceScanAdded ? 40 : 30);
  const timerIntervalId = useRef(undefined);

  useEffect(() => {
    if (noDesign) msgParentWindow("scanTimeRemaining", scanTimeRemaining);
    if (scanTimeRemaining === 0 && timerIntervalId.value) {
      clearInterval(timerIntervalId.value);
      onTimerFinished();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanTimeRemaining]);

  useEffect(() => {
    if (analysisStatus === GetHealthStage.CollectingData && !timerIntervalId.value) {
      // Start scan timer
      timerIntervalId.value = setInterval(() => {
        setScanTimeRemaining((prevState) => (prevState - 1 >= 0 ? prevState - 1 : 0));
      }, 1070);
    }

    return () => {
      if (timerIntervalId.value) clearInterval(timerIntervalId.value);
      timerIntervalId.value = undefined;
    };
  }, [analysisStatus]);

  let text;

  if (analysisStatus === undefined || analysisStatus === GetHealthStage.Idle) {
    return <></>;
  }

  switch (analysisStatus) {
    case GetHealthStage.CollectingData:
      text = "Seconds Remaining";
      break;
    case GetHealthStage.AnalyzingData:
      text = "Analyzing...";
      break;
    case GetHealthStage.WaitingData:
      text = "Loading...";
      break;
    case GetHealthStage.Idle:
      text = "Idle...";
      break;
    default:
      text = "";
  }

  return (
    <>
      {noDesign ? (
        <></>
      ) : (
        <div className="items-center gap-3 justify-center rounded-lg flex flex-row bg-[#F0F0F0] p-2 border-[#F0F0F0] border-[1px]">
          {analysisStatus !== GetHealthStage.WaitingData && (
            <div className="text-4xl font-bold text-center font-sourceSans text-darkGreen">{scanTimeRemaining || ""}</div>
          )}
          <div className="text-md font-medium leading-4 text-center font-sourceSans text-[#2D2D2D]">{text}</div>
        </div>
      )}
    </>
  );
};

export default VideoTimeAndStatus;
