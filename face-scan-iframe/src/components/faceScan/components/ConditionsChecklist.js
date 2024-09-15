import { useSelector } from "react-redux";
import Condition from "./Condition";

const ConditionsChecklist = ({ isVoiceScanAdded, isMicPermissionAllowed }) => {
  const demoVideoConditions = useSelector((state) => state.appSettings.demoVideoConditions);

  return (
    <div className="flex flex-col items-center w-full mb-5">
      <div
        className={`flex overflow-hidden flex-row flex-wrap justify-center inBetween:justify-between tablet:gap-2 gap-5 bg-white p-5 w-full rounded-b-md`}
      >
        <Condition
          status={demoVideoConditions.lighting}
          condition="Lighting"
          subText="Make sure you are in good lighting room"
          isVoiceScanAdded={isVoiceScanAdded}
        />
        <Condition
          status={demoVideoConditions.centered}
          condition="Centered"
          subText="You must be in the center of the camera"
          isVoiceScanAdded={isVoiceScanAdded}
        />
        <Condition
          status={demoVideoConditions.distance}
          condition="Distance"
          subText="Must fit within the icon borders"
          isVoiceScanAdded={isVoiceScanAdded}
        />
        <Condition
          status={demoVideoConditions.movement}
          condition="Movement"
          subText="During the scan you should not move"
          isVoiceScanAdded={isVoiceScanAdded}
        />
        <Condition
          status={isMicPermissionAllowed}
          condition="Microphone"
          subText="To start the test allow using microphone"
          isVoiceScanAdded={isVoiceScanAdded}
        />
      </div>
    </div>
  );
};

export default ConditionsChecklist;
