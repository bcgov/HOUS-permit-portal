import { Box, Button, Center, Flex, List, Portal, Spacer, Tabs, Text, useDisclosure } from "@chakra-ui/react"
import { CaretRight, ChatDots, PaperPlaneTilt } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { MutableRefObject, useEffect, useMemo, useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useMountStatus } from "../../../hooks/use-mount-status"
import { IPermitApplication } from "../../../models/permit-application"
import { IRevisionRequestsAttributes } from "../../../types/api-request"
import { IFormIORequirement, IRevisionRequest, ISubmissionVersion } from "../../../types/types"
import { getRequirementByKey } from "../../../utils/formio-component-traversal"
import { getSinglePreviousSubmissionData } from "../../../utils/formio-submission-traversal"
import { handleScrollToBottom } from "../../../utils/utility-functions"
import ConfirmationModal from "../../shared/modals/confirmation-modal"
import { ScrollLink } from "../../shared/permit-applications/scroll-link"
import { RevisionModal } from "../../shared/revisions/revision-modal"
import SubmissionVersionSelect from "../../shared/select/selectors/submission-version-select"
import { DesignatedReviewerModal } from "./designated-reviewer-modal"

interface IRevisionSideBarProps {
  permitApplication: IPermitApplication
  onCancel?: () => void
  sendRevisionContainerRef?: MutableRefObject<HTMLDivElement>
  forSubmitter?: boolean
}

export interface IRevisionRequestForm {
  revisionRequestsAttributes: IRevisionRequestsAttributes[]
}

export const RevisionSideBar = observer(
  ({ permitApplication, onCancel, sendRevisionContainerRef, forSubmitter }: IRevisionSideBarProps) => {
    const { t } = useTranslation()
    const isMounted = useMountStatus()
    const [requirementForRevision, setRequirementForRevision] = useState<IFormIORequirement>()
    const [submissionDataForRevision, setSubmissionDataForRevision] = useState<any>()
    const [revisionRequest, setRevisionRequest] = useState<IRevisionRequest>()
    const [revisionRequestDefault, setRevisionRequestDefault] = useState<IRevisionRequest>()
    const {
      selectedSubmissionVersion,
      setSelectedSubmissionVersion,
      latestSubmissionVersion,
      pastSubmissionVersionOptions,
      isViewingPastRequests,
      setIsViewingPastRequests,
    } = permitApplication

    const [tabIndex, setTabIndex] = useState(0)
    const handleSetTabIndex = (index: number) => {
      setTabIndex(index)
      setIsViewingPastRequests(index === 1)
      if (index === 0) {
        setSelectedSubmissionVersion(latestSubmissionVersion)
      } else if (index === 1) {
        setSelectedSubmissionVersion(pastSubmissionVersionOptions?.[0]?.value ?? null)
      }
    }

    const inNewRequest = tabIndex === 0
    const navigate = useNavigate()

    const getDefaultRevisionRequestValues = () => ({
      revisionRequestsAttributes: permitApplication.latestRevisionRequests as IRevisionRequestsAttributes[],
    })

    const revisionFormMethods = useForm<IRevisionRequestForm>({
      defaultValues: getDefaultRevisionRequestValues(),
    })

    const { handleSubmit, control, reset } = revisionFormMethods

    const useFieldArrayMethods = useFieldArray({
      control,
      name: "revisionRequestsAttributes",
      keyName: "fieldId",
    })

    const { fields } = useFieldArrayMethods

    useEffect(() => {
      reset(getDefaultRevisionRequestValues())
    }, [permitApplication?.latestRevisionRequests?.length])

    useEffect(() => {
      setSelectedSubmissionVersion(latestSubmissionVersion)
    }, [latestSubmissionVersion, setSelectedSubmissionVersion])

    const onSaveRevision = (formData: IRevisionRequestForm) => {
      setTabIndex(0)
      permitApplication.updateRevisionRequests(formData)
    }

    const [topHeight, setTopHeight] = useState<number>()

    useEffect(() => {
      const updateTopHeight = () => {
        const permitHeaderHeight = document.getElementById("permitHeader")?.offsetHeight
        setTopHeight(permitHeaderHeight)
      }

      // Call the function to set the initial value
      updateTopHeight()

      // Add event listener for window resize
      window.addEventListener("resize", updateTopHeight)

      // Clean up the event listener on component unmount
      return () => {
        window.removeEventListener("resize", updateTopHeight)
      }
    }, [isMounted])

    const { open, onOpen, onClose } = useDisclosure()
    const {
      open: isDesignatedReviewerModalOpen,
      onOpen: onDesignatedReviewerModalOpen,
      onClose: onDesignatedReviewerModalClose,
    } = useDisclosure()

    const onFinalizeRevisions = async () => {
      const ok = await permitApplication.finalizeRevisionRequests()
      if (ok) navigate(`/jurisdictions/${permitApplication.jurisdiction.slug}/submission-inbox`)
    }

    const handleOpenRequestRevision = async (event, upToDateFields) => {
      if (!permitApplication.formJson) return

      const finder = (rr) => rr.requirementJson?.key === event.detail.key
      const foundRevisionRequestDefault =
        isViewingPastRequests && selectedSubmissionVersion?.revisionRequests?.find(finder)
      const foundRevisionRequest = upToDateFields.find(finder)
      const foundRequirement = getRequirementByKey(permitApplication.formJson, event.detail.key)
      const foundSubmissionData = getSinglePreviousSubmissionData(permitApplication.submissionData, event.detail.key)

      setRevisionRequest(foundRevisionRequest)
      setRevisionRequestDefault(foundRevisionRequestDefault)
      setRequirementForRevision(foundRequirement)
      setSubmissionDataForRevision(foundSubmissionData)
      onOpen()
    }

    useEffect(() => {
      const handleOpenEvent = (event) => handleOpenRequestRevision(event, fields)
      // Listener needs to be re-registered every time the tab index changes
      document.addEventListener("openRequestRevision", handleOpenEvent)
      return () => {
        document.removeEventListener("openRequestRevision", handleOpenEvent)
      }
    }, [fields, tabIndex, selectedSubmissionVersion?.id])

    const handleSelectPastVersionChange = (pastVersion: ISubmissionVersion | null) => {
      if (pastVersion) {
        setSelectedSubmissionVersion(pastVersion)
      }
    }

    const renderButtons = () => {
      if (forSubmitter) {
        return (
          <Button onClick={handleScrollToBottom} variant="primary">
            {t("permitApplication.edit.submit")}
            <CaretRight />
          </Button>
        )
      }

      return (
        <Flex gap={4}>
          <ConfirmationModal
            promptHeader={t("permitApplication.show.revision.confirmHeader")}
            promptMessage={t("permitApplication.show.revision.confirmMessage")}
            renderTrigger={(onConfirmationModalOpen) => {
              const showDesignatedReviewerModal = permitApplication.shouldShowDesignatedReviewerModal
              const handleClick = () => {
                if (showDesignatedReviewerModal) {
                  onDesignatedReviewerModalOpen()
                } else {
                  onConfirmationModalOpen()
                }
              }
              return (
                <Button
                  variant="primary"
                  border={0}
                  onClick={handleClick}
                  disabled={permitApplication.isRevisionsRequested || fields?.length == 0}
                >
                  {t("permitApplication.show.revision.send")}
                  <PaperPlaneTilt />
                </Button>
              )
            }}
            onConfirm={onFinalizeRevisions}
          />
          {onCancel && (
            <Button variant="secondary" onClick={onCancel}>
              {t("ui.close")}
            </Button>
          )}
        </Flex>
      )
    }

    const selectedTabStyles = {
      borderLeft: "1px Solid",
      borderRight: "1px Solid",
      borderTop: "4px solid",
      borderColor: "border.dark",
      borderLeftColor: "border.dark",
      borderTopColor: "theme.blueAlt",
      borderBottomColor: "theme.yellowLight",
      borderRadius: 0,
    }

    const sortedPastRevisionRequests = useMemo(() => {
      return Array.from((selectedSubmissionVersion?.revisionRequests as IRevisionRequest[]) ?? []).sort((a, b) => {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      })
    }, [selectedSubmissionVersion?.revisionRequests])

    return (
      <>
        <Box hideBelow="md">
          <Flex
            direction="column"
            boxShadow="md"
            borderRight="1px solid"
            borderRightColor="border.light"
            width={"sidebar.width"}
            position="sticky"
            top={topHeight}
            bottom="0"
            height={`calc(100vh - ${topHeight}px)`}
            float="left"
            id="permit-revision-sidebar"
            bg="theme.yellowLight"
          >
            <Tabs.Root value={String(tabIndex)} onValueChange={({ value }) => handleSetTabIndex(Number(value))}>
              <Tabs.List borderBottom="1px solid" borderColor="border.dark" mt={4}>
                <Tabs.Trigger value="0" ml={4} _selected={selectedTabStyles}>
                  {t("permitApplication.show.revision.newRevision")}
                </Tabs.Trigger>
                <Tabs.Trigger value="1" ml={4} _selected={selectedTabStyles}>
                  {t("permitApplication.show.revision.pastRequests")}
                </Tabs.Trigger>
              </Tabs.List>
              <Tabs.ContentGroup direction="column" flex={1} overflowY="auto" asChild>
                <Flex>
                  <Tabs.Content value="0" flex={1}>
                    <Box flex={1}>
                      <Center p={4} textAlign="center" borderBottom="1px solid" borderColor="border.light">
                        <Text fontStyle="italic">
                          {forSubmitter
                            ? t("permitApplication.show.locateRevisions")
                            : t("permitApplication.show.clickQuestion")}
                        </Text>
                      </Center>
                      <List.Root as="ol" pb={50} mt={4} ml={0}>
                        {fields
                          .filter((field) => !field._destroy)
                          .map((field) => {
                            return <RevisionRequestListItem revisionRequest={field} key={field.id} />
                          })}
                      </List.Root>
                    </Box>
                  </Tabs.Content>
                  <Tabs.Content value="1">
                    <SubmissionVersionSelect
                      options={permitApplication.pastSubmissionVersionOptions}
                      onChange={handleSelectPastVersionChange}
                      value={selectedSubmissionVersion}
                    />
                    <List.Root as="ol" mt={4} ml={0}>
                      {sortedPastRevisionRequests.map((rr) => (
                        <RevisionRequestListItem revisionRequest={rr} key={rr.id} />
                      ))}
                    </List.Root>
                  </Tabs.Content>
                </Flex>
              </Tabs.ContentGroup>
              {inNewRequest && (
                <Flex
                  direction="column"
                  border="1px solid"
                  borderColor="border.light"
                  p={8}
                  width={"sidebar.width"}
                  gap={4}
                  justify="center"
                  position="sticky"
                  bottom={0}
                  left={0}
                  maxH={145}
                  bg="theme.yellowLight"
                  flex={1}
                >
                  <Box>
                    <Text as="span" fontWeight="bold">
                      {fields.length}
                    </Text>{" "}
                    <Text as="span" color="text.secondary">
                      {t("ui.selected")}
                    </Text>
                  </Box>
                  {renderButtons()}
                </Flex>
              )}
            </Tabs.Root>
          </Flex>
        </Box>
        {open && (
          <RevisionModal
            open={open}
            onOpen={onOpen}
            onClose={onClose}
            requirementJson={requirementForRevision}
            submissionData={submissionDataForRevision}
            useFieldArrayMethods={useFieldArrayMethods}
            revisionRequest={revisionRequest}
            revisionRequestDefault={revisionRequestDefault}
            onSave={handleSubmit(onSaveRevision)}
            isRevisionsRequested={permitApplication.isRevisionsRequested}
            disableInput={forSubmitter || isViewingPastRequests}
          />
        )}
        <DesignatedReviewerModal
          open={isDesignatedReviewerModalOpen}
          onClose={onDesignatedReviewerModalClose}
          designatedReviewer={permitApplication.designatedReviewer}
        />
        {sendRevisionContainerRef && tabIndex == 0 && (
          <Portal containerRef={sendRevisionContainerRef}>
            <Flex gap={4} align="center">
              <Box>
                <Text as="span" fontWeight="bold">
                  {fields.length}
                </Text>{" "}
                <Text as="span" color="text.secondary">
                  {t("ui.selected")}
                </Text>
              </Box>
              {renderButtons()}
            </Flex>
          </Portal>
        )}
      </>
    )
  }
)

interface IRevisionRequestListItemProps {
  revisionRequest: Partial<IRevisionRequest>
}

const RevisionRequestListItem = ({ revisionRequest }: IRevisionRequestListItemProps) => {
  const { t } = useTranslation()

  const { requirementJson, reasonCode, comment, user } = revisionRequest
  const requirementKey = requirementJson?.key

  const clickHandleView = () => {
    if (!requirementKey) return
    document.dispatchEvent(new CustomEvent("openRequestRevision", { detail: { key: requirementKey } }))
  }

  return (
    <List.Item mb={4} w="full">
      {requirementKey ? (
        <ScrollLink to={`formio-component-${requirementKey}`}>{requirementJson?.label}</ScrollLink>
      ) : (
        <Text fontWeight="medium">{t("permitApplication.show.revision.revisionRequest")}</Text>
      )}
      <Flex fontStyle="italic">
        {t("permitApplication.show.revision.reasonCode")}: {reasonCode}
      </Flex>
      <Flex gap={2} fontStyle="italic" alignItems="center" flexWrap="nowrap" w="full">
        <Box width={6} height={6}>
          <ChatDots size={24} />
        </Box>
        <Text lineClamp={1}>{comment}</Text>
        <Spacer />
        <Button variant="plain" onClick={clickHandleView} disabled={!requirementKey}>
          {t("ui.view")}
        </Button>
      </Flex>
      {user && (
        <Text fontStyle={"italic"}>
          {t("ui.modifiedBy")}: {user.firstName} {user.lastName}
        </Text>
      )}
    </List.Item>
  )
}
