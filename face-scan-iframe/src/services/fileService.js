import axios from "axios";
import Swal from "sweetalert2";
import { endpoints } from "../config";

const fileService = {
  uploadIframeAudioRecording: async (recordedFile, videoToken, scanScoreId) => {
    try {
      if (recordedFile.size > 10000000) {
        return Swal.fire("File too big", "Max file size is: 10MB", "warning");
      }
      const fd = new FormData();
      fd.append("audio", recordedFile);
      fd.append("videoToken", videoToken);
      fd.append("scanScoreId", scanScoreId);

      const serverRes = await axios.post(endpoints.faceScanUploadAudioIframeEndpoint, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        preventLoading: true
      });
      return serverRes.data;
    } catch (err) {
      return err.response.data;
    }
  }
};

export default fileService;
