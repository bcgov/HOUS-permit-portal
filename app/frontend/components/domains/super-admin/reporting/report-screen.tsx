import { Container } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useParams } from "react-router-dom"
import { useMst } from "../../../../setup/root"
import { ReportControls } from "./report-controls"
import { ReportShell } from "./report-shell"

export const ReportScreen = observer(() => {
  const { reportKey } = useParams()
  const { reportStore } = useMst()
  const { fetchReport, currentPayload, isLoading, rangePreset } = reportStore

  useEffect(() => {
    if (reportKey) fetchReport(reportKey)
  }, [reportKey, rangePreset])

  return (
    <Container maxW="container.lg" p={{ base: 4, md: 8 }} as="main">
      <ReportShell
        payload={currentPayload}
        isLoading={isLoading}
        controls={reportKey ? <ReportControls reportKey={reportKey} /> : null}
      />
    </Container>
  )
})
