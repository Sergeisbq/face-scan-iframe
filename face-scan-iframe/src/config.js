export const isLocal = process.env.NODE_ENV === "development";
export const panopticsUserId = "6e68d676-8432-40d0-9b63-8a3c933464c6";
export const recaptchaSiteKey = "6LfRWXAlAAAAAJbsBIa3bP_aHzWwxV8O7VG5jTzS";
let apiUrlEndpoint = isLocal ? "http://localhost:9733/" : "https://api.bizbaz.tech/";
if (!isLocal && !window.location.host.includes("panel.insightgenie.ai")) apiUrlEndpoint = "https://dev.bizbaz.tech/";

export const endpoints = {
  faceScanEndpoint: apiUrlEndpoint + "face-scan",
  validateVideoTokenIframeLoadEndpoint: apiUrlEndpoint + "face-scan/validate-video-token-iframe-load",
  faceScanUploadAudioIframeEndpoint: apiUrlEndpoint + "face-scan/face-scan-upload-audio-iframe",
  getVideoAnalysisEndpoint: apiUrlEndpoint + "face-scan/video-iframe-analysis",
  getIframeVoiceResultsEndpoint: apiUrlEndpoint + "face-scan/iframe-voice-results",

  isDebuggingFaceScan: false
};
