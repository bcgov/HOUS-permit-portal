import { Alert, AlertDescription, AlertIcon, AlertTitle, Box, HStack, VStack } from "@chakra-ui/react"
import React, { useState } from "react"
// import stubbedForm from "../../domains/permit-application-builder/stubs/test_permit_application_schema.json"
import { IPermitApplication } from "../../../models/permit-application"
import { Form } from "../chefs"

interface IRequirementFormProps {
  permitApplication?: IPermitApplication
  requirements?: any
}

export function RequirementForm({ permitApplication, requirements }: IRequirementFormProps) {
  const [form, setForm] = useState(permitApplication ? permitApplication.requirements : requirements)
  // const [form, setForm] = useState(stubbedForm)

  //if there is no permit application provdided, you cannto run the key items like submit OR file upload.
  const onSubmit = (submission: any) => {
    if (permitApplication) {
      permitApplication.update({ submissionData: submission })
    } else {
      alert("This is a sample render, you can only submit a real permit applicaiton.")
    }
  }

  if (!permitApplication && !requirements) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>You are not rendering a Permit Application or Requirement Preview</AlertTitle>
        <AlertDescription>Please have </AlertDescription>
      </Alert>
    )
  }

  return (
    <VStack as={"main"} w={"full"} h={"full"}>
      <HStack spacing={10} w={"full"} h={"full"} alignItems={"flex-start"} pr={8}>
        <Box as={"section"} flex={1}>
          <Form
            form={form}
            onSubmit={onSubmit}
            options={permitApplication ? {} : { readOnly: true }}
            //url={}
          />
        </Box>
      </HStack>
    </VStack>
  )
}
