import { Alert, AlertDescription, AlertIcon, AlertTitle, Box, HStack, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useMountStatus } from "../../../hooks/use-mount-status"
import { IPermitApplication } from "../../../models/permit-application"
import { Form } from "../chefs"

interface IRequirementFormProps {
  permitApplication?: IPermitApplication
  emitCurrentSectionId: (sectionId: string) => void
}

export const RequirementForm = observer(({ permitApplication, emitCurrentSectionId }: IRequirementFormProps) => {
  const { submissionData, setSelectedTabIndex, indexOfBlockId, formJson, blockClasses } = permitApplication
  const [sectionsInViewStatuses, setSectionsInViewStatuses] = useState<Record<string, boolean>>({})
  const isMounted = useMountStatus()

  useEffect(() => {
    if (!isMounted) return

    const formComponentNodes = document.querySelectorAll(".formio-component")
    const sectionNodes = Array.from(formComponentNodes).filter((node) =>
      Array.from(node.classList).find((className) => className.includes("formio-component-section"))
    )

    const blockNodes = Array.from(formComponentNodes).filter((node) =>
      Array.from(node.classList).some((className) => blockClasses.includes(className))
    )

    const sectionOptions = {
      rootMargin: "0px",
      threshold: 1,
    }

    const viewportHeight = window.innerHeight // Get the viewport height
    const topValue = -viewportHeight / 2 + 10
    const bottomValue = -viewportHeight / 2 + 10
    const rootMarginValue = `${topValue}px 0px ${bottomValue}px 0px`
    const blockOptions = {
      rootMargin: rootMarginValue,
      threshold: 0.05, // Adjust threshold based on needs
    }

    const sectionObserver = new IntersectionObserver(handleSectionIntersection, sectionOptions)
    const blockObserver = new IntersectionObserver(handleBlockIntersection, blockOptions)

    Object.values(sectionNodes).forEach((ref) => {
      if (ref) {
        sectionObserver.observe(ref)
      }
    })

    Object.values(blockNodes).forEach((ref) => {
      if (ref) {
        blockObserver.observe(ref)
      }
    })

    return () => {
      sectionObserver.disconnect()
    }
  }, [formJson, isMounted, window.innerHeight])

  const currentSectionId = (() => {
    const orderedInViewSections = (formJson?.components ?? []).filter((section) => sectionsInViewStatuses[section.id])

    return orderedInViewSections?.[0]?.id ?? formJson?.components[0].id
  })()

  useEffect(() => {
    emitCurrentSectionId(currentSectionId)
  }, [currentSectionId])

  function handleSectionIntersection(entries: IntersectionObserverEntry[]) {
    setSectionsInViewStatuses((pastState) => {
      const newState = { ...pastState }

      entries.forEach((entry) => {
        const sectionIdClass = Array.from(entry.target.classList).find((className) =>
          className.includes("formio-component-section")
        )
        const sectionId = sectionIdClass?.replace("formio-component-section", "")

        if (entry.isIntersecting) {
          newState[sectionId] = true
        } else {
          newState[sectionId] = false
        }
      })

      return newState
    })
  }

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
