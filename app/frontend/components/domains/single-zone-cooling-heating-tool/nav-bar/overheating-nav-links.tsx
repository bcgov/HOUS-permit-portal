import { Button, HStack } from "@chakra-ui/react"
import { t } from "i18next"
import React from "react"
import { useNavigate } from "react-router-dom"

export const OverheatingNavLinks = function OverheatingNavLinks() {
  const navigate = useNavigate()

  const handleSave = async () => {
    navigate("/single-zone-cooling-heating-tool/overheating")
  }

  return (
    <HStack>
      {/* TODO: digitize step code checklist guide */}
      {/* <Button variant="tertiary" rightIcon={<ArrowSquareOut />}>
        {t("stepCode.checklistGuide")}
      </Button> */}

      <Button variant="secondary" onClick={handleSave}>
        {t("singleZoneCoolingHeatingTool.createReportButton")}
      </Button>
    </HStack>
  )
}
