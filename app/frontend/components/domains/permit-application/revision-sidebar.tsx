import {
  Box,
  Button,
  Center,
  Flex,
  Hide,
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
import { getSinglePreviousSubmissionJson } from "../../../utils/formio-submission-traversal"
import { handleScrollToBottom } from "../../../utils/utility-functions"
import ConfirmationModal from "../../shared/modals/confirmation-modal"
import { ScrollLink } from "../../shared/permit-applications/scroll-link"
import { RevisionModal } from "../../shared/revisions/revision-modal"
import SubmissionVersionSelect from "../../shared/select/selectors/submission-version-select"

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
    const [submissionJsonForRevision, setSubmissionJsonForRevision] = useState<any>()
    const [revisionRequest, setRevisionRequest] = useState<IRevisionRequest>()
    const [revisionRequestDefault, setRevisionRequestDefault] = useState<IRevisionRequest>()
    const {
      selectedPastSubmissionVersion,
      setSelectedPastSubmissionVersion,
      isViewingPastRequests,
      setIsViewingPastRequests,
    } = permitApplication

    const [tabIndex, setTabIndex] = useState(0)
    const handleSetTabIndex = (index: number) => {
      setTabIndex(index)
      setIsViewingPastRequests(index === 1)
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

    const onFinalizeRevisions = async () => {
      const ok = await permitApplication.finalizeRevisionRequests()
      if (ok) navigate(`/jurisdictions/${permitApplication.jurisdiction.slug}/submission-inbox`)
    }

    const handleOpenRequestRevision = async (event, upToDateFields) => {
      if (!permitApplication.formJson) return

      const finder = (rr) => rr.requirementJson?.key === event.detail.key
      const foundRevisionRequestDefault =
        isViewingPastRequests && selectedPastSubmissionVersion?.revisionRequests?.find(finder)
      const foundRevisionRequest = upToDateFields.find(finder)
      const foundRequirement = getRequirementByKey(permitApplication.formJson, event.detail.key)
      const foundSubmissionJson = getSinglePreviousSubmissionJson(permitApplication.submissionData, event.detail.key)

      setRevisionRequest(foundRevisionRequest)
      setRevisionRequestDefault(foundRevisionRequestDefault)
      setRequirementForRevision(foundRequirement)
      setSubmissionJsonForRevision(foundSubmissionJson)
      onOpen()
    }

    useEffect(() => {
      const handleOpenEvent = (event) => handleOpenRequestRevision(event, fields)
      // Listener needs to be re-registered every time the tab index changes
      document.addEventListener("openRequestRevision", handleOpenEvent)
      return () => {
        document.removeEventListener("openRequestRevision", handleOpenEvent)
      }
    }, [fields, tabIndex, selectedPastSubmissionVersion?.id])

    const handleSelectPastVersionChange = (pastVersion: ISubmissionVersion | null) => {
      if (pastVersion) {
        setSelectedPastSubmissionVersion(pastVersion)
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

      return (
        <Flex gap={4}>
          <ConfirmationModal
            promptHeader={t("permitApplication.show.revision.confirmHeader")}
            promptMessage={t("permitApplication.show.revision.confirmMessage")}
            renderTrigger={(onOpen) => (
              <Button
                variant="primary"
                border={0}
                rightIcon={<PaperPlaneTilt />}
                onClick={onOpen}
                isDisabled={permitApplication.isRevisionsRequested || fields?.length == 0}
              >
                {t("permitApplication.show.revision.send")}
              </Button>
            )}
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
      return Array.from((selectedPastSubmissionVersion?.revisionRequests as IRevisionRequest[]) ?? []).sort((a, b) => {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      })
    }, [selectedPastSubmissionVersion?.revisionRequests])

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
            top={topHeight}
            bottom="0"
            height={`calc(100vh - ${topHeight}px)`}
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
                <Box flex={1}>
                  <Center p={4} textAlign="center" borderBottom="1px solid" borderColor="border.light">
                    <Text fontStyle="italic">
                      {forSubmitter
                        ? t("permitApplication.show.locateRevisions")
                        : t("permitApplication.show.clickQuestion")}
                    </Text>
                  </Center>
                  <OrderedList pb={50} mt={4} ml={0}>
                    {fields
                      .filter((field) => !field._destroy)
                      .map((field) => {
                        return <RevisionRequestListItem revisionRequest={field} key={field.id} />
                      })}
                  </OrderedList>
                </Box>
              </TabPanel>
              <TabPanel>
                <SubmissionVersionSelect
                  options={permitApplication.pastSubmissionVersionOptions}
                  onChange={handleSelectPastVersionChange}
                  value={selectedPastSubmissionVersion}
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
                    {fields.length}
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
            submissionJson={submissionJsonForRevision}
            useFieldArrayMethods={useFieldArrayMethods}
            revisionRequest={revisionRequest}
            revisionRequestDefault={revisionRequestDefault}
            onSave={handleSubmit(onSaveRevision)}
            isRevisionsRequested={permitApplication.isRevisionsRequested}
            disableInput={forSubmitter || isViewingPastRequests}
          />
        )}
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

  const clickHandleView = () => {
    document.dispatchEvent(new CustomEvent("openRequestRevision", { detail: { key: requirementJson.key } }))
  }

  return (
    <ListItem mb={4} w="full">
      <ScrollLink to={`formio-component-${requirementJson.key}`}>{requirementJson.label}</ScrollLink>
      <Flex fontStyle="italic">
        {t("permitApplication.show.revision.reasonCode")}: {reasonCode}
      </Flex>
      <Flex gap={2} fontStyle="italic" alignItems="center" flexWrap="nowrap" w="full">
        <Box width={6} height={6}>
          <ChatDots size={24} />
        </Box>
        <Text noOfLines={1}>{comment}</Text>
        <Spacer />
        <Button variant="link" onClick={clickHandleView}>
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
