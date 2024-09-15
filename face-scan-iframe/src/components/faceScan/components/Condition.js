import CheckIcon from "@mui/icons-material/Check";

const Condition = ({ status, condition, subText, isVoiceScanAdded }) => {
  const iconBg = status ? "bg-darkGreen" : "bg-grey";

  return (
    <div
      className={`flex items-center flex-row tablet:flex-col tablet:w-[144px] w-[200px] mobile:w-[175px] ${
        !isVoiceScanAdded && condition === "Microphone" ? "text-lightGrey" : ""
      }`}
    >
      <div className="flex flex-col">
        <div className="flex flex-row items-center tablet:justify-center mobile:justify-between">
          <div
            className={`text-sm font-bold font-grotesk tablet:text-xl ${
              !isVoiceScanAdded && condition === "Microphone" ? "text-lightGrey" : "text-[#2D2D2D]"
            }`}
          >
            {condition}
          </div>
          <div
            className={`${
              !isVoiceScanAdded && condition === "Microphone"
                ? "hidden"
                : `flex items-center justify-center w-4 h-4 ml-2 rounded-full ${iconBg}`
            }`}
          >
            <CheckIcon sx={{ color: "#fff", fontSize: "12px", fontWeight: "bold" }} />
          </div>
        </div>
        <div className="flex flex-row font-grotesk tablet:text-center mobile:text-start">{subText}</div>
      </div>
    </div>
  );
};

export default Condition;
