import { Box, Button, HStack, VStack } from "@chakra-ui/react"
import { ArrowUp } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"

import React, { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useMountStatus } from "../../../hooks/use-mount-status"
import { IPermitApplication } from "../../../models/permit-application"
import { getCompletedSectionsFromForm } from "../../../utils/formio-component-traversal"
import { handleScrollToTop } from "../../../utils/utility-funcitons"
import { Form } from "../chefs"

interface IRequirementFormProps {
  permitApplication?: IPermitApplication
  onFormChange: (submission: any) => void
  onCompletedSectionsChange?: (sections: any) => void
}

export const RequirementForm = observer(
  ({ permitApplication, onFormChange, onCompletedSectionsChange }: IRequirementFormProps) => {
    const { submissionData, setSelectedTabIndex, indexOfBlockId, formJson, blockClasses } = permitApplication
    const isMounted = useMountStatus()
    const { t } = useTranslation()
    const navigate = useNavigate()

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

      const itemWithSectionClassName = Array.from(entry.target.classList).find((className) =>
        className.includes("formio-component-formSubmissionDataRSTsection")
      )

      if (itemWithSectionClassName) {
        const classNameParts = itemWithSectionClassName.split("|")
        const blockId = classNameParts[classNameParts.length - 1].slice(-36)
        setSelectedTabIndex(indexOfBlockId(blockId))
      }
    }

    const onSubmit = async (submission: any) => {
      if (await permitApplication.submit({ submissionData: submission })) {
        navigate("/permit-applications/sucessful-submission")
      }
    }

    const onBlur = (containerComponent) => {
      if (onCompletedSectionsChange) {
        onCompletedSectionsChange(getCompletedSectionsFromForm(containerComponent.root))
      }
    }

    const formReady = (rootComponent) => {
      if (onCompletedSectionsChange) {
        onCompletedSectionsChange(getCompletedSectionsFromForm(rootComponent))
      }
    }

    return (
      <VStack position="relative" left="378px" right={0} w="calc(100% - 378px)" h={"full"}>
        <HStack spacing={10} w={"full"} h={"full"} alignItems={"flex-start"} pr={8}>
          <Box as={"section"} flex={1} className={"form-wrapper"} scrollMargin={96} ref={boxRef}>
            <Form
              form={formJson}
              onChange={onFormChange}
              formReady={formReady}
              submission={submissionData}
              onSubmit={onSubmit}
              options={permitApplication ? {} : { readOnly: true }}
              onBlur={onBlur}
            />
          </Box>
          <VStack position="fixed" top="50%" right={8} w="136px" zIndex={11} gap={4}>
            <Button w="full" onClick={togglePanelCollapse} variant="greyButton">
              {allCollapsed ? t("ui.expandAll") : t("ui.collapseAll")}
            </Button>
            <Button w="full" onClick={handleScrollToTop} leftIcon={<ArrowUp />} variant="greyButton">
              {t("ui.toTop")}
            </Button>
          </VStack>
        </HStack>
      </VStack>
    )
  }
)
