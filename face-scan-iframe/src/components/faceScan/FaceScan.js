import { useState, useEffect, useRef } from "react";
import { VitalSignCamera, GetHealthStage, ServerId } from "react-vital-sign-camera";
import { endpoints, panopticsUserId } from "../../config";
import { useDispatch } from "react-redux";
import "@mediapipe/face_mesh";
import FaceMeshView from "./components/FaceMeshView";
import facePlacementImgScaled from "../../assets/images/face_placement_scaled.png";
import facePlacementImgScaledVertical from "../../assets/images/face_placement_scaled_vertical.png";
import assessmentServices from "../../services/assessmentService";
import CameraSwitchIcon from "@mui/icons-material/Cameraswitch";
import FaceApi from "./components/FaceApi";
import { FaceApiWarmUp } from "./components/FaceApi";
import { setLoaderOff, setLoaderOn, updateDemoVideoConditions, updateFacialLandmarks } from "../../store/reducers/appSettings";
import "../../assets/css/faceScan.css";
import fileService from "../../services/fileService";
import Swal from "sweetalert2";
import downloadjs from "downloadjs";
import { getAudioPackageName, msgParentWindow, runFunctionEveryMSUntilSuccess, isCameraLandscapeAlign } from "../../utils";
import { closeSnackbar, enqueueSnackbar } from "notistack";
import CloseIcon from "@mui/icons-material/Close";
import { MenuItem, Select } from "@mui/material";
import ConditionsChecklist from "./components/ConditionsChecklist";
import VideoDemoEvaluateButton from "./components/VideoEvaluateButton";
import VideoTimeAndStatus from "./components/VideoTimeAndStatus";
import HealthResultCon from "./components/HealthResultCon";
GetHealthStage.Finished = 4;

let recorder,
  audioStream,
  mediaStreamSource,
  isErrorRecorded,
  stopSendingLandingMarksInParentWindow = false;

const FaceScan = ({ iframeConfig, onIFrameFinish, isVoiceScanAdded, setIsVoiceScanAdded, isMobile }) => {
  const [camera, setCamera] = useState();
  const [scanResults, setScanResults] = useState();
  const [videoDimensions, setVideoDimensions] = useState({});
  const [analysisStatus, setAnalysisStatus] = useState(GetHealthStage.Idle);
  const [cameraDevices, setCameraDevices] = useState([{ text: "", id: "", deviceIndex: 0 }]);
  const [cameraIndex, setCameraIndex] = useState(0);
  const [video, setVideo] = useState(null);
  const [assessedVoiceData, setAssessedVoiceData] = useState(null);
  const [voiceDataErrorMessage, setVoiceDataErrorMessage] = useState(null);
  const [isTimerFinished, setIsTimerFinished] = useState(false);
  const [isFaceMeshReady, setIsFaceMeshReady] = useState(false);
  const [isCamPermissionAllowed, setIsCamPermissionAllowed] = useState(false);
  const [isMicPermissionAllowed, setIsMicPermissionAllowed] = useState(false);
  const [isScanningReadyToStart, setIsScanningReadyToStart] = useState(false);

  const mediaDevicesRef = useRef(null);
  const screen = useRef(null);
  const scanScoreId = useRef(null);
  const cameraRef = useRef(null);
  const userFaceInfo = useRef({
    expressions: {},
    age: 0,
    gender: 0,
    userId: panopticsUserId
  });
  const dispatch = useDispatch();

  useEffect(() => {
    getCameraPermission(isVoiceScanAdded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCameraPermission = async (isVoiceAnalysisOn) => {
    dispatch(setLoaderOn());
    // The FaceAPI needs some warm up time - otherwise the recorded voice will be distorted at the beginning.
    (!iframeConfig?.age || !iframeConfig?.gender) && FaceApiWarmUp();

    try {
      // Checking if camera access is already enabled from before
      const videoPermission = await navigator.permissions.query({ name: "camera" });
      const keepCameraPermissionInitState = videoPermission.state;

      if (videoPermission.state === "granted") {
        // if permissions are already granted lets put a loader for a few seconds until things are fully loaded
        // This is just in order to improve the UX.
        setTimeout(() => dispatch(setLoaderOff()), 5000);
      }

      const neededPermissions = { video: true };
      if (isVoiceAnalysisOn) {
        audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamSource = new AudioContext().createMediaStreamSource(audioStream);
        neededPermissions.audio = true;
        setIsMicPermissionAllowed(true);
      }

      mediaDevicesRef.current = await navigator.mediaDevices.getUserMedia(neededPermissions);

      setIsCamPermissionAllowed(true);

      // If when the user reached the page and there were no permissions requested and then now he gave the permissions.
      // Lets show a loader shortly under all loads and then turn it off
      if (keepCameraPermissionInitState === "prompt") {
        setTimeout(() => dispatch(setLoaderOff()), 2000);
      }

      mediaDevicesRef.current.getTracks().forEach((track) => {
        track.stop();
      });
    } catch (error) {
      console.log("Error getting camera permission");
      console.error(error);
      setTimeout(() => dispatch(setLoaderOff()), 2000);
    }

    let devices = await navigator.mediaDevices.enumerateDevices();
    devices = devices.filter((device) => device.kind === "videoinput");
    let deviceList = devices.map((device, index) => {
      return { text: device.label, id: device.deviceId, deviceIndex: index };
    });
    setCameraDevices(deviceList);
  };

  const handleVoiceScanChange = (e) => {
    const isVoiceAnalysisOn = e.target.value === "Video + Audio";
    setIsVoiceScanAdded(isVoiceAnalysisOn);
    getCameraPermission(isVoiceAnalysisOn);
  };

  const tryAgain = () => {
    setTimeout(() => {
      setIsCamPermissionAllowed(true);
    }, 100);
    setIsCamPermissionAllowed(false);
    setAssessedVoiceData(null);
    setVoiceDataErrorMessage(null);
    setAnalysisStatus(GetHealthStage.Idle);
    setScanResults();
    setIsTimerFinished(false);
    setIsVoiceScanAdded(false);
  };

  const handleGettingVoiceDataWithinIframeUI = async () => {
    const results = await runFunctionEveryMSUntilSuccess(5000, 10, 3000, async () => {
      const voiceResults = await assessmentServices.getIframeVoiceResults(iframeConfig?.videoToken, scanScoreId.current);
      if (voiceResults.audioSubScores && voiceResults.score) {
        return voiceResults;
      }
      if (!voiceResults.success) {
        return voiceResults;
      }
    });

    if (results) return results;

    // Failed to get results
    setAssessedVoiceData(-1);
    msgParentWindow("failedToGetVoiceAnalysisResult", { success: false, message: "Voice analyses took too long" });
  };

  // We try to upload the audio file multiple time because we might not have facescan results just yet at the time of the audio upload
  const handleUploadAudio = async (recordedVoiceFile) => {
    return await runFunctionEveryMSUntilSuccess(5000, 10, 0, async () => {
      if (!scanScoreId.current) return;
      if (iframeConfig && isVoiceScanAdded) {
        return await fileService.uploadIframeAudioRecording(recordedVoiceFile, iframeConfig?.videoToken, scanScoreId.current);
      }
    });
  };

  const createDataForResults = (data) => {
    const { vital_signs, holistic_health, health_risks } = data;
    return {
      vitalSigns: {
        heartRate: vital_signs.heart_rate,
        spo2: vital_signs.spo2,
        ibi: vital_signs.ibi,
        respiratoryRate: vital_signs.respiratory_rate,
        stress: vital_signs.stress,
        stressScore: vital_signs.stress_score,
        hrvSdnn: vital_signs.hrv_sdnn,
        hrvRmssd: vital_signs.hrv_rmssd,
        temperature: vital_signs.temperature,
        bloodPressure: vital_signs.blood_pressure,
        bloodPressureSystolic: vital_signs.blood_pressure_systolic,
        bloodPressureDiastolic: vital_signs.blood_pressure_diastolic
      },
      holisticHealth: {
        generalWellness: holistic_health.general_wellness
      },
      risks: {
        cardiovascularRisks: {
          generalRisk: health_risks.cvd_risk_general,
          coronaryHeartDisease: health_risks.cvd_risk_CHD,
          congestiveHeartFailure: health_risks.cvd_risk_CHF,
          intermittentClaudication: health_risks.cvd_risk_IC,
          stroke: health_risks.cvd_risk_Stroke
        },
        covidRisk: {
          covidRisk: health_risks.covid_risk
        }
      }
    };
  };

  const stopRecording = (isError) => {
    if (recorder !== null) {
      recorder.stop();
      const tracks = audioStream.getTracks();
      tracks.forEach((track) => {
        track.stop();
      });

      if (isError) return;

      // Export the WAV file
      recorder.exportWAV(async function (blob) {
        // It is for downloading and debugging the recorded voice.
        if (endpoints.isDebuggingFaceScan) downloadjs(blob, "recordedVoice.wav");
        // const audioBlobUrl = (window.URL || window.webkitURL).createObjectURL(blob);
        const recordedVoiceFile = new File([blob], "recordedVoice.wav", { type: "audio/wav" });
        let res;
        if (iframeConfig) {
          // This is the iframe
          res = await handleUploadAudio(recordedVoiceFile);

          if (!res.success) {
            // Failed to upload audio file
            msgParentWindow("failedToGetVoiceAnalysisResult", { success: false, message: res.msg });
            return setAssessedVoiceData(-1);
          }

          let analysisData = {};
          if (iframeConfig?.showResults !== "none") {
            const voiceData = await handleGettingVoiceDataWithinIframeUI();
            if (voiceData) {
              if (voiceData.success) {
                analysisData = voiceData;
                iframeConfig.showResults === "display" && setAssessedVoiceData(analysisData);
                msgParentWindow("onVoiceAnalysisFinished", analysisData.audioSubScores);
              }
              if (!voiceData.success) {
                setAssessedVoiceData(-1);
                msgParentWindow("failedToGetVoiceAnalysisResult", { success: false, message: voiceData.msg });
              }
            }
          } else {
            msgParentWindow("onVoiceAnalysisFinished", {
              success: true,
              message: "The result will be sent via the webhook set in your account"
            });
          }

          analysisData.scoreId = scanScoreId.current;
          analysisData.success = true;
        } else {
          // This is the demo
          res = await handleUploadAudio(recordedVoiceFile);
          if (!res.success) {
            setAssessedVoiceData(-1);
            return;
          }
          if (res.status === 202) {
            setAssessedVoiceData(-1);
            return Swal.fire(
              "Voice analyses took too long",
              "Please record another recording with at least 35 seconds of continuous talk or contact us for more information",
              "info"
            );
          }
          if (res?.immediateScoreInfo?.packagesData?.audioUpload?.errorMessage) {
            const errorMessage = res?.immediateScoreInfo?.packagesData?.audioUpload?.errorMessage;
            setVoiceDataErrorMessage(errorMessage);
            setAssessedVoiceData(-1);
            return;
          }

          const packagesData = res?.immediateScoreInfo?.packagesData || {};
          const packageName = getAudioPackageName(packagesData?.audioUpload?.audioServiceType);
          const scoredPackage = packagesData?.[packageName];
          setAssessedVoiceData(scoredPackage);
        }
      });
    }
  };

  const handlePanopticsRequests = async (...args) => {
    try {
      let dataToSend;
      let faceScanEndpoint = endpoints.faceScanEndpoint;
      // This if will be "true" only for the second call of panoptic
      if (args[1].body.length > 25) {
        dataToSend = JSON.parse(args[1].body);
        if (dataToSend.userInfo && (dataToSend.userInfo.age || dataToSend.userInfo.age === 0)) {
          if (iframeConfig?.age) {
            dataToSend.userInfo.age = iframeConfig.age;
          } else {
            dataToSend.userInfo.age = parseInt(userFaceInfo.current.age);
          }

          if (iframeConfig?.gender) {
            dataToSend.userInfo.gender = iframeConfig.gender.toLowerCase() === "male" ? 0 : 1;
          } else {
            dataToSend.userInfo.gender = parseInt(userFaceInfo.current.gender);
          }

          args[1].body = JSON.stringify(dataToSend);
        }

        if (iframeConfig) faceScanEndpoint = endpoints.getVideoAnalysisEndpoint;
      }

      const res = await fetch(faceScanEndpoint, {
        method: "POST",
        headers: {
          Authorization: localStorage.getItem("token"),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          url: args[0],
          requestData: args[1],
          videoToken: iframeConfig?.videoToken,
          showResultsBool: iframeConfig?.showResults !== "none",
          isVoiceAnalysisOnBool: iframeConfig?.isVoiceAnalysisOn,
          expressions: userFaceInfo?.current?.expressions
        })
      });

      let data;
      let rawResponse = res;
      // If we have the "proper" second call with the final data
      if (dataToSend && dataToSend.userInfo && dataToSend.userInfo.age) {
        rawResponse = res.clone();
        data = await res.json();

        // This we need for case when our panoptic token is expired, because they do not provide any relevant info to handle it properly
        if (data.message === "Broken data provided") {
          Swal.fire("Something went wrong", "Face scan service is currently not working, please try again later", "warning");
          if (iframeConfig) msgParentWindow("failedToGetHealthAnalysisResult", { success: false });
          return tryAgain();
        }

        // If we just saved a new score record and we have its ID.
        if (iframeConfig && data._id) {
          scanScoreId.current = data._id;
        }
        if (data.scoringHistoryId) {
          scanScoreId.current = data.scoringHistoryId;
        }

        // For iframe not displaying results
        if (!data.success && onIFrameFinish) {
          msgParentWindow("onHealthAnalysisFinished", {
            success: true,
            message: "The result will be sent via the webhook set in your account"
          });
          return rawResponse;
        }
        // if we got final panoptic scores -results from the second call.
        if (data && data.health_risks) {
          // if there is no prevention of showing data - show it
          if (!iframeConfig || iframeConfig?.showResults === "display") {
            setScanResults(createDataForResults(data));
          }
          msgParentWindow("onHealthAnalysisFinished", createDataForResults(data));
        }
      }

      return rawResponse;
    } catch (err) {
      msgParentWindow("failedToGetHealthAnalysisResult", { success: false });
      console.log("Failed to parse json p-data");
    } finally {
      dispatch(setLoaderOff());
    }
  };

  const CONFIG = {
    httpCall: handlePanopticsRequests,
    serverId: ServerId.AwsProdEnterprise
  };

  const landscapeAlign = isCameraLandscapeAlign(videoDimensions);

  const setNewVideoDim = (e) => {
    const videoHeight = e.target.videoHeight;
    const videoWidth = e.target.videoWidth;
    setVideoDimensions({ height: videoHeight, width: videoWidth });
  };

  useEffect(() => {
    return () => {
      cameraRef.current?.removeEventListener("loadedmetadata", setNewVideoDim);
    };
  }, []);

  // Those func fires from within panoptic //
  // This func fires when we are ready to start scanning
  const onCameraReadyToStartScan = (camera) => {
    const current = camera.getVideo();
    cameraRef.current = current;
    current.addEventListener("loadedmetadata", setNewVideoDim);
    current.style.borderRadius = "4px 4px 0px 0px";
    setCamera(camera);
    setVideo(current);
    setIsScanningReadyToStart(true);
  };

  const handleFaceScanError = (error) => {
    // error?.message -> options "face lost" or basically another error.
    if (!isErrorRecorded) {
      isErrorRecorded = true;
      if (isVoiceScanAdded) stopRecording(true);
      setAnalysisStatus(GetHealthStage.Idle);
      msgParentWindow("failedToGetHealthAnalysisResult", "Failed to continue scanning, face detection lost");
      // Firing a snackbar to notify the user
      enqueueSnackbar({
        autoHideDuration: 10000,
        className: "bg-primary-important",
        action: (snackbarId) => {
          return (
            <div className="flex">
              <div className="pr-5">
                <div className="font-bold">Face detection lost.</div>
                {error?.message === "face lost" ? <>Please try again and stay within the face mark</> : <>Please try again later</>}
              </div>
              <button onClick={() => closeSnackbar(snackbarId)}>
                <CloseIcon sx={{ color: "white" }} />
              </button>
            </div>
          );
        }
      });
    }
  };
  // These are the land marks on the camera and the conditions being met or not. (gets called every second or so)
  const onVideoFrameProcessed = (processedFrame) => {
    if (iframeConfig?.noDesign && processedFrame.healthResult.stage === 2) stopSendingLandingMarksInParentWindow = true;
    if (analysisStatus !== GetHealthStage.Finished) {
      if (processedFrame.scanConditions && analysisStatus !== GetHealthStage.CollectingData) {
        dispatch(updateDemoVideoConditions(processedFrame.scanConditions));
        if (iframeConfig?.noDesign && !stopSendingLandingMarksInParentWindow) {
          msgParentWindow("conditionStatus", processedFrame.scanConditions);
        }
      }
      if (processedFrame.healthResult?.error) {
        // If there is an error (lost face or something)
        handleFaceScanError(processedFrame.healthResult.error);
        return;
      }

      // For the time being im skipping the face box indication
      if (processedFrame.landmarks) {
        if (!isFaceMeshReady) {
          setIsFaceMeshReady(true);
          dispatch(setLoaderOff());
        }
        dispatch(updateFacialLandmarks(processedFrame.landmarks));
      }
    }
  };

  const startScanning = async () => {
    if (isErrorRecorded) isErrorRecorded = false;
    camera?.startScanning();
    setAnalysisStatus(GetHealthStage.CollectingData);

    if (isVoiceScanAdded) {
      //startRecording
      recorder = new window.Recorder(mediaStreamSource, { numChannels: 1 });
      recorder.record();
    }

    msgParentWindow("onAnalysisStart", { success: true });
  };

  // Those func fires from within panoptic //
  const switchCamera = () => {
    setCameraIndex((cameraIndex + 1) % cameraDevices.length);
  };

  const onTimerFinished = async (isError) => {
    try {
      setIsScanningReadyToStart(false);
      setIsTimerFinished(true);
      if (isVoiceScanAdded) stopRecording();
      setAnalysisStatus(isError ? GetHealthStage.Idle : GetHealthStage.Finished);
      dispatch(setLoaderOn());
      await camera?.waitCameraToStop();

      if (onIFrameFinish && iframeConfig?.showResults !== "display") {
        onIFrameFinish();
        dispatch(setLoaderOff());
      }

      if (scanResults) {
        dispatch(setLoaderOff());
      }
    } catch (err) {
      msgParentWindow("failedToGetResults", { success: false });
    }
  };

  return (
    <>
      {iframeConfig?.noDesign ? (
        <div className="flex flex-col w-full" ref={screen}>
          <VideoTimeAndStatus
            analysisStatus={analysisStatus}
            isVoiceScanAdded={isVoiceScanAdded}
            onTimerFinished={onTimerFinished}
            noDesign={iframeConfig.noDesign}
          />
          <div
            className="relative flex flex-col items-end justify-center w-full bg-white h-fit"
            style={{ display: isScanningReadyToStart ? "flex" : "none" }}
          >
            <div className="flex flex-col items-center">
              <VitalSignCamera
                isActive={isScanningReadyToStart}
                config={CONFIG}
                userInfo={userFaceInfo.current}
                onVideoFrameProcessed={onVideoFrameProcessed}
                onCreated={onCameraReadyToStartScan}
                device={cameraDevices[cameraIndex].id}
              />
              {cameraDevices && cameraDevices.length > 1 && analysisStatus === GetHealthStage.Idle && (
                <div className="absolute z-20 cursor-pointer top-3 right-3">
                  <CameraSwitchIcon onClick={switchCamera} className="!text-white" sx={{ fontSize: "40px" }} />
                </div>
              )}
              {isScanningReadyToStart && video && isFaceMeshReady && (
                <FaceMeshView cameraIndex={cameraIndex} video={video} noDesign={iframeConfig.noDesign} />
              )}
              {landscapeAlign === true ? (
                <img src={facePlacementImgScaled} alt="face placement" className="absolute w-2/3 h-[100%] overflow-hidden top-2 z-[0]" />
              ) : (
                <img
                  src={facePlacementImgScaledVertical}
                  alt="face placement"
                  className="absolute w-full h-[70%] overflow-hidden top-[15%]"
                />
              )}
            </div>

            {analysisStatus === GetHealthStage.Idle && (
              <VideoDemoEvaluateButton
                startScanning={startScanning}
                bgColor={iframeConfig.buttonBgColor}
                textColor={iframeConfig.buttonTextColor}
              />
            )}
          </div>
          {scanResults && isTimerFinished && iframeConfig.showResults === "display" && (
            <div className="max-w-[910px] p-0">
              <HealthResultCon
                result={scanResults}
                userInfo={userFaceInfo.current}
                isVoiceScanAdded={isVoiceScanAdded}
                assessedVoiceData={assessedVoiceData}
                voiceDataErrorMessage={voiceDataErrorMessage}
                tryAgain={tryAgain}
                iframeConfig={iframeConfig}
                isMobile={isMobile}
              />
            </div>
          )}
          {(!iframeConfig.age || !iframeConfig.gender) && (
            <FaceApi analysisStatus={analysisStatus} userFaceInfo={userFaceInfo} video={video} />
          )}
        </div>
      ) : (
        <div className="max-w-[910px] px-0">
          <div className={scanResults && isTimerFinished ? "hidden" : `flex justify-between h-full landing-page-con pt-5 pb-10 px-5`}>
            <div className="flex flex-col w-full" ref={screen}>
              <div className="flex flex-col items-center justify-around h-full border rounded-md border-lightGrey">
                <div className={`${analysisStatus === GetHealthStage.Idle ? "p-0 " : "tablet:pt-2 tablet:px-4 rounded-md "}`}>
                  {isCamPermissionAllowed ? (
                    <>
                      {analysisStatus === GetHealthStage.Idle ? (
                        <div
                          className={`${
                            iframeConfig ? "hidden" : "flex justify-between gap-2 my-2 bg-white tablet:hidden flex-col w-full px-3"
                          }`}
                        >
                          <div className="flex flex-row justify-between w-full gap-4">
                            <div className="z-20 flex justify-center w-full bg-white rounded-md">
                              <Select
                                className="w-full p-2 border border-[#9FD39D] h-[50px] !font-grotesk"
                                variant="standard"
                                value={isVoiceScanAdded ? "Video + Audio" : "Video only"}
                                MenuProps={{ disableScrollLock: true }}
                                style={{ fontSize: isMobile ? "14px" : "16px" }}
                                onChange={handleVoiceScanChange}
                              >
                                <MenuItem className="!font-grotesk" value="Video only">
                                  Video only
                                </MenuItem>
                                <MenuItem className="!font-grotesk" value="Video + Audio">
                                  Video + Audio
                                </MenuItem>
                              </Select>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center w-full mt-2 bg-white rounded-t-md tablet:flex-row tablet:items-start">
                          <div className="w-[80px] items-center justify-center h-full tablet:mt-4 tablet:mb-4 tablet:ml-6 inBetween:mt-2">
                            <VideoTimeAndStatus
                              analysisStatus={analysisStatus}
                              isVoiceScanAdded={isVoiceScanAdded}
                              onTimerFinished={onTimerFinished}
                            />
                          </div>
                          <div className="border-b-2 w-[70px] mt-[45px] tablet:mt-[50px] inBetween:mt-[45px] ml-1 rotate-90 text-lightGrey mobile:hidden tablet:block " />
                          <div className="flex items-center justify-start w-full h-full tablet:mt-2">
                            {isVoiceScanAdded ? (
                              <div className="flex flex-col items-start">
                                <div className="pl-2 mt-2 text-md font-grotesk">Answer this Question</div>
                                <div className="p-2 text-lg tablet:pt-0 inBetween:pt-2 tablet:mr-5 inBetween:mr-0 font-grotesk">
                                  What advice would you give to someone who is just starting out in their career?
                                </div>
                              </div>
                            ) : (
                              <div className="p-2 text-lg font-grotesk">
                                Stay in the center of the video and try not to move while we analyze it
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div
                        className="relative flex items-end justify-center w-full bg-white h-fit"
                        style={{ display: isScanningReadyToStart ? "flex" : "none" }}
                      >
                        {
                          <div className="flex flex-col w-full h-fit">
                            <VitalSignCamera
                              isActive={isScanningReadyToStart}
                              config={CONFIG}
                              userInfo={userFaceInfo.current}
                              onVideoFrameProcessed={onVideoFrameProcessed}
                              onCreated={onCameraReadyToStartScan}
                              device={cameraDevices[cameraIndex].id}
                            />
                            {analysisStatus === GetHealthStage.Idle ? (
                              <div
                                className={`${
                                  iframeConfig ? "hidden" : "hidden tablet:flex flex-row justify-between gap-4 w-full p-3 z-20"
                                }`}
                              >
                                <div className="flex flex-row justify-between w-1/2 gap-4">
                                  <div className="z-20 hidden w-full bg-white rounded-md tablet:block">
                                    <Select
                                      className="w-full p-2 border border-[#9FD39D] h-[50px] !font-grotesk"
                                      variant="standard"
                                      value={isVoiceScanAdded ? "Video + Audio" : "Video only"}
                                      onChange={handleVoiceScanChange}
                                      MenuProps={{ disableScrollLock: true }}
                                    >
                                      <MenuItem className="!font-grotesk" value="Video only">
                                        Video only
                                      </MenuItem>
                                      <MenuItem className="!font-grotesk" value="Video + Audio">
                                        Video + Audio
                                      </MenuItem>
                                    </Select>
                                  </div>
                                </div>
                                <div className="flex flex-row justify-between w-1/2">
                                  {analysisStatus === GetHealthStage.Idle ? (
                                    <div className="z-20 w-full h-full">
                                      <VideoDemoEvaluateButton startScanning={startScanning} />
                                    </div>
                                  ) : (
                                    <></>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-around h-full mt-4 mb-2 text-xl font-medium font-grotesk text-darkGreen">
                                Analyzing ...
                              </div>
                            )}
                          </div>
                        }
                        {cameraDevices && cameraDevices.length > 1 && analysisStatus === GetHealthStage.Idle && (
                          <div className="absolute z-20 cursor-pointer top-3 right-3">
                            <CameraSwitchIcon onClick={switchCamera} className="!text-white" sx={{ fontSize: "40px" }} />
                          </div>
                        )}
                        {isScanningReadyToStart && video && isFaceMeshReady && (
                          <FaceMeshView cameraIndex={cameraIndex} video={video} noDesign={iframeConfig.noDesign} />
                        )}
                        {landscapeAlign === true ? (
                          <img
                            src={facePlacementImgScaled}
                            alt="face placement"
                            className="absolute w-2/3 h-[100%] overflow-hidden top-2 z-[0]"
                          />
                        ) : (
                          <img
                            src={facePlacementImgScaledVertical}
                            alt="face placement"
                            className="absolute w-full h-[70%] overflow-hidden top-[15%]"
                          />
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center relative h-[550px] w-full bg-black">
                      <div className="text-white w-[220px] text-center font-grotesk">
                        It is necessary to allow us to use the camera to start the test.
                      </div>
                      <img src={facePlacementImgScaled} alt="face placement" className="absolute w-2/3 h-[100%] overflow-hidden top-2" />
                    </div>
                  )}
                  <div>
                    {analysisStatus === GetHealthStage.Idle ? (
                      <div className={`z-20 flex w-full h-full p-3 ${iframeConfig ? "" : "tablet:hidden"}`}>
                        <VideoDemoEvaluateButton startScanning={startScanning} />
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                  <ConditionsChecklist isVoiceScanAdded={isVoiceScanAdded} isMicPermissionAllowed={isMicPermissionAllowed} />
                </div>
              </div>

              <div className={`flex items-center justify-center`}>
                {analysisStatus === GetHealthStage.Idle ? (
                  <div className={`flex ${isVoiceScanAdded ? "flex-col items-center" : ""} justify-center mt-8 ml-3`}>
                    {isVoiceScanAdded && (
                      <div className="mb-10 text-lg text-center font-grotesk">
                        You will need to answer a question and you answer has to be at least 30 seconds long. You will be prompted to answer
                        this question after you click Start Evaluation
                      </div>
                    )}
                  </div>
                ) : (
                  <></>
                )}
              </div>
            </div>
          </div>
          {scanResults && isTimerFinished && (
            <HealthResultCon
              result={scanResults}
              userInfo={userFaceInfo.current}
              isVoiceScanAdded={isVoiceScanAdded}
              assessedVoiceData={assessedVoiceData}
              voiceDataErrorMessage={voiceDataErrorMessage}
              tryAgain={tryAgain}
              iframeConfig={iframeConfig}
              isMobile={isMobile}
            />
          )}
          {(!iframeConfig?.age || !iframeConfig?.gender) && (
            <FaceApi analysisStatus={analysisStatus} userFaceInfo={userFaceInfo} video={video} />
          )}
        </div>
      )}
    </>
  );
};

export default FaceScan;
