import { useMemo, useState } from "react";
import HealthResult from "./HealthResult";
import HealthResultItemBlock from "./HealthResultItemBlock";
import { useNavigate } from "react-router-dom";
import AssessmentResultsContainer from "./AssessmentResultsContainer";
import CustomButton from "./CustomButton";
import ProgressRing from "./ProgressRing";

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
  isMobile
}) => {
  const [risks, setRisks] = useState({ cardiovascularRisk: 0 });

  const memoizedAssessedVoiceData = useMemo(() => assessedVoiceData, [assessedVoiceData]);

  let totalExpressionsCount = Object.values(userInfo.expressions).reduce((acc, curr) => acc + curr.count, 0);
  const gender = parseInt(userInfo.gender) === 0 ? "Male" : "Female";
  let health = result;
  let holistic = health.holisticHealth;
  let vs = health.vitalSigns;
  let cardio = health.risks?.cardiovascularRisks;

  const currentDate = new Date();
  const navigate = useNavigate();
  const handleButtonClick = () => {
    navigate("/register");
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

  return (
    <>
      <div className="bg-[#FAFAFA] shadow-xl mt-10">
        <div className="relative top-0 left-0 w-4 h-4 bg-[#339A31]"></div>

        <div className="w-full px-[8%] py-[4%]">
          <>
            <div className="flex tablet:flex-row flex-col items-center tablet:justify-between w-full min-w-[250px] inBetweenN:min-w-[300px]">
              <div className="flex flex-col justify-start w-full tablet:w-1/2">
                <div className="text-start font-grotesk">HEALTH REPORT</div>
                <div className="mt-10 text-3xl text-start font-grotesk">
                  State of Health: {determineHealthLabel(holistic.generalWellness)}
                </div>
                <div className="mt-10 text-start mb-8 font-grotesk text-[#339A31]">
                  <div className="mb-1 nice-scroller">
                    <HealthResult name="Date" value={currentDate.toLocaleString()} />
                    <hr className="mb-2 text-[#F4F4F4]" />
                    {Object.entries(userInfo.expressions).map(([expression, value]) => {
                      const percentage = ((value.count / totalExpressionsCount) * 100).toFixed(2);
                      return (
                        <HealthResult
                          key={expression}
                          name={
                            <div className="flex">
                              {expression}
                              <span className="ml-1 tablet:hidden mobile:block text-[12px] font-normal mt-[2px] text-[#C2C2C2]">{`Accuracy (${(
                                Number(value.percentLevelOfDetection) * 100
                              ).toFixed(0)}%)`}</span>
                            </div>
                          }
                          value={
                            <>
                              <div className="mobile:block tablet:hidden font-bold text-[#4B465C]">{` ${percentage}%`}</div>
                              <div className="mobile:hidden text-xs font-normal text-[#4B465C] tablet:flex flex-col items-end justify-end">
                                <span className="text-base font-bold text-[#4B465C]">{` ${percentage}%`}</span>
                                {`Accuracy (${(Number(value.percentLevelOfDetection) * 100).toFixed(0)}%)`}
                              </div>
                            </>
                          }
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center w-full tablet:w-1/2 tablet:justify-end tablet:items-end">
                <ProgressRing value={Math.floor(holistic.generalWellness)} label={determineHealthLabel(holistic.generalWellness)} />
              </div>
            </div>

            <div className="flex tablet:flex-row gap-5 flex-col items-center tablet:justify-between w-full min-w-[250px] inBetweenN:min-w-[300px]">
              <div className="w-full tablet:w-2/3">
                <div className="flex flex-row items-center justify-start px-8 font-grotesk text-[16px] h-[50px] bg-[#9FD39D] w-full">
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
              </div>
              <div className="w-full tablet:w-1/3">
                <div className="flex flex-row items-center justify-start px-8 font-grotesk text-[16px] h-[50px] bg-[#9FD39D] w-full">
                  Heart
                </div>
                <div className="flex flex-row flex-wrap items-center justify-center w-full mt-[18px] mb-3 tablet:justify-between mobile:gap-2 tablet:gap-6">
                  <HealthResultItemBlock
                    name="Heart Rate"
                    degree={calculateRiskDegree("heartRate", vs.heartRate)}
                    value={checkVitalSignValues(`${vs.heartRate.toFixed(2)} bpm`)}
                  />
                  <HealthResultItemBlock
                    name="RMSSD"
                    degree={calculateRiskDegree("rmssd", vs.hrvRmssd)}
                    value={checkVitalSignValues(`${vs.hrvRmssd.toFixed(2)} bpm`)}
                  />
                  <HealthResultItemBlock
                    name="SDNN"
                    degree={calculateRiskDegree("sdnn", vs.hrvSdnn)}
                    value={checkVitalSignValues(`${vs.hrvSdnn} ms`)}
                  />
                </div>
              </div>
            </div>
            <div className="flex tablet:flex-row gap-5 flex-col items-center tablet:justify-between w-full min-w-[250px] inBetweenN:min-w-[300px]">
              <div className="w-full">
                <div className="flex flex-row items-center justify-start px-8 font-grotesk text-[16px] h-[50px] bg-[#9FD39D] w-full">
                  Blood
                </div>
                <div className="flex flex-row flex-wrap items-center justify-center w-full mt-3 mb-3 tablet:justify-between mobile:gap-2 tablet:gap-6">
                  <HealthResultItemBlock
                    name="Systolic Pressure"
                    degree={calculateRiskDegree("systolic", vs.bloodPressureSystolic)}
                    value={checkVitalSignValues(`${vs.bloodPressureSystolic} mmHg`)}
                  />
                  <HealthResultItemBlock
                    name="Diastolic Pressure"
                    degree={calculateRiskDegree("diastolic", vs.bloodPressureDiastolic)}
                    value={checkVitalSignValues(`${vs.bloodPressureDiastolic} mmHg`)}
                  />
                  <HealthResultItemBlock
                    name="Oxygen in Blood"
                    degree={calculateRiskDegree("spo2", vs.spo2)}
                    value={checkVitalSignValues(`${vs.spo2.toFixed(2)} %`)}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-row gap-5 items-center tablet:justify-between w-full min-w-[250px] inBetweenN:min-w-[300px]">
              <div className="w-full">
                <div className="flex flex-col flex-wrap items-center justify-between w-full gap-2 mt-3 mb-3 tablet:flex-row tablet:gap-6">
                  <div className="flex flex-row justify-center w-full tablet:w-[47%]">
                    <HealthResultItemBlock
                      name="Respiratory Rate"
                      value={checkVitalSignValues(`${vs.respiratoryRate} bpm`)}
                      degree={calculateRiskDegree("respiratoryRate", vs.respiratoryRate)}
                    />
                  </div>
                  <div className="flex flex-row justify-center w-full tablet:w-[47%]">
                    <HealthResultItemBlock
                      name="Stress"
                      value={checkVitalSignValues(`${vs.stress} und`)}
                      degree={calculateRiskDegree("stress", vs.stress)}
                    />
                  </div>
                </div>
              </div>
            </div>
            {isVoiceScanAdded && (
              <>
                <div className="flex flex-col justify-start w-full pt-16 pb-5 tablet:w-1/2">
                  <div className="text-start font-grotesk">VOICE ANALYSIS REPORT</div>
                </div>
                <div className="flex flex-row flex-wrap items-center justify-center w-full px-4 mb-5 mobile:gap-2 tablet:gap-6">
                  <div className={`mt-4 ${assessedVoiceData ? "h-2/3" : ""}`}>
                    {!assessedVoiceData && assessedVoiceData !== -1 ? (
                      <div className="flex flex-col items-center justify-center ">
                        <div className="spinner !w-[90px] !h-[90px]"></div>
                        <p className="m-5 text-lg font-bold text-darkGreen font-grotesk">Voice Results Loading...</p>
                      </div>
                    ) : assessedVoiceData === -1 ? (
                      <div className="flex items-center justify-center h-full text-xl font-bold text-center font-grotesk text-[#993331]">
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
        </div>
      </div>
      <div
        className={`${iframeConfig ? "hidden" : "flex"} flex-col flex-wrap items-center w-full justify-center gap-5 mt-20 tablet:flex-row`}
      >
        <div className="w-full inBetween:w-1/2 inBetweenN:w-2/3">
          <CustomButton text="Register and Start for Free" fullWidth onClick={handleButtonClick} />
        </div>
        <div className="w-full inBetween:w-1/2 inBetweenN:w-2/3">
          <CustomButton text="Try again" fullWidth onClick={tryAgain} />
        </div>
      </div>
      <div className={`${iframeConfig ? "hidden" : "flex"} items-center w-full justify-center mt-20 flex-row`}>
        <div className="flex flex-col font-grotesk justify-center overflow-hidden overflow-y-auto text-sm text-start max-h-80 text-[#938F8F]">
          *General well-being encompasses an individual's overall state of health, considering various aspects of physical, mental, and
          emotional well-being. The scoring ranges used are as follows: Less than 40: Poor. Between 40 and 79: Good. Between 80 and 100:
          Excellent. Typically, scores fall within the range of 80 to 100. A higher score indicates better overall health, while a lower
          score suggests room for improvement in vital signs. Engaging in healthy habits such as regular exercise, maintaining a balanced
          diet, and managing stress can contribute to enhancing overall well-being. To obtain a more precise result, it is necessary to
          gather specific data before evaluating the video. For illustrative purposes, more generalized values have been used.
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
