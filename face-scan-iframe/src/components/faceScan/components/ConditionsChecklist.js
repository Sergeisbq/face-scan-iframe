import { useSelector } from "react-redux";
import Condition from "./Condition";

const ConditionsChecklist = ({ isVoiceScanAdded, isMicPermissionAllowed }) => {
  const demoVideoConditions = useSelector((state) => state.appSettings.demoVideoConditions);

  return (
    <div className="flex flex-col items-start justify-start w-full mb-5">
      <div className="flex flex-col items-start justify-start w-full gap-5 py-5 overflow-hidden bg-white rounded-b-md">
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
