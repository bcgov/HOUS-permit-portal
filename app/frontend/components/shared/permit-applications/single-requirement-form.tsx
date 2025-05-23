import { Box } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { ISingleRequirementFormJson } from "../../../types/types"
import { Form } from "../chefs"

interface SingleRequirementFormProps {
  requirementJson: ISingleRequirementFormJson
  submissionData: any
}

export const SingleRequirementForm: React.FC<SingleRequirementFormProps> = ({ requirementJson, submissionData }) => {
  const { t } = useTranslation()
  return (
    <Box className="form-wrapper single-requirement-form">
      <Form form={requirementJson} submission={submissionData} options={{ readOnly: true }} />
    </Box>
  )
}
