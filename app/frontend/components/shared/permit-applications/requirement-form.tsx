import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react"
import { ArrowUp } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"

import { format } from "date-fns"
import React, { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useLocation, useNavigate } from "react-router-dom"
import { useMountStatus } from "../../../hooks/use-mount-status"
import { IPermitApplication } from "../../../models/permit-application"
import { IErrorsBoxData } from "../../../types/types"
import { getCompletedBlocksFromForm } from "../../../utils/formio-component-traversal"
import { handleScrollToTop } from "../../../utils/utility-functions"
import { ErrorsBox } from "../../domains/permit-application/errors-box"
import { CustomToast } from "../base/flash-message"
import { Form } from "../chefs"

interface IRequirementFormProps {
  permitApplication?: IPermitApplication
  onCompletedBlocksChange?: (sections: any) => void
  formRef: any
  triggerSave?: () => void
}

export const RequirementForm = observer(
  ({ permitApplication, onCompletedBlocksChange, formRef, triggerSave }: IRequirementFormProps) => {
    const { submissionData, setSelectedTabIndex, indexOfBlockId, formJson, blockClasses, formattedFormJson, isDraft } =
      permitApplication
    const isMounted = useMountStatus()
    const { t } = useTranslation()
    const navigate = useNavigate()
    const location = useLocation()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const boxRef = useRef<HTMLDivElement>(null)

    const [wrapperClickCount, setWrapperClickCount] = useState(0)
    const [errorBoxData, setErrorBoxData] = useState<IErrorsBoxData[]>([]) //an array of Labels and links to the component
    const [allCollapsed, setAllCollapsed] = useState(false)
    const [imminentSubmission, setImminentSubmission] = useState(null)

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

    useEffect(() => {
      const handleOpenStepCode = (_event) => {
        triggerSave?.()
        navigate("step-code", { state: { background: location } })
      }
      document.addEventListener("openStepCode", handleOpenStepCode)
      return () => {
        document.removeEventListener("openStepCode", handleOpenStepCode)
      }
    }, [])

    const togglePanelCollapse = () => {
      if (!allCollapsed) {
        document.querySelectorAll(".formio-collapse-icon.fa-minus-square-o").forEach((el: HTMLDivElement) => el.click())
      } else {
        document.querySelectorAll(".formio-collapse-icon.fa-plus-square-o").forEach((el: HTMLDivElement) => el.click())
      }
      setAllCollapsed((cur) => !cur)
    }

    const mapErrorBoxData = (errors) =>
      errors.map((error) => {
        return { label: error.component.label, id: error.component.id, class: error.component.class }
      })

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

    const onFormSubmit = async (submission: any) => {
      setImminentSubmission(submission)
      onOpen()
    }

    const onModalSubmit = async () => {
      if (await permitApplication.submit({ submissionData: imminentSubmission })) {
        navigate(`/permit-applications/${permitApplication.id}/sucessful-submission`)
      }
    }

    const onBlur = (containerComponent) => {
      if (onCompletedBlocksChange) {
        onCompletedBlocksChange(getCompletedBlocksFromForm(containerComponent.root))
      }
      setErrorBoxData(mapErrorBoxData(containerComponent.root.errors))
    }

    const onInitialized = (event) => {
      if (!formRef.current) return
      if (onCompletedBlocksChange) {
        onCompletedBlocksChange(getCompletedBlocksFromForm(formRef.current))
      }
      setErrorBoxData(mapErrorBoxData(formRef.current.errors))
    }

    const formReady = (rootComponent) => {
      formRef.current = rootComponent
    }

    const scrollToTop = () => {
      handleScrollToTop("outerScrollContainer")
      handleScrollToTop("permitApplicationFieldsContainer")
    }

    return (
      <>
        <Flex
          direction="column"
          as={"section"}
          flex={1}
          className={"form-wrapper"}
          scrollMargin={96}
          mb={20}
          gap={8}
          ref={boxRef}
        >
          <ErrorsBox errorBox={errorBoxData} />
          {permitApplication?.isSubmitted && (
            <CustomToast
              description={t("permitApplication.show.wasSubmitted", {
                date: format(permitApplication.submittedAt, "MMM d, yyyy h:mm a"),
              })}
              status="info"
            />
          )}
          <Box bg="greys.grey03" p={3} borderRadius="sm">
            <Text fontStyle="italic">
              {t("site.foippaWarning")}
              <Link href={"mailto:" + t("site.contactEmail")} isExternal>
                {t("site.contactEmail")}
              </Link>
            </Text>
          </Box>
          <Form
            form={formattedFormJson}
            formReady={formReady}
            submission={submissionData}
            onSubmit={onFormSubmit}
            options={isDraft ? {} : { readOnly: true }}
            onBlur={onBlur}
            onInitialized={onInitialized}
          />
        </Flex>
        <VStack align="end" position="sticky" bottom={24} left={"100%"} zIndex={11} gap={4} w="fit-content">
          <Button w="136px" onClick={togglePanelCollapse} variant="greyButton">
            {allCollapsed ? t("ui.expandAll") : t("ui.collapseAll")}
          </Button>
          <Button w="136px" onClick={scrollToTop} leftIcon={<ArrowUp />} variant="greyButton">
            {t("ui.toTop")}
          </Button>
        </VStack>
        {isOpen && (
          <Modal onClose={onClose} isOpen={isOpen} size="2xl">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>
                <ModalCloseButton fontSize="11px" />
              </ModalHeader>
              <ModalBody py={6}>
                <Flex direction="column" gap={8}>
                  <Heading as="h3">{t("permitApplication.new.ready")}</Heading>
                  <Box
                    borderRadius="md"
                    border="1px solid"
                    borderColor="semantic.warning"
                    backgroundColor="semantic.warningLight"
                    px={6}
                    py={3}
                  >
                    <Heading as="h3" fontSize="lg">
                      {t("permitApplication.new.bySubmitting")}
                    </Heading>
                    <Text>{t("permitApplication.new.confirmation")}</Text>
                  </Box>
                  <Flex justify="center" gap={6}>
                    <Button onClick={onModalSubmit} variant="primary">
                      {t("ui.submit")}
                    </Button>
                    <Button onClick={onClose} variant="secondary">
                      {t("ui.neverMind")}
                    </Button>
                  </Flex>
                </Flex>
              </ModalBody>
            </ModalContent>
          </Modal>
        )}
      </>
    )
  }
)
