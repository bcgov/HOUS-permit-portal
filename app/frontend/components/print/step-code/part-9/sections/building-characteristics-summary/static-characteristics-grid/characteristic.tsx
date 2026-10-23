import React from "react"
import { generateUUID } from "../../../../../../../utils/utility-functions"
import { ReportCell, ReportMetric, ReportRow, ReportText } from "../../../../../components/step-code-layout"
export function Characteristic({ rowName, lines, isLast = null }) {
  return (
    <ReportRow>
      {lines.map((line, index) => (
        <React.Fragment key={`buildingCharacteristic${rowName}${generateUUID()}`}>
          {index == 0 && (
            <ReportCell colSpan={1}>
              <ReportText>{rowName}</ReportText>
            </ReportCell>
          )}
          <ReportCell colSpan={2}>
            <ReportMetric value={line.details} />
          </ReportCell>
          <ReportCell colSpan={1}>
            <ReportMetric value={line.rsi} />
          </ReportCell>
        </React.Fragment>
      ))}
    </ReportRow>
  )
}
