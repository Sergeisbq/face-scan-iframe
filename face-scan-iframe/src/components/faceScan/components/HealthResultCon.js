import { useMemo, useRef, useState } from "react";
import HealthResult from "./HealthResult";
import HealthResultItemBlock from "./HealthResultItemBlock";
import AssessmentResultsContainer from "./AssessmentResultsContainer";
import CustomButton from "./CustomButton";
import ProgressRing from "./ProgressRing";
import { FormHelperText, InputAdornment, TextField } from "@mui/material";
import axios from "axios";
import Swal from "sweetalert2";
import { endpoints } from "../../../config";
import emailIcon from "../../../assets/images/email-icon.png";
import arrowDownIcon from "../../../assets/svgs/arrow-down-icon.svg";

const checkVitalSignValues = (value) => {
  if (value === "Error" || !value) {
    return "...";
  } else if (typeof value === "string" && value.includes("undefined")) {
    value = value.split("undefined").join("...");
  } else if (typeof value === "number") {
    value = value.toFixed(2);
  } else {
    const regex = /^([\d.]+)(.*)$/;
    const match = value.match(regex);
    if (match && match.length === 3) {
      const num = parseFloat(match[1]).toFixed(2);
      return num + match[2];
    } else {
      return value;
    }
  }
  return value;
};

const HealthResultCon = ({
  result,
  userInfo,
  isVoiceScanAdded,
  assessedVoiceData,
  voiceDataErrorMessage,
  tryAgain,
  iframeConfig,
  isMobile,
  scoreId
}) => {
  const [risks, setRisks] = useState({ cardiovascularRisk: 0 });
  const [userEmail, setUserEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isHeartVisible, setIsHeartVisible] = useState(true);
  const [isBloodVisible, setIsBloodVisible] = useState(true);
  const [isOtherVisible, setIsOtherVisible] = useState(true);

  const captureRef = useRef(null);

  const memoizedAssessedVoiceData = useMemo(() => assessedVoiceData, [assessedVoiceData]);

  let totalExpressionsCount = Object.values(userInfo.expressions).reduce((acc, curr) => acc + curr.count, 0);
  const gender = parseInt(userInfo.gender) === 0 ? "Male" : "Female";
  let health = result;
  let holistic = health.holisticHealth;
  let vs = health.vitalSigns;
  // let cardio = health.risks?.cardiovascularRisks;

  const currentDate = new Date();

  const toggleVisibility = (section) => {
    if (section === "heart") setIsHeartVisible(!isHeartVisible);
    else if (section === "blood") setIsBloodVisible(!isBloodVisible);
    else if (section === "other") setIsOtherVisible(!isOtherVisible);
  };

  const determineHealthLabel = (value) => {
    const mediumHealthThreshold = 40;
    const excellentHealthThreshold = 80;
    if (value > excellentHealthThreshold) {
      return "Excellent";
    } else if (value > mediumHealthThreshold) {
      return "Good";
    } else {
      return "Poor";
    }
  };

  const handleValidation = () => {
    if (!userEmail) {
      setEmailError("Email is required");
      return true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
      setEmailError("Invalid email format");
      return true;
    } else {
      setEmailError("");
      return false;
    }
  };

  const sendScreenshotOnEmail = async () => {
    if (handleValidation()) return;

    try {
      const { default: html2canvas } = await import("html2canvas");

      const element = captureRef.current;
      if (!element) return;

      const canvas = await html2canvas(element, {
        useCORS: true,
        logging: false
      });

      canvas.toBlob(async (blob) => {
        if (blob) {
          const formData = new FormData();
          formData.append("healthReport", blob, "healthReport.png");
          formData.append("receiversEmail", userEmail);
          formData.append("scoreId", scoreId);

          try {
            const res = await axios.post(endpoints.sendScreenShotReportOnEmail, formData, {
              headers: { "Content-Type": "multipart/form-data" }
            });

            if (res.status === 200) {
              Swal.fire("Health Report was sent successfully", "", "success");
            } else {
              Swal.fire("Oops", "There is a problem with sending the Health Report, please try again later", "warning");
            }
          } catch (error) {
            Swal.fire("Oops", "An error occurred while sending the Health Report. Please try again later.", "error");
          }
        }
      }, "image/png");
    } catch (error) {
      console.error("Error taking screenshot:", error);
    }
  };

  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <>
      <div ref={captureRef} className="flex items-center justify-center w-full">
        <div className="w-full px-[8%] py-[4%] max-w-[750px]">
          <>
            <div className="flex flex-col items-center w-full min-w-[250px]">
              <div className="flex flex-col justify-start w-full">
                <div className="text-2xl text-center font-sourceSans">Health Report</div>
                <div className="mt-4 text-xl text-center font-sourceSans text-[#727272]">
                  State of Health:{" "}
                  <span className="text-[#339A31]">
                    <b>{determineHealthLabel(holistic.generalWellness)}</b>
                  </span>
                </div>
                <div className="mt-2 text-sm text-center font-sourceSans text-[#727272]">Date: {currentDate.toLocaleString()}</div>

                <div className="mt-10 text-start font-sourceSans text-[#339A31]">
                  <div className="p-4 mb-4 rounded-lg nice-scroller bg-[#F0F0F0]">
                    {Object.entries(userInfo.expressions).map(([expression, value]) => {
                      const percentage = ((value.count / totalExpressionsCount) * 100).toFixed(2);
                      return (
                        <HealthResult
                          key={expression}
                          name={
                            <div className="flex items-end">
                              {expression}
                              <span className="ml-1 block text-[12px] font-normal mb-[2px]">{`Accuracy (${(
                                Number(value.percentLevelOfDetection) * 100
                              ).toFixed(0)}%)`}</span>
                            </div>
                          }
                          value={
                            <>
                              <div className="block font-bold">{` ${percentage}%`}</div>
                            </>
                          }
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center w-full">
                <ProgressRing value={Math.floor(holistic.generalWellness)} label={determineHealthLabel(holistic.generalWellness)} />
              </div>
            </div>

            <div className="flex gap-5 flex-col items-center w-full min-w-[250px]">
              {/* <div className="w-full tablet:w-2/3">
                <div className="flex flex-row items-center justify-start px-8 font-sourceSans text-[16px] h-[50px] bg-[#9FD39D] w-full">
                  Cardiovascular
                </div>
                <div className="flex flex-row flex-wrap items-center justify-between w-full mt-3 mb-3 mobile:gap-2 tablet:gap-6">
                  <HealthResultItemBlock
                    name="Risk of Congestive Heart Failure"
                    degree={calculateRiskDegree("cardiovascularRisk", cardio?.congestiveHeartFailure)}
                    value={`${(cardio?.congestiveHeartFailure * 100).toFixed(1)}%`}
                  />
                  <HealthResultItemBlock
                    name="Risk of Coronary Heart Disease"
                    degree={calculateRiskDegree("cardiovascularRisk", cardio?.coronaryHeartDisease)}
                    value={`${(cardio?.coronaryHeartDisease * 100).toFixed(1)}%`}
                  />
                  <HealthResultItemBlock
                    name="Risk of Intermittent Claudication"
                    degree={calculateRiskDegree("cardiovascularRisk", cardio?.intermittentClaudication)}
                    value={`${(cardio?.intermittentClaudication * 100).toFixed(1)}%`}
                  />
                  <HealthResultItemBlock
                    name="Risk of Stroke"
                    degree={calculateRiskDegree("cardiovascularRisk", cardio?.stroke)}
                    value={`${(cardio?.stroke * 100).toFixed(1)}%`}
                  />
                </div>
              </div> */}
              <div className="w-full border-[#D0D0D0] border-[1px] rounded-lg">
                <div
                  className="flex flex-row items-center justify-between px-4 font-sourceSans text-[16px] h-[40px] bg-[#9FD39D] w-full rounded-t-lg cursor-pointer"
                  onClick={() => toggleVisibility("heart")}
                >
                  <div>Heart</div>
                  <div className={`mr-2 transform ${isHeartVisible ? "rotate-90" : "rotate-180"}`}>
                    <img src={arrowDownIcon} alt="arrow-down" />
                  </div>
                </div>
                {isHeartVisible && (
                  <div className="flex flex-row flex-wrap items-center justify-center w-full mt-[18px] mb-3 tablet:justify-between mobile:gap-2 tablet:gap-6">
                    <HealthResultItemBlock
                      name="Heart Rate"
                      degree={calculateRiskDegree("heartRate", vs.heartRate)}
                      value={checkVitalSignValues(`${vs.heartRate.toFixed(2)} bpm`)}
                    />
                    <div className="w-full px-4">
                      <div className="w-full h-[1px] bg-[#818181]"></div>
                    </div>
                    <HealthResultItemBlock
                      name="RMSSD"
                      degree={calculateRiskDegree("rmssd", vs.hrvRmssd)}
                      value={checkVitalSignValues(`${vs.hrvRmssd.toFixed(2)} bpm`)}
                    />
                    <div className="w-full px-4">
                      <div className="w-full h-[1px] bg-[#818181]"></div>
                    </div>
                    <HealthResultItemBlock
                      name="SDNN"
                      degree={calculateRiskDegree("sdnn", vs.hrvSdnn)}
                      value={checkVitalSignValues(`${vs.hrvSdnn} ms`)}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex  mt-10 gap-5 flex-col items-center w-full min-w-[250px]">
              <div className="w-full border-[#D0D0D0] border-[1px] rounded-lg">
                <div
                  className="flex flex-row items-center justify-between px-4 font-sourceSans text-[16px] h-[40px] bg-[#9FD39D] w-full rounded-t-lg"
                  onClick={() => toggleVisibility("blood")}
                >
                  <div>Blood</div>
                  <div className={`mr-2 transform ${isBloodVisible ? "rotate-90" : "rotate-180"}`}>
                    <img src={arrowDownIcon} alt="arrow-down" />
                  </div>
                </div>
                {isBloodVisible && (
                  <div className="flex flex-row flex-wrap items-center justify-center w-full mt-3 mb-3 tablet:justify-between mobile:gap-2 tablet:gap-6">
                    <HealthResultItemBlock
                      name="Systolic Pressure"
                      degree={calculateRiskDegree("systolic", vs.bloodPressureSystolic)}
                      value={checkVitalSignValues(`${vs.bloodPressureSystolic} mmHg`)}
                    />
                    <div className="w-full px-4">
                      <div className="w-full h-[1px] bg-[#818181]"></div>
                    </div>
                    <HealthResultItemBlock
                      name="Diastolic Pressure"
                      degree={calculateRiskDegree("diastolic", vs.bloodPressureDiastolic)}
                      value={checkVitalSignValues(`${vs.bloodPressureDiastolic} mmHg`)}
                    />
                    <div className="w-full px-4">
                      <div className="w-full h-[1px] bg-[#818181]"></div>
                    </div>
                    <HealthResultItemBlock
                      name="Oxygen in Blood"
                      degree={calculateRiskDegree("spo2", vs.spo2)}
                      value={checkVitalSignValues(`${vs.spo2.toFixed(2)} %`)}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-row items-center w-full gap-5 mt-10">
              <div className="w-full border-[#D0D0D0] border-[1px] rounded-lg">
                <div
                  className="flex flex-row items-center justify-between px-4 font-sourceSans text-[16px] h-[40px] bg-[#9FD39D] w-full rounded-t-lg"
                  onClick={() => toggleVisibility("other")}
                >
                  <div>Other</div>
                  <div className={`mr-2 transform ${isOtherVisible ? "rotate-90" : "rotate-180"}`}>
                    <img src={arrowDownIcon} alt="arrow-down" />
                  </div>
                </div>
                {isOtherVisible && (
                  <div className="flex flex-col flex-wrap items-center justify-between w-full gap-2 mt-3 mb-3 tablet:flex-row tablet:gap-6">
                    <div className="flex flex-row justify-center w-full">
                      <HealthResultItemBlock
                        name="Respiratory Rate"
                        value={checkVitalSignValues(`${vs.respiratoryRate} bpm`)}
                        degree={calculateRiskDegree("respiratoryRate", vs.respiratoryRate)}
                      />
                    </div>
                    <div className="w-full px-4">
                      <div className="w-full h-[1px] bg-[#818181]"></div>
                    </div>
                    <div className="flex flex-row justify-center w-full">
                      <HealthResultItemBlock
                        name="Stress"
                        value={checkVitalSignValues(`${vs.stress} und`)}
                        degree={calculateRiskDegree("stress", vs.stress)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            {isVoiceScanAdded && (
              <>
                <div className="flex flex-col justify-start w-full pt-16 pb-5 tablet:w-1/2">
                  <div className="text-start font-sourceSans">VOICE ANALYSIS REPORT</div>
                </div>
                <div className="flex flex-row flex-wrap items-center justify-center w-full px-4 mb-5 mobile:gap-2 tablet:gap-6">
                  <div className={`mt-4 ${assessedVoiceData ? "h-2/3" : ""}`}>
                    {!assessedVoiceData && assessedVoiceData !== -1 ? (
                      <div className="flex flex-col items-center justify-center ">
                        <div className="spinner !w-[90px] !h-[90px]"></div>
                        <p className="m-5 text-lg font-bold text-darkGreen font-sourceSans">Voice Results Loading...</p>
                      </div>
                    ) : assessedVoiceData === -1 ? (
                      <div className="flex items-center justify-center h-full text-xl font-bold text-center font-sourceSans text-[#993331]">
                        {voiceDataErrorMessage || "There was a problem with the voice scan results"}
                      </div>
                    ) : (
                      <AssessmentResultsContainer assessedData={memoizedAssessedVoiceData} assessmentType="audio" wrap />
                    )}
                  </div>
                </div>
              </>
            )}
          </>
          <div className="flex flex-col flex-wrap items-center justify-center w-full gap-5 mt-8">
            <div className="w-full">
              <CustomButton text="Retake Face Scan" fullWidth onClick={refreshPage} />
            </div>
          </div>
          <div className="flex flex-col flex-wrap items-start justify-center w-full gap-5 mt-8">
            <div className="flex items-start w-full text-sm font-sourceSans">
              To receive a copy of the report, please enter your email address and click 'Send'.
            </div>
            <div className="w-full">
              <>
                <div className="font-sourceSans">Email Address</div>
                <TextField
                  placeholder="Enter your email"
                  type="email"
                  fullWidth
                  className="w-full font-sourceSans"
                  error={Boolean(emailError)}
                  value={userEmail || ""}
                  onChange={(e) => setUserEmail(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <img src={emailIcon} alt="Email Icon" style={{ width: "16px" }} />
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    fontFamily: "Source Sans",
                    ".MuiOutlinedInput-root": {
                      height: "50px",
                      fontSize: "14px",
                      fontFamily: "Source Sans",
                      borderRadius: "5px"
                    },
                    "& .MuiFormLabel-root": {
                      color: "#9FD39D",
                      fontFamily: "Source Sans"
                    }
                  }}
                />
                <FormHelperText className="w-full pl-3 error-color">{emailError}</FormHelperText>
              </>
            </div>
            <div className="w-full">
              <CustomButton text="Send" fullWidth onClick={sendScreenshotOnEmail} />
            </div>
          </div>
          <div className="flex flex-row items-center justify-center w-full mt-10">
            <div className="flex flex-col font-sourceSans justify-center overflow-y-auto text-sm text-start max-h-100 text-[#938F8F]">
              *General well-being encompasses an individual's overall state of health, considering various aspects of physical, mental, and
              emotional well-being. The scoring ranges used are as follows: Less than 40: Poor. Between 40 and 79: Good. Between 80 and 100:
              Excellent. Typically, scores fall within the range of 80 to 100. A higher score indicates better overall health, while a lower
              score suggests room for improvement in vital signs. Engaging in healthy habits such as regular exercise, maintaining a
              balanced diet, and managing stress can contribute to enhancing overall well-being. To obtain a more precise result, it is
              necessary to gather specific data before evaluating the video. For illustrative purposes, more generalized values have been
              used.
            </div>
          </div>
        </div>
      </div>
    </>
  );

  function calculateRiskDegree(field, value) {
    const userAge = parseInt(userInfo.age);
    const userGender = gender;
    let riskDegree = "";
    let copyRisks = { ...risks };

    if (typeof value !== "number") {
      return "";
    }

    switch (field) {
      case "heartRate":
        const getHeartRateRiskDegree = (gender, age, value) => {
          const ageRanges = {
            Male: [
              [100, 74, 70, 62, 49],
              [100, 75, 71, 62, 49],
              [100, 76, 71, 63, 50],
              [100, 77, 72, 64, 50],
              [100, 76, 72, 62, 51],
              [100, 74, 70, 62, 50]
            ],
            Female: [
              [100, 79, 74, 66, 54],
              [100, 77, 73, 65, 54],
              [100, 79, 74, 65, 54],
              [100, 78, 74, 66, 54],
              [100, 78, 74, 65, 54],
              [100, 77, 73, 65, 54]
            ]
          };

          const ageRangeIndex = [
            [18, 25],
            [26, 35],
            [36, 45],
            [46, 55],
            [56, 65],
            [66, Infinity]
          ];

          let userAgeIndex = -1;
          for (let i = 0; i < ageRangeIndex.length; i++) {
            const [min, max] = ageRangeIndex[i];
            if (age >= min && age <= max) {
              userAgeIndex = i;
              break;
            }
          }

          if (userAgeIndex === -1) {
            return { heartRate: -1, riskDegree: "unknown" };
          }

          const ageRangesForGender = ageRanges[gender];
          const [v1, v2, v3, v4, v5] = ageRangesForGender[userAgeIndex];

          if (value >= v1) {
            return { heartRate: 4, riskDegree: "at risk" };
          } else if (value >= v2) {
            return { heartRate: 3, riskDegree: "poor" };
          } else if (value >= v3) {
            return { heartRate: 2, riskDegree: "average" };
          } else if (value >= v4) {
            return { heartRate: 0, riskDegree: "good" };
          } else if (value >= v5) {
            return { heartRate: 0, riskDegree: "excellent" };
          }
        };
        const { heartRate, riskDegree: calculatedRiskDegree } = getHeartRateRiskDegree(userGender, userAge, value);
        if (calculatedRiskDegree !== "unknown") {
          riskDegree = calculatedRiskDegree;
          copyRisks.heartRate = heartRate;
        }
        break;

      case "spo2":
        if (value >= 97 && value <= 100) {
          riskDegree = "excellent";
          copyRisks.spo2 = 0;
        } else if (value < 97 && value >= 95) {
          riskDegree = "good";
          copyRisks.spo2 = 0;
        } else if (value >= 90 && value < 95) {
          riskDegree = "poor";
          copyRisks.spo2 = 3;
        } else if (value >= 0 && value < 90) {
          riskDegree = "at risk";
          copyRisks.spo2 = 4;
        }
        break;

      case "respiratoryRate":
        if (userAge >= 18 && userAge <= 70) {
          if (value >= 12 && value <= 18) {
            riskDegree = "excellent";
            copyRisks.respiratoryRate = 0;
          } else if ((value >= 10) & (value < 12) || (value > 18) & (value <= 20)) {
            riskDegree = "good";
            copyRisks.respiratoryRate = 1;
          } else if ((value >= 8) & (value < 10) || (value > 20) & (value <= 22)) {
            riskDegree = "average";
            copyRisks.respiratoryRate = 2;
          } else if ((value >= 5) & (value < 8) || (value > 22) & (value <= 25)) {
            riskDegree = "poor";
            copyRisks.respiratoryRate = 3;
          } else if ((value >= 0) & (value < 5) || value > 25) {
            riskDegree = "at risk";
            copyRisks.respiratoryRate = 4;
          }
        } else if (userAge > 70) {
          if (value >= 15 && value <= 18) {
            riskDegree = "excellent";
            copyRisks.respiratoryRate = 0;
          } else if ((value >= 12) & (value < 15) || (value > 18) & (value <= 20)) {
            riskDegree = "good";
            copyRisks.respiratoryRate = 1;
          } else if ((value >= 10) & (value < 12) || (value > 20) & (value <= 22)) {
            riskDegree = "average";
            copyRisks.respiratoryRate = 2;
          } else if ((value >= 8) & (value < 10) || (value > 22) & (value <= 25)) {
            riskDegree = "poor";
            copyRisks.respiratoryRate = 3;
          } else if ((value >= 0) & (value < 8) || value > 25) {
            riskDegree = "at risk";
            copyRisks.respiratoryRate = 4;
          }
        }
        break;

      case "stress":
        if (value >= 0 && value < 2) {
          riskDegree = "excellent";
          copyRisks.stress = 0;
        } else if (value >= 2 && value < 3) {
          riskDegree = "good";
          copyRisks.stress = 0;
        } else if (value >= 3) {
          riskDegree = "poor";
          copyRisks.stress = 3;
        }
        break;
      case "sdnn":
        if (value >= 51.5) {
          riskDegree = "excellent";
          copyRisks.sdnn = 0;
        } else if (value >= 35 && value < 51.5) {
          riskDegree = "good";
          copyRisks.sdnn = 0;
        } else if (value >= 10.8 && value < 35) {
          riskDegree = "poor";
          copyRisks.sdnn = 3;
        } else if (value < 10.8) {
          riskDegree = "at risk";
          copyRisks.sdnn = 4;
        }
        break;
      case "rmssd":
        if (value > 50) {
          riskDegree = "excellent";
        } else if (value >= 25 && value <= 50) {
          riskDegree = "good";
        } else if (value < 25) {
          riskDegree = "poor";
          copyRisks.rmssd = 1;
        }
        break;
      case "temperature":
        value = value.toFixed(2);
        if (value >= 36 && value <= 36.5) {
          riskDegree = "excellent";
        } else if (value < 36.5 || value >= 37.5) {
          riskDegree = "good";
        } else if (value > 37.5 || value < 35.5) {
          riskDegree = "poor";
          copyRisks.temperature = 1;
        }
        break;
      case "systolic":
        if (value < 90 || value >= 140) {
          riskDegree = "at risk";
          copyRisks.systolic = 4;
        } else if (value >= 90 && value < 120) {
          riskDegree = "excellent";
          copyRisks.systolic = 0;
        } else if (value >= 120 && value < 130) {
          riskDegree = "good";
          copyRisks.systolic = 0;
        } else if (value >= 130 && value < 140) {
          riskDegree = "poor";
          copyRisks.systolic = 3;
        }
        break;
      case "diastolic":
        if (value < 60 || value >= 90) {
          riskDegree = "at risk";
          copyRisks.diastolic = 4;
        } else if (value >= 60 && value < 70) {
          riskDegree = "excellent";
          copyRisks.diastolic = 0;
        } else if (value >= 70 && value < 80) {
          riskDegree = "good";
          copyRisks.diastolic = 0;
        } else if (value >= 80 && value < 90) {
          riskDegree = "poor";
          copyRisks.diastolic = 3;
        }
        break;
      case "cardiovascularRisk":
        value = value * 100;
        if (value < 10) {
          riskDegree = "excellent";
        } else if (value >= 10 && value < 20) {
          riskDegree = "poor";
          if (risks.cardiovascularRisk < 3) copyRisks.cardiovascularRisk = 3;
        } else if (value >= 20) {
          riskDegree = "at risk";
          if (risks.cardiovascularRisk < 4) copyRisks.cardiovascularRisk = 4;
        }
        break;
      default:
        return;
    }

    if (JSON.stringify(risks) !== JSON.stringify(copyRisks)) {
      setRisks(copyRisks);
    }
    return riskDegree;
  }
};

export default HealthResultCon;
