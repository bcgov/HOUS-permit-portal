import { Alert, AlertDescription, AlertIcon, AlertTitle, Box, Button, HStack, VStack } from "@chakra-ui/react"
import { ArrowUp } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useMountStatus } from "../../../hooks/use-mount-status"
import { IPermitApplication } from "../../../models/permit-application"
import { Form } from "../chefs"

interface IRequirementFormProps {
  permitApplication?: IPermitApplication
}

export const RequirementForm = observer(({ permitApplication }: IRequirementFormProps) => {
  const { submissionData, setSelectedTabIndex, indexOfBlockId, formJson, blockClasses } = permitApplication
  const isMounted = useMountStatus()
  const { t } = useTranslation()

  const boxRef = useRef<HTMLDivElement>(null)

  const [wrapperClickCount, setWrapperClickCount] = useState(0)

  const [allCollapsed, setAllCollapsed] = useState(false)

  const togglePanelCollapse = () => {
    if (!allCollapsed) {
      document.querySelectorAll(".formio-collapse-icon.fa-minus-square-o").forEach((el: HTMLDivElement) => el.click())
    } else {
      document.querySelectorAll(".formio-collapse-icon.fa-plus-square-o").forEach((el: HTMLDivElement) => el.click())
    }
    setAllCollapsed((cur) => !cur)
  }

  const handleScrollToTop = () => {
    document.getElementById("outerFlex").scrollTo({
      top: 0,
      behavior: "instant",
    })
  }

  useEffect(() => {
    // The box observers need to be re-registered whenever a panel is collapsed
    // This triggers a re-registration whenever the body of the box is clicked
    // Click listender must be registered this way because formIO prevents bubbling

    const box = boxRef.current
    const handleClick = () => {
      setWrapperClickCount((n) => n + 1)
    }
    box?.addEventListener("click", handleClick)
    return () => {
      box?.removeEventListener("click", handleClick)
    }
  }, [])

  useEffect(() => {
    // This useEffect registers the intersection observers for the panels
    // It uses a thin line running across the middle of the screen
    // and detects when this line covers at least a small percentage of the panel

    // Problems with render timing necessitates the use of this isMounted state
    if (!isMounted) return

    const formComponentNodes = document.querySelectorAll(".formio-component")

    const blockNodes = Array.from(formComponentNodes).filter((node) =>
      Array.from(node.classList).some((className) => blockClasses.includes(className))
    )
    const viewportHeight = window.innerHeight // Get the viewport height
    const topValue = -viewportHeight / 2 + 5
    const bottomValue = -viewportHeight / 2 + 5
    const rootMarginValue = `${topValue}px 0px ${bottomValue}px 0px`
    const blockOptions = {
      rootMargin: rootMarginValue,
      threshold: 0.001, // Adjust threshold based on needs
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
  }, [formJson, isMounted, window.innerHeight, wrapperClickCount])

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
        <Box as={"section"} flex={1} className={"form-wrapper"} scrollMargin={96} ref={boxRef}>
          <Form
            form={formJson}
            submission={submissionData}
            onSubmit={onSubmit}
            options={permitApplication ? {} : { readOnly: true }}
          />
        </Box>
        <VStack position="fixed" top="50%" right={8} w="136px" zIndex={11}>
          <Button w="full" onClick={togglePanelCollapse}>
            {allCollapsed ? t("ui.expandAll") : t("ui.collapseAll")}
          </Button>
          <Button w="full" onClick={handleScrollToTop} leftIcon={<ArrowUp />}>
            {t("ui.toTop")}
          </Button>
        </VStack>
      </HStack>
    </VStack>
  )
})
