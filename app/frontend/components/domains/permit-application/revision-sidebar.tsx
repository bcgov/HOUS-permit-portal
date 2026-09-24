import {
  Box,
  Button,
  Flex,
  Heading,
  Hide,
  IconButton,
  Link,
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
import { CaretRight, CheckCircle, Plus } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { MutableRefObject, useEffect, useMemo, useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useMountStatus } from "../../../hooks/use-mount-status"
import { IPermitApplication } from "../../../models/permit-application"
import { useMst } from "../../../setup/root"
import { stickyBelowNavBar } from "../../../styles/nav-bar-offset"
import { IRevisionRequestsAttributes } from "../../../types/api-request"
import { EFlashMessageStatus, ERevisionRequestType } from "../../../types/enums"
import { IFormIORequirement, IRevisionRequest, ISubmissionVersion } from "../../../types/types"
import { getRequirementByKey } from "../../../utils/formio-component-traversal"
import { compareSubmissionData } from "../../../utils/formio-helpers"
import { getSinglePreviousSubmissionData } from "../../../utils/formio-submission-traversal"
import { handleScrollToBottom } from "../../../utils/utility-functions"
import { SafeTipTapDisplay } from "../../shared/editor/safe-tiptap-display"
import { ScrollLink } from "../../shared/permit-applications/scroll-link"
import { RevisionModal } from "../../shared/revisions/revision-modal"
import { SupportingInformationModal } from "../../shared/revisions/supporting-information-modal"
import SubmissionVersionSelect from "../../shared/select/selectors/submission-version-select"
import { DesignatedReviewerModal } from "./designated-reviewer-modal"

interface IRevisionSideBarProps {
  permitApplication: IPermitApplication
  onCancel?: () => void
  onReviewSend?: () => void
  sendRevisionContainerRef?: MutableRefObject<HTMLDivElement>
  forSubmitter?: boolean
}

export interface IRevisionRequestForm {
  revisionRequestsAttributes: IRevisionRequestsAttributes[]
  applicantNote?: string
}

export const RevisionSideBar = observer(
  ({ permitApplication, onCancel, onReviewSend, sendRevisionContainerRef, forSubmitter }: IRevisionSideBarProps) => {
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

    const getDefaultRevisionRequestValues = (): IRevisionRequestForm => ({
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

    useEffect(() => {
      if (!isViewingPastRequests) setTabIndex(0)
    }, [isViewingPastRequests])

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
    const [supportingInformationRequest, setSupportingInformationRequest] = useState<IRevisionRequest>()

    const isSupportingDocumentRequest = (field: { type?: string }) =>
      field.type === ERevisionRequestType.SupportingDocumentRevisionRequest
    const visibleRevisionFields = fields.filter((field) => !field._destroy && !isSupportingDocumentRequest(field))
    const visibleSupportingInfoFields = fields.filter((field) => !field._destroy && isSupportingDocumentRequest(field))
    const packageItemCount = visibleRevisionFields.length + visibleSupportingInfoFields.length

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

    const revisionsSent = !forSubmitter && permitApplication.isRevisionsRequested
    const sentButtonProps = revisionsSent
      ? {
          color: "white",
          borderColor: "white",
          bg: "transparent",
          _hover: { bg: "whiteAlpha.200", color: "white" },
          _disabled: {
            color: "white",
            borderColor: "white",
            bg: "transparent",
            opacity: 0.7,
            cursor: "not-allowed",
          },
        }
      : {}

    const renderButtons = (onDark = false) => {
      if (forSubmitter) {
        return (
          <Button rightIcon={<CaretRight />} onClick={handleScrollToBottom} variant="primary">
            {t("permitApplication.edit.submit")}
          </Button>
        )
      }

      const handleSendClick = () => {
        if (packageItemCount === 0) {
          uiStore.flashMessage.show(EFlashMessageStatus.error, null, t("permitApplication.show.revision.emptySend"))
          return
        }
        if (permitApplication.shouldShowDesignatedReviewerModal) {
          onDesignatedReviewerModalOpen()
        } else {
          onReviewSend?.()
        }
      }

      return (
        <Flex gap={4}>
          <Button
            variant={onDark ? "secondary" : "primary"}
            border={onDark ? undefined : 0}
            onClick={handleSendClick}
            isDisabled={permitApplication.isRevisionsRequested}
            {...(onDark ? sentButtonProps : {})}
          >
            <Flex as="span" align="center" gap={2}>
              {t("permitApplication.show.revision.send")}
              <Flex
                as="span"
                align="center"
                justify="center"
                bg="white"
                color="text.primary"
                borderRadius="full"
                minW={6}
                h={6}
                px={1}
                fontSize="sm"
              >
                {packageItemCount}
              </Flex>
            </Flex>
          </Button>
          {onCancel && (
            <Button variant="secondary" onClick={onCancel} {...(onDark ? sentButtonProps : {})}>
              {t("permitApplication.show.revision.saveAndExit")}
            </Button>
          )}
        </Flex>
      )
    }

    const panelBg = revisionsSent ? "semantic.successLight" : "theme.yellowLight"
    const panelBorder = revisionsSent ? "semantic.success" : "border.light"

    const selectedTabStyles = {
      borderLeft: "1px Solid",
      borderRight: "1px Solid",
      borderTop: "4px solid",
      borderColor: "border.dark",
      borderLeftColor: "border.dark",
      borderTopColor: "theme.blueAlt",
      borderBottomColor: panelBg,
      borderRadius: 0,
    }

    const pastRevisionRequests = useMemo(() => {
      return Array.from((selectedSubmissionVersion?.revisionRequests as IRevisionRequest[]) ?? []).sort((a, b) => {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      })
    }, [selectedSubmissionVersion?.revisionRequests])
    const pastFieldRevisions = pastRevisionRequests.filter((request) => !isSupportingDocumentRequest(request))
    const pastSupportingInformation = pastRevisionRequests.filter((request) => isSupportingDocumentRequest(request))

    return (
      <>
        <Hide below="md">
          <Flex
            as={Tabs}
            direction="column"
            boxShadow="md"
            borderRight="1px solid"
            borderRightColor={panelBorder}
            width={"sidebar.revisionWidth"}
            position="sticky"
            {...stickyBelowNavBar(`${topHeight ?? 0}px`)}
            bottom="0"
            height={`calc(100vh - ${topHeight ?? 0}px - var(--app-navbar-offset))`}
            float="left"
            id="permit-revision-sidebar"
            bg={panelBg}
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
                {forSubmitter ? (
                  <SubmitterRequestsPanel
                    permitApplication={permitApplication}
                    onViewSupportingInfo={(item) => {
                      setSupportingInformationRequest(item)
                      onSupportingInfoOpen()
                    }}
                  />
                ) : (
                  <Box flex={1} pb={8}>
                    <RequestSection
                      title={t("permitApplication.show.revision.revisionsSection")}
                      borderColor={panelBorder}
                      hint={t("permitApplication.show.clickQuestion")}
                      emptyText={
                        visibleRevisionFields.length === 0
                          ? t("permitApplication.show.revision.revisionsEmpty")
                          : undefined
                      }
                    >
                      <OrderedList ml={0}>
                        {visibleRevisionFields.map((field) => (
                          <RevisionRequestListItem revisionRequest={field} key={field.id} />
                        ))}
                      </OrderedList>
                    </RequestSection>
                    <RequestSection
                      title={t("permitApplication.show.revision.supportingInformationSection")}
                      borderColor={panelBorder}
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
                              setSupportingInformationRequest(field as IRevisionRequest)
                              onSupportingInfoOpen()
                            }}
                          />
                        ))}
                      </OrderedList>
                    </RequestSection>
                  </Box>
                )}
              </TabPanel>
              <TabPanel>
                {permitApplication.pastSubmissionVersionOptions.length === 0 ? (
                  <Text px={4} fontSize="sm" color="text.secondary">
                    {t("permitApplication.show.revision.pastSubmissionsEmpty")}
                  </Text>
                ) : (
                  <Box flex={1} pb={8}>
                    <Box px={4} pt={4}>
                      <SubmissionVersionSelect
                        options={permitApplication.pastSubmissionVersionOptions}
                        onChange={handleSelectPastVersionChange}
                        value={selectedSubmissionVersion}
                      />
                    </Box>
                    <RequestSection
                      title={t("permitApplication.show.revision.revisionsSection")}
                      borderColor={panelBorder}
                      emptyText={
                        pastFieldRevisions.length === 0
                          ? t("permitApplication.show.revision.revisionsEmpty")
                          : undefined
                      }
                    >
                      <OrderedList ml={0}>
                        {pastFieldRevisions.map((request) => (
                          <RevisionRequestListItem revisionRequest={request} key={request.id} />
                        ))}
                      </OrderedList>
                    </RequestSection>
                    <RequestSection
                      title={t("permitApplication.show.revision.supportingInformationSection")}
                      borderColor={panelBorder}
                      emptyText={
                        pastSupportingInformation.length === 0
                          ? t("permitApplication.show.revision.supportingInformationEmpty")
                          : undefined
                      }
                    >
                      <OrderedList ml={0}>
                        {pastSupportingInformation.map((request) => (
                          <GenericRequestListItem
                            key={request.id}
                            title={request.title}
                            comment={request.comment}
                            onView={() => {
                              setSupportingInformationRequest(request)
                              onSupportingInfoOpen()
                            }}
                          />
                        ))}
                      </OrderedList>
                    </RequestSection>
                  </Box>
                )}
              </TabPanel>
            </TabPanels>
            {inNewRequest && (
              <Flex
                direction="column"
                border="1px solid"
                borderColor="border.light"
                p={8}
                width={"sidebar.revisionWidth"}
                gap={4}
                justify="center"
                position="sticky"
                bottom={0}
                left={0}
                maxH={145}
                bg={panelBg}
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
            useFieldArrayMethods={useFieldArrayMethods}
            onSave={handleSubmit(onSaveRevision)}
            disableInput={forSubmitter || isViewingPastRequests || permitApplication.isRevisionsRequested}
            allowFulfillmentUpload={forSubmitter && !isViewingPastRequests}
            permitApplication={permitApplication}
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
              {renderButtons(revisionsSent)}
            </Flex>
          </Portal>
        )}
      </>
    )
  }
)

const SubmitterRequestsPanel = observer(
  ({
    permitApplication,
    onViewSupportingInfo,
  }: {
    permitApplication: IPermitApplication
    onViewSupportingInfo: (item: IRevisionRequest) => void
  }) => {
    const { t } = useTranslation()
    const revisionRequests = permitApplication.latestFieldRevisionRequests
    const supportingInfoRequests = permitApplication.latestSupportingDocumentRevisionRequests
    const changedFieldKeys = new Set(
      permitApplication.submissionData
        ? compareSubmissionData(
            permitApplication.latestSubmissionVersion?.submissionData,
            permitApplication.submissionData
          )
        : []
    )

    return (
      <Box flex={1} pb={8}>
        <ApplicantNoteBlock note={permitApplication.latestSubmissionVersion?.applicantNote} />
        <RequestSection
          title={t("permitApplication.show.revision.revisionsSection")}
          emptyText={revisionRequests.length === 0 ? t("permitApplication.show.revision.revisionsEmpty") : undefined}
        >
          <OrderedList m={0} p={0} listStyleType="none">
            {revisionRequests.map((field) => (
              <RevisionRequestListItem
                revisionRequest={field}
                key={field.id}
                forSubmitter
                fieldChanged={changedFieldKeys.has(field.requirementJson?.key)}
              />
            ))}
          </OrderedList>
        </RequestSection>
        <RequestSection
          title={t("permitApplication.show.revision.supportingInformationSection")}
          emptyText={
            supportingInfoRequests.length === 0
              ? t("permitApplication.show.revision.supportingInformationEmpty")
              : undefined
          }
        >
          <OrderedList m={0} p={0} listStyleType="none">
            {supportingInfoRequests.map((field) => (
              <GenericRequestListItem
                key={field.id}
                title={field.title}
                comment={field.comment}
                fulfilled={field.supportingDocuments?.length > 0}
                onView={() => onViewSupportingInfo(field)}
              />
            ))}
          </OrderedList>
        </RequestSection>
      </Box>
    )
  }
)

const ApplicantNoteBlock = ({ note }: { note?: string | null }) => {
  const { t } = useTranslation()
  if (!note) return null

  return (
    <Box px={4} pt={4} pb={2} borderBottom="1px solid" borderColor="border.light">
      <Heading as="h3" fontSize="md" mb={2}>
        {t("permitApplication.show.revision.noteToApplicant")}
      </Heading>
      <SafeTipTapDisplay htmlContent={note} fontSize="sm" />
    </Box>
  )
}

interface IRevisionRequestListItemProps {
  revisionRequest: Partial<IRevisionRequest>
  forSubmitter?: boolean
  fieldChanged?: boolean
}

const RevisionRequestListItem = ({ revisionRequest, forSubmitter, fieldChanged }: IRevisionRequestListItemProps) => {
  const { t } = useTranslation()

  const { requirementJson, reasonCode, comment, user } = revisionRequest
  const requirementKey = requirementJson?.key

  const clickHandleView = () => {
    if (!requirementKey) return
    document.dispatchEvent(new CustomEvent("openRequestRevision", { detail: { key: requirementKey } }))
  }

  return (
    <ListItem mb={4} w="full">
      <Flex direction="column" gap={1} align="flex-start">
        <Flex align="center" gap={1}>
          {requirementKey && !forSubmitter ? (
            <ScrollLink to={`formio-component-${requirementKey}`}>{requirementJson?.label}</ScrollLink>
          ) : (
            <Text fontSize="sm" fontWeight="bold" color="text.secondary" lineHeight="shorter">
              {requirementJson?.label || t("permitApplication.show.revision.revisionRequest")}
            </Text>
          )}
          {forSubmitter && fieldChanged && (
            <Box flexShrink={0} lineHeight={0}>
              <CheckCircle
                color="var(--chakra-colors-text-secondary)"
                size={16}
                aria-label={t("permitApplication.show.revision.fieldChanged")}
              />
            </Box>
          )}
        </Flex>
        <Text fontSize="xs" color="text.secondary" lineHeight="shorter">
          {t("permitApplication.show.revision.reasonCode")}: {reasonCode}
        </Text>
        <Text fontSize="xs" color="text.secondary" lineHeight="shorter" noOfLines={1}>
          {comment}
        </Text>
        {user && (
          <Text fontSize="xs" color="text.secondary" lineHeight="shorter">
            {t("ui.modifiedBy")}: {user.firstName} {user.lastName}
          </Text>
        )}
        <Flex gap={1} align="center">
          {forSubmitter && requirementKey && (
            <ScrollLink to={`formio-component-${requirementKey}`} fontSize="xs" lineHeight="shorter">
              {t("permitApplication.show.revision.goToField")}
            </ScrollLink>
          )}
          <Link
            as="button"
            type="button"
            fontSize="xs"
            lineHeight="shorter"
            color="text.link"
            textDecoration="underline"
            onClick={clickHandleView}
            isDisabled={!requirementKey}
          >
            {t("permitApplication.show.revision.viewRequest")}
          </Link>
        </Flex>
      </Flex>
    </ListItem>
  )
}

const GenericRequestListItem = ({
  title,
  comment,
  fulfilled,
  onView,
}: {
  title?: string
  comment?: string
  fulfilled?: boolean
  onView: () => void
}) => {
  const { t } = useTranslation()

  return (
    <ListItem mb={4} w="full">
      <Flex direction="column" gap={1} align="flex-start">
        <Flex align="center" gap={1}>
          <Text fontSize="sm" fontWeight="bold" color="text.secondary" lineHeight="shorter">
            {title}
          </Text>
          {fulfilled && (
            <Box flexShrink={0} lineHeight={0}>
              <CheckCircle
                color="var(--chakra-colors-text-secondary)"
                size={16}
                aria-label={t("permitApplication.show.revision.filesUploaded")}
              />
            </Box>
          )}
        </Flex>
        {comment && (
          <Text fontSize="xs" color="text.secondary" lineHeight="shorter" noOfLines={1}>
            {comment}
          </Text>
        )}
        <Link
          as="button"
          type="button"
          fontSize="xs"
          lineHeight="shorter"
          color="text.link"
          textDecoration="underline"
          onClick={onView}
        >
          {t("permitApplication.show.revision.viewRequest")}
        </Link>
      </Flex>
    </ListItem>
  )
}

const RequestSection = ({
  title,
  hint,
  onAdd,
  emptyText,
  borderColor = "border.light",
  children,
}: {
  title: string
  hint?: string
  onAdd?: () => void
  emptyText?: string
  borderColor?: string
  children: React.ReactNode
}) => (
  <Box borderBottom="1px solid" borderColor={borderColor} pb={4} mb={4}>
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
