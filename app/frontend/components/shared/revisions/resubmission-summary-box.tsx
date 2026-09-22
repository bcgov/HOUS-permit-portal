import { Box, Button, Flex, Heading, Link, Text } from "@chakra-ui/react"
import { CaretDown, CaretUp } from "@phosphor-icons/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { IPermitApplication } from "../../../models/permit-application"
import { EFlashMessageStatus, ERevisionRequestType } from "../../../types/enums"
import { additionalChangeFields } from "../../../utils/submission-change-summary"
import { CustomMessageBox } from "../base/custom-message-box"
import { ScrollLink } from "../permit-applications/scroll-link"

const dateFormat = "MMM d, yyyy 'at' h:mm a"

export function resubmissionSummaryIsVisible(permitApplication: IPermitApplication) {
  const viewingPast = permitApplication.isViewingPastRequests && !!permitApplication.selectedSubmissionVersion
  const requestVersion = viewingPast
    ? permitApplication.selectedSubmissionVersion
    : permitApplication.previousSubmissionVersion
  const requests = requestVersion?.revisionRequests || []
  const showingLatestRound = !viewingPast && (permitApplication.isResubmitted || permitApplication.isInReview)
  return (showingLatestRound || viewingPast) && !!requestVersion && requests.length > 0
}

export const ResubmissionSummaryBox = observer(function ResubmissionSummaryBox({
  permitApplication,
}: {
  permitApplication: IPermitApplication
}) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(true)
  const viewingPast = permitApplication.isViewingPastRequests && !!permitApplication.selectedSubmissionVersion
  const versions = permitApplication.sortedSubmissionVersions
  const selected = viewingPast ? permitApplication.selectedSubmissionVersion : null
  const selectedIndex = selected ? versions.findIndex((version) => version.id === selected.id) : -1
  const responseVersion = selectedIndex > 0 ? versions[selectedIndex - 1] : permitApplication.latestSubmissionVersion
  const requestVersion = selected ?? permitApplication.previousSubmissionVersion
  const requests = requestVersion?.revisionRequests || []
  if (!resubmissionSummaryIsVisible(permitApplication) || !requestVersion) return null
  const previous = requestVersion
  const latest = responseVersion
  const isLatestRound = requestVersion.id === permitApplication.previousSubmissionVersion?.id

  const fieldRevisions = requests.filter(
    (request) => !request.type || request.type === ERevisionRequestType.FieldRevisionRequest
  )
  const supportingInformation = requests.filter(
    (request) => request.type === ERevisionRequestType.SupportingDocumentRevisionRequest
  )
  const additionalChanges = additionalChangeFields({
    formJson: permitApplication.formJson,
    beforeSubmissionData: previous?.submissionData,
    afterSubmissionData: latest?.submissionData,
    excludeKeys: fieldRevisions.map((request) => request.requirementJson?.key).filter(Boolean) as string[],
  })
  const requestedAt = permitApplication.revisionsRequestedAt
  const resubmittedAt = isLatestRound ? permitApplication.resubmittedAt : latest?.createdAt
  const viewedAt = (viewingPast ? requestVersion : latest)?.createdAt
  const viewedSentence = viewedAt
    ? t("permitApplication.show.revision.viewingSubmission", { viewedAt: format(viewedAt, dateFormat) })
    : undefined
  const revisionSentence =
    isLatestRound && requestedAt && resubmittedAt
      ? t("permitApplication.show.revision.revisedBySubmitterBody", {
          requestedAt: format(requestedAt, dateFormat),
          resubmittedAt: format(resubmittedAt, dateFormat),
        })
      : !isLatestRound && resubmittedAt
        ? t("permitApplication.show.revision.revisedBySubmitterResubmittedBody", {
            resubmittedAt: format(resubmittedAt, dateFormat),
          })
        : undefined
  const firstSubmittedSentence = permitApplication.submittedAt
    ? t("permitApplication.show.wasSubmitted", {
        date: format(permitApplication.submittedAt, dateFormat),
        jurisdictionName: permitApplication.jurisdiction?.qualifiedName,
      })
    : undefined
  const description =
    [viewedSentence, revisionSentence, firstSubmittedSentence].filter(Boolean).join("\n\n") || undefined

  return (
    <CustomMessageBox
      status={EFlashMessageStatus.warning}
      title={t("permitApplication.show.revision.revisedBySubmitterTitle")}
      description={description}
    >
      <Button
        variant="link"
        rightIcon={isOpen ? <CaretUp /> : <CaretDown />}
        onClick={() => setIsOpen((open) => !open)}
        color="text.primary"
        fontWeight="bold"
        mt={2}
      >
        {t("permitApplication.show.revision.summaryOfRevisions")}
      </Button>
      {isOpen && (
        <Flex direction="column" gap={5} mt={4}>
          {previous?.submitterNote && (
            <Box>
              <Heading as="h4" fontSize="md" mb={2}>
                {t("permitApplication.show.revision.messageFromSubmitter")}
              </Heading>
              <Text fontSize="sm" color="text.secondary">
                {previous.submitterNote}
              </Text>
            </Box>
          )}
          {fieldRevisions.length > 0 && (
            <Box>
              <Heading as="h4" fontSize="md" mb={2}>
                {t("permitApplication.show.revision.requestedRevisions")}
              </Heading>
              <Flex direction="column" align="flex-start" gap={1}>
                {fieldRevisions.map((request) => (
                  <ScrollLink key={request.id} to={`formio-component-${request.requirementJson?.key}`}>
                    {request.requirementJson?.label || t("permitApplication.show.revision.revisionRequest")}
                  </ScrollLink>
                ))}
              </Flex>
            </Box>
          )}
          {supportingInformation.length > 0 && (
            <Box>
              <Heading as="h4" fontSize="md" mb={2}>
                {t("permitApplication.show.revision.supportingInformationSection")}
              </Heading>
              <Flex direction="column" align="flex-start" gap={2}>
                {supportingInformation.map((request) => (
                  <Box key={request.id}>
                    <Text fontSize="sm">{request.title}</Text>
                    {(request.supportingDocuments || []).map((doc) => (
                      <Link key={doc.id} href={doc.fileUrl} isExternal color="text.link" fontSize="sm" display="block">
                        {doc.fileName}
                      </Link>
                    ))}
                  </Box>
                ))}
              </Flex>
            </Box>
          )}
          {additionalChanges.length > 0 && (
            <Box>
              <Heading as="h4" fontSize="md" mb={2}>
                {t("permitApplication.show.revision.additionalChanges")}
              </Heading>
              <Flex direction="column" align="flex-start" gap={1}>
                {additionalChanges.map((change) => (
                  <ScrollLink key={change.key} to={`formio-component-${change.key}`}>
                    {change.label}
                  </ScrollLink>
                ))}
              </Flex>
            </Box>
          )}
        </Flex>
      )}
    </CustomMessageBox>
  )
})
