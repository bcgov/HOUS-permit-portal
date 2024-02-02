import { Alert, AlertDescription, AlertIcon, AlertTitle, Box, HStack, VStack } from "@chakra-ui/react"
import React from "react"
import { IPermitApplication } from "../../../models/permit-application"
import { Form } from "../chefs"

interface IRequirementFormProps {
  permitApplication?: IPermitApplication
  requirements?: any
}

export function RequirementForm({ permitApplication, requirements }: IRequirementFormProps) {
  const form = permitApplication ? permitApplication.requirements : requirements
  const submission = permitApplication?.submissionData

  //if there is no permit application provdided, you cannto run the key items like submit OR file upload.
  const onSubmit = (submission: any) => {
    if (permitApplication) {
      permitApplication.update({ submissionData: submission })
      //error on saving should be handled by error pipeline
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
            submission={submission}
            onSubmit={onSubmit}
            options={permitApplication ? {} : { readOnly: true }}
            //url={}
          />
        </Box>
      </HStack>
    </VStack>
  )
}
