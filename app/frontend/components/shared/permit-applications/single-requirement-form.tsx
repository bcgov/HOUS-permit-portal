import { Box } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { ISingleRequirementFormJson } from "../../../types/types"
import { Form } from "../chefs"

interface SingleRequirementFormProps {
  requirementJson: ISingleRequirementFormJson
  submissionJson: any
}

export const SingleRequirementForm: React.FC<SingleRequirementFormProps> = ({ requirementJson, submissionJson }) => {
  const { t } = useTranslation()

  return (
    <Box className="form-wrapper single-requirement-form">
      <Form form={requirementJson} submission={submissionJson} options={{ readOnly: true }} />
    </Box>
  )
}
