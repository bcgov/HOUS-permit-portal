import { Box, Button, Center, Flex, Hide, ListItem, OrderedList, Portal, Text, useDisclosure } from "@chakra-ui/react"
import { CaretRight, ChatDots, PaperPlaneTilt } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { MutableRefObject, useEffect, useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useMountStatus } from "../../../hooks/use-mount-status"
import { IPermitApplication } from "../../../models/permit-application"
import { IRevisionRequestsAttributes } from "../../../types/api-request"
import { IFormIORequirement, IRevisionRequest } from "../../../types/types"
import { getRequirementByKey } from "../../../utils/formio-component-traversal"
import { getSinglePreviousSubmissionJson } from "../../../utils/formio-submission-traversal"
import { handleScrollToBottom } from "../../../utils/utility-functions"
import ConfirmationModal from "../../shared/modals/confirmation-modal"
import { ScrollLink } from "../../shared/permit-applications/scroll-link"
import { RevisionModal } from "../../shared/revisions/revision-modal"

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
    const navigate = useNavigate()

    const getDefaultRevisionRequestValues = () => ({
      revisionRequestsAttributes: permitApplication.revisionRequests as IRevisionRequestsAttributes[],
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
    }, [permitApplication?.revisionRequests?.length])

    const onSaveRevision = (formData: IRevisionRequestForm) => {
      permitApplication.updateRevisionRequests(formData)
    }

    const [topHeight, setTopHeight] = useState<number>()

    useEffect(() => {
      const permitHeaderHeight = document.getElementById("permitHeader")?.offsetHeight
      setTopHeight(permitHeaderHeight)
    }, [isMounted, window.innerWidth, window.innerHeight])

    const { isOpen, onOpen, onClose } = useDisclosure()

    const onFinalizeRevisions = async () => {
      const ok = await permitApplication.finalizeRevisionRequests()
      if (ok) navigate(`/jurisdictions/${permitApplication.jurisdiction.slug}/submission-inbox`)
    }

    const handleOpenRequestRevision = async (event, upToDateFields) => {
      if (!permitApplication.formJson) return

      const foundRevisionRequest = upToDateFields.find((field) => field.requirementJson?.key === event.detail.key)
      const foundRequirement = getRequirementByKey(permitApplication.formJson, event.detail.key)
      const foundSubmissionJson = getSinglePreviousSubmissionJson(permitApplication.submissionData, event.detail.key)

      setRevisionRequest(foundRevisionRequest)
      setRequirementForRevision(foundRequirement)
      setSubmissionJsonForRevision(foundSubmissionJson)
      onOpen()
    }

    useEffect(() => {
      const handleOpenEvent = (event) => handleOpenRequestRevision(event, fields)
      document.addEventListener("openRequestRevision", handleOpenEvent)
      return () => {
        document.removeEventListener("openRequestRevision", handleOpenEvent)
      }
    }, [fields])

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
              {t("ui.cancel")}
            </Button>
          )}
        </Flex>
      )
    }

    return (
      <>
        <Hide below="md">
          <Flex
            direction="column"
            boxShadow="md"
            borderRight="1px solid"
            borderRightColor="theme.yellow"
            width={"sidebar.width"}
            position="sticky"
            top={topHeight}
            bottom="0"
            height={`calc(100vh - ${topHeight}px)`}
            float="left"
            id="permit-revision-sidebar"
            bg="theme.yellowLight"
          >
            <Box overflowY="auto" flex={1}>
              <Center p={8} textAlign="center" borderBottom="1px solid" borderColor="border.light">
                <Text fontStyle="italic">
                  {forSubmitter
                    ? t("permitApplication.show.locateRevisions")
                    : t("permitApplication.show.clickQuestion")}
                </Text>
              </Center>
              <OrderedList>
                {fields
                  .filter((field) => !field._destroy)
                  .map((field) => {
                    return (
                      <ListItem mb={4} key={field.id}>
                        <ScrollLink to={`formio-component-${field.requirementJson.key}`}>
                          {field.requirementJson.label}
                        </ScrollLink>
                        <Flex fontStyle="italic">
                          {t("permitApplication.show.revision.reasonCode")}: {/* @ts-ignore */}
                          {field.reasonCode}
                        </Flex>
                        <Flex gap={2} fontStyle="italic" alignItems="center" flexWrap="nowrap">
                          <Box width={6} height={6}>
                            <ChatDots size={24} />
                          </Box>
                          <Text noOfLines={1}>{field.comment}</Text>
                        </Flex>
                        {field.user && (
                          <Text fontStyle={"italic"}>
                            {t("ui.modifiedBy")}: {field.user.firstName} {field.user.lastName}
                          </Text>
                        )}
                      </ListItem>
                    )
                  })}
              </OrderedList>
            </Box>
            <Flex
              direction="column"
              borderTop="1px solid"
              borderColor="border.light"
              p={8}
              gap={4}
              justify="center"
              position="sticky"
              bottom={0}
              maxH={145}
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
            onSave={handleSubmit(onSaveRevision)}
            isRevisionsRequested={permitApplication.isRevisionsRequested}
            forSubmitter={forSubmitter}
          />
        )}
        {sendRevisionContainerRef && (
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
