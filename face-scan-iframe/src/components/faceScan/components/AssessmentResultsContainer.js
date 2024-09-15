import { Popover, Typography } from "@mui/material";
import { useState } from "react";
import { camelCaseToCapitalizedSpace, getBarWidthInPercentForVoiceLabel, matchResultsToPrettyLabel } from "../../../utils";

const AssessmentResultsContainer = ({ assessedData, assessmentType, padding, minWidth, wrap }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const [openPopoverId, setOpenPopoverId] = useState(null);

  const alignedLabeledData = matchResultsToPrettyLabel(assessedData, assessmentType);
  const filteredData = alignedLabeledData.filter((item) =>
    wrap ? typeof item.labelValue !== "string" : typeof item.labelValue === "string"
  );

  const handlePopoverToggle = (e, popoverId) => {
    setAnchorEl(openPopoverId === popoverId ? null : e.currentTarget);
    setOpenPopoverId(openPopoverId === popoverId ? null : popoverId);
  };

  return (
    <div
      className={`flex justify-center font-grotesk ${
        wrap ? "flex-wrap" : "flex-wrap mobile:justify-center tablet:gap-10 mt-0"
      } mobile:gap-6 text-[16px] font-400 text-[black]`}
    >
      {filteredData?.map((labeledData) => {
        const popoverId = `popover-${labeledData.key}`;
        const properDisplayStringValue = labeledData.valueCount ? null : camelCaseToCapitalizedSpace(labeledData.labelValue);
        return (
          <div className="flex flex-col" key={`${labeledData.key}-label-data`}>
            <div className={`flex justify-center tablet:px-${padding ?? 5}`}>
              <Typography
                className="mobile:min-w-[280px] tablet:min-w-[260px] inBetween:min-w-[365px]"
                aria-owns={openPopoverId === popoverId ? popoverId : undefined}
                aria-haspopup="true"
                onMouseEnter={(e) => handlePopoverToggle(e, popoverId)}
                onMouseLeave={(e) => handlePopoverToggle(e, popoverId)}
              >
                <div className="flex flex-col mt-0">
                  <div className={`flex justify-between ${wrap ? "" : "border-b border-[#339A31] p-2"}`}>
                    <div className="inline-block truncate font-grotesk" style={{ maxWidth: minWidth ? minWidth - 40.8 : 210 }}>
                      {labeledData.title}
                    </div>
                    {labeledData.valueCount ? (
                      <div className="font-grotesk">{`${labeledData.labelValue}/${labeledData.valueCount}`}</div>
                    ) : (
                      <div className="font-grotesk">{` ${properDisplayStringValue}`}</div>
                    )}
                  </div>
                  {labeledData.valueCount && (
                    <div className="mt-4 voice-data-assessment-results-container">
                      <div
                        className="voice-data-assessment-results-top-bar"
                        style={{
                          width: `${getBarWidthInPercentForVoiceLabel(labeledData.labelValue, labeledData.valueCount)}%`
                        }}
                      />
                    </div>
                  )}
                </div>
              </Typography>
              <Popover
                disableScrollLock={true}
                id={popoverId}
                sx={{
                  pointerEvents: "none"
                }}
                open={openPopoverId === popoverId}
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left"
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left"
                }}
                onClose={(e) => handlePopoverToggle(e, popoverId)}
                disableRestoreFocus
              >
                <Typography
                  sx={{ p: 2, fontFamily: "Space Grotesk", fontSize: "12px", fontWeight: 300, color: "#5c596b", maxWidth: "400px" }}
                >
                  {labeledData?.description}
                </Typography>
              </Popover>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AssessmentResultsContainer;
