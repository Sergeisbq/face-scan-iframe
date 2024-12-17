import CheckIcon from "@mui/icons-material/Check";

const Condition = ({ status, condition, subText, isVoiceScanAdded }) => {
  const iconBg = status ? "bg-darkGreen" : "bg-grey";

  return (
    <div className={`flex items-start gap-3 flex-row w-full ${!isVoiceScanAdded && condition === "Microphone" ? "text-lightGrey" : ""}`}>
      <div
        className={`flex items-center justify-center w-4 h-4 mt-1 rounded-full ${
          !isVoiceScanAdded && condition === "Microphone" ? "bg-lightGrey" : `${iconBg}`
        }`}
      >
        <CheckIcon sx={{ color: "#fff", fontSize: "12px", fontWeight: "bold" }} />
      </div>
      <div className="flex flex-col">
        <div className="flex flex-row items-center justify-start">
          <div
            className={`text-md font-sourceSans tablet:text-xl ${
              !isVoiceScanAdded && condition === "Microphone" ? "text-lightGrey" : "text-[#2D2D2D]"
            }`}
          >
            {condition}
          </div>
        </div>
        <div className="flex flex-row text-sm font-sourceSans text-start">{subText}</div>
      </div>
    </div>
  );
};

export default Condition;
