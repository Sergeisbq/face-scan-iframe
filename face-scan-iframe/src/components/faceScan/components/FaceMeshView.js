import { useEffect, useRef, useState } from "react";
import { FACEMESH_TESSELATION } from "@mediapipe/face_mesh";
import { drawConnectors } from "@mediapipe/drawing_utils";
import adapter from "webrtc-adapter";
import { useSelector } from "react-redux";

const FaceMeshView = ({ cameraIndex, video, noDesign }) => {
  const container = useRef(null);
  const canvas = useRef(null);

  const [style, setStyle] = useState({});

  const landmarks = useSelector((state) => state.appSettings.facialLandmarks);

  useEffect(() => {
    if (landmarks) {
      updateStyle();
      redraw();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [landmarks]);

  useEffect(() => {
    if (landmarks) {
      changeTransform();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraIndex]);

  const changeTransform = () => {
    setTimeout(() => {
      const browser = adapter.browserDetails.browser;
      let facingMode;
      if (browser === "firefox") {
        facingMode = video?.srcObject?.getVideoTracks()?.[0].getSettings().facingMode;
      } else {
        facingMode = video?.srcObject?.getVideoTracks()?.[0].getCapabilities().facingMode;
      }
      if (facingMode && facingMode[0] === "environment") {
        if (canvas.current) canvas.current.style.transform = "none";
      } else {
        if (canvas.current) canvas.current.style.transform = "scaleX(-1)";
      }
    }, 1000);
  };

  const updateStyle = () => {
    const videoRef = video?.srcObject?.getVideoTracks()[0];

    let aspectRatio = 0;
    let height;
    let width;

    if (videoRef) {
      height = "100%";
      width = "100%";
      aspectRatio = width && height ? width / height : 0;
    }

    let style = {
      width: "",
      height: "100%",
      left: "0%",
      top: "0%",
      aspectRatio: "auto"
    };

    if (!container.current) {
      return;
    }

    let containerAspectRatio = container.current.clientWidth / container.current.clientHeight;

    if (containerAspectRatio < aspectRatio) {
      style.left = `${((containerAspectRatio - aspectRatio) / containerAspectRatio / 2) * 100}%`;
      style.height = "100%";
    } else {
      style.top = `${(((1 / containerAspectRatio - 1 / aspectRatio) * containerAspectRatio) / 2) * 100}%`;
      style.width = "100%";
    }
    setStyle(style);
  };

  const redraw = () => {
    if (!canvas.current) {
      return;
    }

    const videoRef = video?.srcObject?.getVideoTracks()[0];
    if (videoRef && videoRef.getSettings().width !== undefined && videoRef.getSettings().height !== undefined) {
      canvas.current.width = videoRef.getSettings().width;
      canvas.current.height = videoRef.getSettings().height;
    }

    const ctx = canvas.current.getContext("2d");

    if (ctx !== null) {
      ctx.save();
      ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
      drawConnectors(ctx, landmarks, FACEMESH_TESSELATION, {
        color: "#339A31",
        lineWidth: 0.8
      });
      ctx.restore();
    }
  };

  return (
    <div className={`absolute ${noDesign ? "-top-[3%]" : "top-0"} left-0 z-0 w-full h-full overflow-hidden`} ref={container}>
      <canvas className="face-scan-canvas" ref={canvas} style={style}></canvas>
    </div>
  );
};

export default FaceMeshView;
