import { Alert, AlertDescription, AlertIcon, AlertTitle, Box, HStack, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useMountStatus } from "../../../hooks/use-mount-status"
import { IPermitApplication } from "../../../models/permit-application"
import { Form } from "../chefs"

interface IRequirementFormProps {
  permitApplication?: IPermitApplication
}

export const RequirementForm = observer(({ permitApplication }: IRequirementFormProps) => {
  const { submissionData, setSelectedTabIndex, indexOfBlockId, formJson, getBlockClasses } = permitApplication
  const isMounted = useMountStatus()

  useEffect(() => {
    if (!isMounted) return

    const formComponentNodes = document.querySelectorAll(".formio-component")

    const blockNodes = Array.from(formComponentNodes).filter((node) =>
      Array.from(node.classList).some((className) => getBlockClasses.includes(className))
    )
    const viewportHeight = window.innerHeight // Get the viewport height
    const topValue = -viewportHeight / 2 + 10
    const bottomValue = -viewportHeight / 2 + 10
    const rootMarginValue = `${topValue}px 0px ${bottomValue}px 0px`
    const blockOptions = {
      rootMargin: rootMarginValue,
      threshold: 0.01, // Adjust threshold based on needs
    }

    const blockObserver = new IntersectionObserver(handleBlockIntersection, blockOptions)

    Object.values(blockNodes).forEach((ref) => {
      if (ref) {
        blockObserver.observe(ref)
      }
    })

    return () => {
      blockObserver.disconnect()
    }
  }, [formJson, isMounted, window.innerHeight])

  function handleBlockIntersection(entries: IntersectionObserverEntry[]) {
    const entry = entries.filter((en) => en.isIntersecting)[0]
    if (!entry) return

    const classNameParts = Array.from(entry.target.classList)
      .find((className) => className.includes("formio-component-formSubmissionDataRSTsection"))
      .split("|")
    const blockId = classNameParts[classNameParts.length - 1].slice(-36)
    setSelectedTabIndex(indexOfBlockId(blockId))
  }

  //if there is no permit application provdided, you cannto run the key items like submit OR file upload.
  const onSubmit = (submission: any) => {
    permitApplication.update({ submissionData: submission })
    if (permitApplication) {
      //error on saving should be handled by error pipeline
    } else {
      alert("This is a sample render, you can only submit a real permit applicaiton.")
    }
  }

  if (!permitApplication) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>You are not rendering a Permit Application or Requirement Preview</AlertTitle>
        <AlertDescription>Please have </AlertDescription>
      </Alert>
    )
  }

  return (
    <VStack position="relative" left="378px" right={0} w="calc(100% - 378px)" h={"full"}>
      <HStack spacing={10} w={"full"} h={"full"} alignItems={"flex-start"} pr={8}>
        <Box as={"section"} flex={1} className={"form-wrapper"} scrollMargin={96}>
          <Form
            form={formJson}
            submission={submissionData}
            onSubmit={onSubmit}
            options={permitApplication ? {} : { readOnly: true }}

            //url={}
          />
        </Box>
      </HStack>
    </VStack>
  )
})
