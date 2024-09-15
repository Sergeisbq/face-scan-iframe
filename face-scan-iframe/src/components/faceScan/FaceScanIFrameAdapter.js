import { useEffect, useState } from "react";
import assessmentService from "../../services/assessmentService";
import { msgParentWindow } from "../../utils";
import FaceScan from "./FaceScan";
import Swal from "sweetalert2";

const FaceScanIFrameAdapter = ({
  isMobile,
  videoToken,
  noDesign,
  buttonBgColor,
  buttonTextColor,
  showResults,
  age,
  gender,
  isVoiceAnalysisOn
}) => {
  const [failedToLoadMsg, setFailedToLoadMsg] = useState();
  const [onFinishMsg, setOnFinishMsg] = useState();
  const [iframeConfig, setIframeConfig] = useState();

  const checkVideoToken = async () => {
    if (!videoToken) {
      return setFailedToLoadMsg("Missing token or client ID");
    }

    const getVideoTokenData = await assessmentService.validateVideoTokenOnIframeLoadEndpoint(videoToken);
    if (getVideoTokenData.success) {
      setIframeConfig({
        videoToken,
        noDesign,
        buttonBgColor,
        buttonTextColor,
        showResults,
        isVoiceAnalysisOn,
        clientId: getVideoTokenData.clientId,
        age,
        gender
      });
    } else if (getVideoTokenData.isTokenExpired) {
      setFailedToLoadMsg(getVideoTokenData.message);
      msgParentWindow("failedToLoadPage", { success: false, message: "Token Expired" });
    } else if (getVideoTokenData.isTokenUsedAlready) {
      setFailedToLoadMsg(getVideoTokenData.message);
      msgParentWindow("failedToLoadPage", { success: false, message: "Token is already used" });
    }
  };

  const onIFrameFinish = () => {
    Swal.fire(
      "Health analysis completed",
      "The results will be transmitted to the company that has requested this analysis on your behalf.",
      "info"
    );
    setFailedToLoadMsg(null);
    setOnFinishMsg(true);
    setIframeConfig(null);
  };

  useEffect(() => {
    checkVideoToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {iframeConfig && (
        <div className="flex items-center justify-center p-5">
          <FaceScan
            iframeConfig={iframeConfig}
            onIFrameFinish={onIFrameFinish}
            isVoiceScanAdded={iframeConfig.isVoiceAnalysisOn}
            isMobile={isMobile}
          />
        </div>
      )}

      {!iframeConfig && !failedToLoadMsg && !onFinishMsg && <>Loading...</>}

      {onFinishMsg && <></>}

      {failedToLoadMsg && <>{failedToLoadMsg}</>}
    </>
  );
};

export default FaceScanIFrameAdapter;
