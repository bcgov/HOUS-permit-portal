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
  useDisclosure,
} from "@chakra-ui/react"
import { observer } from "mobx-react-lite"

import { format } from "date-fns"
import * as R from "ramda"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useLocation, useNavigate } from "react-router-dom"
import { useMountStatus } from "../../../hooks/use-mount-status"
import { IPermitApplication } from "../../../models/permit-application"
import { IErrorsBoxData } from "../../../types/types"
import { getCompletedBlocksFromForm } from "../../../utils/formio-component-traversal"
import { ErrorsBox } from "../../domains/permit-application/errors-box"
import { BuilderBottomFloatingButtons } from "../../domains/requirement-template/builder-bottom-floating-buttons"
import { CustomMessageBox } from "../base/custom-message-box"
import { Form, defaultOptions } from "../chefs"
import { ContactModal } from "../contact/contact-modal"

interface IRequirementFormProps {
  permitApplication?: IPermitApplication
  onCompletedBlocksChange?: (sections: any) => void
  formRef: any
  triggerSave?: (params?: { autosave?: boolean; skipPristineCheck?: boolean }) => void
  showHelpButton?: boolean
}

export const RequirementForm = observer(
  ({
    permitApplication,
    onCompletedBlocksChange,
    formRef,
    triggerSave,
    showHelpButton = true,
  }: IRequirementFormProps) => {
    const {
      jurisdiction,
      submissionData,
      setSelectedTabIndex,
      indexOfBlockId,
      formJson,
      blockClasses,
      formattedFormJson,
      isDraft,
      setIsDirty,
    } = permitApplication
    const isMounted = useMountStatus()
    const { t } = useTranslation()
    const navigate = useNavigate()
    const location = useLocation()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const boxRef = useRef<HTMLDivElement>(null)

    const [wrapperClickCount, setWrapperClickCount] = useState(0)
    const [errorBoxData, setErrorBoxData] = useState<IErrorsBoxData[]>([]) // an array of Labels and links to the component
    const [imminentSubmission, setImminentSubmission] = useState(null)
    const [floatErrorBox, setFloatErrorBox] = useState(false)
    const [hasErrors, setHasErrors] = useState(false)
    const [autofillContactKey, setAutofillContactKey] = useState(null)
    const [firstComponentKey, setFirstComponentKey] = useState(null)
    const [isCollapsedAll, setIsCollapsedAllState] = useState(false)

    const clonedSubmissionData = useMemo(() => R.clone(submissionData), [submissionData])

    const { isOpen: isContactsOpen, onOpen: onContactsOpen, onClose: onContactsClose } = useDisclosure()

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
      if (hasErrors) {
        window.addEventListener("scroll", onScroll)
      } else {
        window.removeEventListener("scroll", onScroll)
      }
      return () => {
        window.removeEventListener("scroll", onScroll)
      }
    }, [hasErrors])

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
        threshold: 0.0001, // Adjust threshold based on needs
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
      const handleOpenStepCode = async (_event) => {
        await triggerSave?.()
        navigate("step-code", { state: { background: location } })
      }
      document.addEventListener("openStepCode", handleOpenStepCode)
      return () => {
        document.removeEventListener("openStepCode", handleOpenStepCode)
      }
    }, [])

    useEffect(() => {
      const handleOpenContactAutofill = async (_event) => {
        setAutofillContactKey(_event.detail.key)
        onContactsOpen()
      }
      document.addEventListener("openAutofillContact", handleOpenContactAutofill)
      return () => {
        document.removeEventListener("openAutofillContact", handleOpenContactAutofill)
      }
    }, [])

    const setIsCollapsedAll = (isCollapsedAll: boolean) => {
      if (isCollapsedAll) {
        document.querySelectorAll(".formio-collapse-icon.fa-minus-square-o").forEach((el: HTMLDivElement) => el.click())
      } else {
        document.querySelectorAll(".formio-collapse-icon.fa-plus-square-o").forEach((el: HTMLDivElement) => el.click())
      }
      setIsCollapsedAllState(isCollapsedAll)
    }

    const mapErrorBoxData = (errors) =>
      errors.map((error) => {
        return { label: error.component.label, id: error.component.id, class: error.component.class }
      })

    function handleBlockIntersection(entries: IntersectionObserverEntry[]) {
      const entry = entries.filter((en) => en.isIntersecting)[0]
      if (!entry) return

      const itemWithSectionClassName = Array.from(entry.target.classList).find(
        (className) =>
          className.includes("formio-component-formSubmissionDataRSTsection") ||
          className.includes("formio-component-section-signoff-key")
      )

      if (itemWithSectionClassName) {
        const classNameParts = itemWithSectionClassName.split("|")
        const blockId = classNameParts[classNameParts.length - 1].slice(-36)
        setSelectedTabIndex(indexOfBlockId(blockId))
      }
    }

    const onFormSubmit = async (submission: any) => {
      setHasErrors(null)
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
    }
    const onScroll = (event) => {
      setFloatErrorBox(hasErrors && isFirstComponentNearTopOfView(firstComponentKey))
    }

    const onChange = (changedEvent) => {
      //in the case of a multi select box, there is a change but no onblur bubbled up
      if (changedEvent?.changed?.component?.type == "selectboxes") {
        if (onCompletedBlocksChange) {
          onCompletedBlocksChange(getCompletedBlocksFromForm(changedEvent?.changed?.instance?.root))
        }
        setErrorBoxData(mapErrorBoxData(changedEvent?.changed?.instance?.root?.errors))
      }
      if (changedEvent?.changed?.component?.type == "simplefile") {
        //https://github.com/formio/formio.js/blob/4.19.x/src/components/file/File.unit.js
        // formio `pristine` is not set for file upldates
        // using `setPristine(false)` causes the entire form to validate so instead, we use a separate dirty state
        // trigger save to rerun compliance and save file
        triggerSave?.({ autosave: true, skipPristineCheck: true })
      }
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

      rootComponent.on("componentError", (error) => {
        // when a form field has an error, we update the state of ErrorBox with the new error information
        setErrorBoxData(mapErrorBoxData(formRef.current.errors))
      })

      rootComponent.on("submitError", (error) => {
        // when the form attempts to submit but has validation errors, we set a flag to show ErrorBox
        setHasErrors(true)
        setErrorBoxData(mapErrorBoxData(formRef.current.errors))
      })

      const firstComponent = rootComponent.form.components[0]
      setFirstComponentKey(firstComponent.key)
    }

    let permitAppOptions = {
      ...defaultOptions,
      ...(isDraft ? {} : { readOnly: true }),
    }
    permitAppOptions.componentOptions.simplefile.config["formCustomOptions"] = {
      persistFileUploadAction: "PATCH",
      persistFileUploadUrl: `/api/permit_applications/${permitApplication.id}/upload_supporting_document`,
    }

    return (
      <>
        <Flex
          direction="column"
          as={"section"}
          flex={1}
          className={`form-wrapper ${floatErrorBox ? "float-on" : "float-off"}`}
          mb="40vh"
          mx="auto"
          pl={{ lg: "8" }}
          pr={{ base: "0", xl: "var(--app-permit-form-right-white-space)" }}
          width="full"
          maxWidth="container.lg"
          gap={8}
          ref={boxRef}
          id="requirement-form-wrapper"
          sx={{
            "[id^='error-list-'].alert.alert-danger > p::before": {
              content: `"${t("requirementTemplate.edit.errorsBox.title", { count: errorBoxData.length })}"`,
            },
          }}
        >
          <ErrorsBox errorBox={errorBoxData} />

          {permitApplication?.isSubmitted ? (
            <CustomMessageBox
              description={t("permitApplication.show.wasSubmitted", {
                date: format(permitApplication.submittedAt, "MMM d, yyyy h:mm a"),
                jurisdictionName: jurisdiction.qualifiedName,
              })}
              status="info"
            />
          ) : (
            <CustomMessageBox
              description={t("permitApplication.show.submittingTo", { jurisdictionName: jurisdiction.qualifiedName })}
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
            /* Needs cloned submissionData otherwise it's not possible to use data grid as mst props can't be
                                                                                                                                                                                                                         mutated*/
            submission={clonedSubmissionData}
            onSubmit={onFormSubmit}
            options={permitAppOptions}
            onBlur={onBlur}
            onChange={onChange}
            onInitialized={onInitialized}
          />
        </Flex>

        <BuilderBottomFloatingButtons isCollapsedAll={isCollapsedAll} setIsCollapsedAll={setIsCollapsedAll} />
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
        {isContactsOpen && (
          <ContactModal
            isOpen={isContactsOpen}
            onOpen={onContactsOpen}
            onClose={onContactsClose}
            autofillContactKey={autofillContactKey}
            permitApplication={permitApplication}
            submissionState={clonedSubmissionData}
          />
        )}
      </>
    )
  }
)

function isFirstComponentNearTopOfView(firstComponentKey) {
  const firstComponentElement = document.querySelector(`.formio-component-${firstComponentKey}`)
  if (firstComponentElement) {
    const firstComponentElTopY = firstComponentElement.getBoundingClientRect().y
    const buffer = 400 // this buffer is to account for the transition-delay of displaying ErrorBox
    return firstComponentElTopY < buffer
  } else {
    return false
  }
}
