import { Box } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { IRequirementTemplateUpdateParams } from "../../../../../types/api-request"

export interface IRequirementTemplateForm extends IRequirementTemplateUpdateParams {}

export const EditEarlyAccessRequirementTemplateScreen = observer(function EditEarlyAccessRequirementTemplateScreen() {
  return <Box as="main">EDIT EARLY ACCESS SCREEN</Box>
})
