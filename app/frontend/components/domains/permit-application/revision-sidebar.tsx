import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Hide,
  IconButton,
  ListItem,
  OrderedList,
  Portal,
  Spacer,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { CaretRight, ChatDots, PaperPlaneTilt, Plus } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { MutableRefObject, useEffect, useMemo, useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useMountStatus } from "../../../hooks/use-mount-status"
import { IPermitApplication } from "../../../models/permit-application"
import { useMst } from "../../../setup/root"
import { stickyBelowNavBar } from "../../../styles/nav-bar-offset"
import {
  IAdditionalPermitRequestsAttributes,
  IRevisionRequestsAttributes,
  ISupportingInformationRequestsAttributes,
} from "../../../types/api-request"
import { EFlashMessageStatus } from "../../../types/enums"
import {
  IAdditionalPermitRequest,
  IFormIORequirement,
  IRevisionRequest,
  ISubmissionVersion,
  ISupportingInformationRequest,
} from "../../../types/types"
import { getRequirementByKey } from "../../../utils/formio-component-traversal"
import { getSinglePreviousSubmissionData } from "../../../utils/formio-submission-traversal"
import { handleScrollToBottom } from "../../../utils/utility-functions"
import ConfirmationModal from "../../shared/modals/confirmation-modal"
import { ScrollLink } from "../../shared/permit-applications/scroll-link"
import { AdditionalPermitRequestModal } from "../../shared/revisions/additional-permit-request-modal"
import { RevisionModal } from "../../shared/revisions/revision-modal"
import { SupportingInformationModal } from "../../shared/revisions/supporting-information-modal"
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
  supportingInformationRequestsAttributes: ISupportingInformationRequestsAttributes[]
  additionalPermitRequestsAttributes: IAdditionalPermitRequestsAttributes[]
}

export const RevisionSideBar = observer(
  ({ permitApplication, onCancel, sendRevisionContainerRef, forSubmitter }: IRevisionSideBarProps) => {
    const { t } = useTranslation()
    const { uiStore } = useMst()
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

    const getDefaultRevisionRequestValues = (): IRevisionRequestForm => ({
      revisionRequestsAttributes: permitApplication.latestRevisionRequests as IRevisionRequestsAttributes[],
      supportingInformationRequestsAttributes:
        permitApplication.latestSupportingInformationRequests as ISupportingInformationRequestsAttributes[],
      additionalPermitRequestsAttributes:
        permitApplication.latestAdditionalPermitRequests as IAdditionalPermitRequestsAttributes[],
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
    const supportingInfoFieldArrayMethods = useFieldArray({
      control,
      name: "supportingInformationRequestsAttributes",
      keyName: "fieldId",
    })
    const additionalPermitFieldArrayMethods = useFieldArray({
      control,
      name: "additionalPermitRequestsAttributes",
      keyName: "fieldId",
    })
    const { fields: supportingInfoFields } = supportingInfoFieldArrayMethods
    const { fields: additionalPermitFields } = additionalPermitFieldArrayMethods

    useEffect(() => {
      reset(getDefaultRevisionRequestValues())
    }, [
      permitApplication?.latestRevisionRequests?.length,
      permitApplication?.latestSupportingInformationRequests?.length,
      permitApplication?.latestAdditionalPermitRequests?.length,
    ])

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

    const { isOpen, onOpen, onClose } = useDisclosure()
    const {
      isOpen: isDesignatedReviewerModalOpen,
      onOpen: onDesignatedReviewerModalOpen,
      onClose: onDesignatedReviewerModalClose,
    } = useDisclosure()
    const {
      isOpen: isSupportingInfoOpen,
      onOpen: onSupportingInfoOpen,
      onClose: onSupportingInfoClose,
    } = useDisclosure()
    const {
      isOpen: isAdditionalPermitOpen,
      onOpen: onAdditionalPermitOpen,
      onClose: onAdditionalPermitClose,
    } = useDisclosure()
    const [supportingInformationRequest, setSupportingInformationRequest] = useState<ISupportingInformationRequest>()
    const [additionalPermitRequest, setAdditionalPermitRequest] = useState<IAdditionalPermitRequest>()

    const visibleRevisionFields = fields.filter((field) => !field._destroy)
    const visibleSupportingInfoFields = supportingInfoFields.filter((field) => !field._destroy)
    const visibleAdditionalPermitFields = additionalPermitFields.filter((field) => !field._destroy)
    const packageItemCount =
      visibleRevisionFields.length + visibleSupportingInfoFields.length + visibleAdditionalPermitFields.length

    const requestedTemplateIds = visibleAdditionalPermitFields
      .map((field) => field.requirementTemplateId)
      .filter(Boolean) as string[]

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
          <Button rightIcon={<CaretRight />} onClick={handleScrollToBottom} variant="primary">
            {t("permitApplication.edit.submit")}
          </Button>
        )
      }

      const handleSendClick = (onConfirmationModalOpen: () => void) => {
        if (packageItemCount === 0) {
          uiStore.flashMessage.show(EFlashMessageStatus.error, null, t("permitApplication.show.revision.emptySend"))
          return
        }
        if (permitApplication.shouldShowDesignatedReviewerModal) {
          onDesignatedReviewerModalOpen()
        } else {
          onConfirmationModalOpen()
        }
      }

      return (
        <Flex gap={4}>
          <ConfirmationModal
            promptHeader={t("permitApplication.show.revision.confirmHeader")}
            promptMessage={t("permitApplication.show.revision.confirmMessage")}
            renderTrigger={(onConfirmationModalOpen) => (
              <Button
                variant="primary"
                border={0}
                rightIcon={<PaperPlaneTilt />}
                onClick={() => handleSendClick(onConfirmationModalOpen)}
                isDisabled={permitApplication.isRevisionsRequested}
              >
                {t("permitApplication.show.revision.send")}
              </Button>
            )}
            onConfirm={onFinalizeRevisions}
          />
          {onCancel && (
            <Button variant="secondary" onClick={onCancel}>
              {t("permitApplication.show.revision.saveAndExit")}
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
        <Hide below="md">
          <Flex
            as={Tabs}
            direction="column"
            boxShadow="md"
            borderRight="1px solid"
            borderRightColor="border.light"
            width={"sidebar.width"}
            position="sticky"
            {...stickyBelowNavBar(`${topHeight ?? 0}px`)}
            bottom="0"
            height={`calc(100vh - ${topHeight ?? 0}px - var(--app-navbar-offset))`}
            float="left"
            id="permit-revision-sidebar"
            bg="theme.yellowLight"
            index={tabIndex}
            // @ts-ignore
            onChange={(index: number) => handleSetTabIndex(index)}
          >
            <TabList borderBottom="1px solid" borderColor="border.dark" mt={4}>
              <Tab ml={4} _selected={selectedTabStyles}>
                {t("permitApplication.show.revision.newRevision")}
              </Tab>
              <Tab ml={4} _selected={selectedTabStyles}>
                {t("permitApplication.show.revision.pastRequests")}
              </Tab>
            </TabList>
            <TabPanels as={Flex} direction="column" flex={1} overflowY="auto">
              <TabPanel flex={1}>
                {/* SUBMITTER REVISION TODO: package-level reviewer message + attachments, progress n of N,
                    supporting-info / additional-permit rows, status chip on additional-permit items,
                    and “I’ve addressed this” checkboxes. */}
                {forSubmitter ? (
                  <Box flex={1}>
                    <Center p={4} textAlign="center" borderBottom="1px solid" borderColor="border.light">
                      <Text fontStyle="italic">{t("permitApplication.show.locateRevisions")}</Text>
                    </Center>
                    <OrderedList pb={50} mt={4} ml={0}>
                      {visibleRevisionFields.map((field) => (
                        <RevisionRequestListItem revisionRequest={field} key={field.id} />
                      ))}
                    </OrderedList>
                  </Box>
                ) : (
                  <Box flex={1} pb={8}>
                    <RequestSection
                      title={t("permitApplication.show.revision.revisionsSection")}
                      hint={t("permitApplication.show.clickQuestion")}
                    >
                      <OrderedList ml={0}>
                        {visibleRevisionFields.map((field) => (
                          <RevisionRequestListItem revisionRequest={field} key={field.id} />
                        ))}
                      </OrderedList>
                    </RequestSection>
                    <RequestSection
                      title={t("permitApplication.show.revision.supportingInformationSection")}
                      onAdd={
                        permitApplication.isRevisionsRequested
                          ? undefined
                          : () => {
                              setSupportingInformationRequest(undefined)
                              onSupportingInfoOpen()
                            }
                      }
                      emptyText={
                        visibleSupportingInfoFields.length === 0
                          ? t("permitApplication.show.revision.supportingInformationEmpty")
                          : undefined
                      }
                    >
                      <OrderedList ml={0}>
                        {visibleSupportingInfoFields.map((field) => (
                          <GenericRequestListItem
                            key={field.fieldId}
                            title={field.title}
                            comment={field.comment}
                            onView={() => {
                              setSupportingInformationRequest(field as ISupportingInformationRequest)
                              onSupportingInfoOpen()
                            }}
                          />
                        ))}
                      </OrderedList>
                    </RequestSection>
                    <RequestSection
                      title={t("permitApplication.show.revision.permitApplicationSection")}
                      onAdd={
                        permitApplication.isRevisionsRequested
                          ? undefined
                          : () => {
                              setAdditionalPermitRequest(undefined)
                              onAdditionalPermitOpen()
                            }
                      }
                      emptyText={
                        visibleAdditionalPermitFields.length === 0
                          ? t("permitApplication.show.revision.permitApplicationEmpty")
                          : undefined
                      }
                    >
                      <OrderedList ml={0}>
                        {visibleAdditionalPermitFields.map((field) => (
                          <GenericRequestListItem
                            key={field.fieldId}
                            title={field.nameSnapshot}
                            comment={field.comment}
                            onView={() => {
                              setAdditionalPermitRequest(field as IAdditionalPermitRequest)
                              onAdditionalPermitOpen()
                            }}
                          />
                        ))}
                      </OrderedList>
                    </RequestSection>
                  </Box>
                )}
              </TabPanel>
              <TabPanel>
                {/* TODO: Past Requests tab for mixed request types (supporting information, additional permits). */}
                <SubmissionVersionSelect
                  options={permitApplication.pastSubmissionVersionOptions}
                  onChange={handleSelectPastVersionChange}
                  value={selectedSubmissionVersion}
                />
                <OrderedList mt={4} ml={0}>
                  {sortedPastRevisionRequests.map((rr) => (
                    <RevisionRequestListItem revisionRequest={rr} key={rr.id} />
                  ))}
                </OrderedList>
              </TabPanel>
            </TabPanels>
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
                    {packageItemCount}
                  </Text>{" "}
                  <Text as="span" color="text.secondary">
                    {t("ui.selected")}
                  </Text>
                </Box>
                {renderButtons()}
              </Flex>
            )}
          </Flex>
        </Hide>

        {isOpen && (
          <RevisionModal
            isOpen={isOpen}
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
        {isSupportingInfoOpen && (
          <SupportingInformationModal
            isOpen={isSupportingInfoOpen}
            onClose={() => {
              setSupportingInformationRequest(undefined)
              onSupportingInfoClose()
            }}
            supportingInformationRequest={supportingInformationRequest}
            useFieldArrayMethods={supportingInfoFieldArrayMethods}
            onSave={handleSubmit(onSaveRevision)}
            disableInput={forSubmitter || isViewingPastRequests || permitApplication.isRevisionsRequested}
          />
        )}
        {isAdditionalPermitOpen && (
          <AdditionalPermitRequestModal
            isOpen={isAdditionalPermitOpen}
            onClose={() => {
              setAdditionalPermitRequest(undefined)
              onAdditionalPermitClose()
            }}
            permitApplication={permitApplication}
            additionalPermitRequest={additionalPermitRequest}
            requestedTemplateIds={requestedTemplateIds}
            useFieldArrayMethods={additionalPermitFieldArrayMethods}
            onSave={handleSubmit(onSaveRevision)}
            disableInput={forSubmitter || isViewingPastRequests || permitApplication.isRevisionsRequested}
          />
        )}
        <DesignatedReviewerModal
          isOpen={isDesignatedReviewerModalOpen}
          onClose={onDesignatedReviewerModalClose}
          designatedReviewer={permitApplication.designatedReviewer}
        />
        {sendRevisionContainerRef && tabIndex == 0 && (
          <Portal containerRef={sendRevisionContainerRef}>
            <Flex gap={4} align="center">
              <Box>
                <Text as="span" fontWeight="bold">
                  {packageItemCount}
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
    <ListItem mb={4} w="full">
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
        <Text noOfLines={1}>{comment}</Text>
        <Spacer />
        <Button variant="link" onClick={clickHandleView} isDisabled={!requirementKey}>
          {t("ui.view")}
        </Button>
      </Flex>
      {user && (
        <Text fontStyle={"italic"}>
          {t("ui.modifiedBy")}: {user.firstName} {user.lastName}
        </Text>
      )}
    </ListItem>
  )
}

const GenericRequestListItem = ({
  title,
  comment,
  onView,
}: {
  title?: string
  comment?: string
  onView: () => void
}) => {
  const { t } = useTranslation()

  return (
    <ListItem mb={4} w="full">
      <Text fontWeight="medium">{title}</Text>
      {comment && (
        <Flex gap={2} fontStyle="italic" alignItems="center" flexWrap="nowrap" w="full">
          <Box width={6} height={6}>
            <ChatDots size={24} />
          </Box>
          <Text noOfLines={1}>{comment}</Text>
          <Spacer />
          <Button variant="link" onClick={onView}>
            {t("ui.view")}
          </Button>
        </Flex>
      )}
      {!comment && (
        <Flex justify="flex-end">
          <Button variant="link" onClick={onView}>
            {t("ui.view")}
          </Button>
        </Flex>
      )}
    </ListItem>
  )
}

const RequestSection = ({
  title,
  hint,
  onAdd,
  emptyText,
  children,
}: {
  title: string
  hint?: string
  onAdd?: () => void
  emptyText?: string
  children: React.ReactNode
}) => (
  <Box borderBottom="1px solid" borderColor="border.light" pb={4} mb={4}>
    <Flex align="center" px={4} pt={4} pb={2}>
      <Heading as="h3" fontSize="md">
        {title}
      </Heading>
      <Spacer />
      {onAdd && <IconButton aria-label={title} icon={<Plus />} size="sm" variant="ghost" onClick={onAdd} />}
    </Flex>
    {hint && (
      <Text px={4} fontStyle="italic" fontSize="sm" color="text.secondary" mb={2}>
        {hint}
      </Text>
    )}
    {emptyText && (
      <Text px={4} fontSize="sm" color="text.secondary" mb={2}>
        {emptyText}
      </Text>
    )}
    <Box px={4}>{children}</Box>
  </Box>
)
