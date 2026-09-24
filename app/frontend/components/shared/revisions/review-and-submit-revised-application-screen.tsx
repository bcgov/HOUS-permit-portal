import { Box, Button, Flex, FormControl, FormHelperText, FormLabel, Heading, Text, Textarea } from "@chakra-ui/react"
import { CaretLeft } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { MutableRefObject, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { IPermitApplication } from "../../../models/permit-application"
import { EFlashMessageStatus } from "../../../types/enums"
import { ISubmissionData } from "../../../types/types"
import { compareSubmissionData } from "../../../utils/formio-helpers"
import { additionalChangeFields } from "../../../utils/submission-change-summary"
import { handleScrollToTop } from "../../../utils/utility-functions"
import { CustomMessageBox } from "../base/custom-message-box"
import { ProjectMeetingAdvisory } from "../permit-applications/permit-application-submit-modal"

export interface IReviewSubmitActions {
  submit: () => void
  saveAndExit: () => void
}

interface IReviewAndSubmitRevisedApplicationScreenProps {
  permitApplication: IPermitApplication
  submission: ISubmissionData
  onBack: () => void
  actionsRef: MutableRefObject<IReviewSubmitActions | null>
}

export const ReviewAndSubmitRevisedApplicationScreen = observer(
  ({ permitApplication, submission, onBack, actionsRef }: IReviewAndSubmitRevisedApplicationScreenProps) => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [submitterNote, setSubmitterNote] = useState(permitApplication.latestSubmissionVersion?.submitterNote ?? "")

    useEffect(() => {
      handleScrollToTop()
    }, [])
    const [isSaving, setIsSaving] = useState(false)

    const fieldRevisions = permitApplication.latestFieldRevisionRequests
    const supportingInformation = permitApplication.latestSupportingDocumentRevisionRequests
    const latestSubmissionData = permitApplication.latestSubmissionVersion?.submissionData
    const changedFieldKeys = new Set(
      latestSubmissionData && submission ? compareSubmissionData(latestSubmissionData, submission) : []
    )
    const fieldItems = fieldRevisions.map((request) => {
      const key = request.requirementJson?.key
      return {
        label: request.requirementJson?.label || t("permitApplication.show.revision.revisionRequest"),
        addressed: !!key && changedFieldKeys.has(key),
      }
    })
    const supportingItems = supportingInformation.map((request) => ({
      label: request.title || "",
      addressed: (request.supportingDocuments?.length ?? 0) > 0,
    }))
    const unaddressed = [...fieldItems, ...supportingItems].filter((item) => !item.addressed)
    const additionalChanges = additionalChangeFields({
      formJson: permitApplication.formJson,
      beforeSubmissionData: latestSubmissionData,
      afterSubmissionData: submission,
      excludeKeys: fieldRevisions.map((request) => request.requirementJson?.key).filter(Boolean) as string[],
    })

    const saveNote = async () => {
      const response = await permitApplication.updateSubmitterNote(submitterNote)
      return response?.ok
    }

    const handleSaveAndExit = async () => {
      setIsSaving(true)
      const ok = await saveNote()
      setIsSaving(false)
      if (!ok) return
      onBack()
    }

    const handleSubmit = async () => {
      setIsSaving(true)
      const ok = await saveNote()
      if (!ok) {
        setIsSaving(false)
        return
      }
      const submitted = await permitApplication.submit({
        submissionData: submission,
        submitterNote,
      })
      setIsSaving(false)
      if (submitted) navigate(`/permit-applications/${permitApplication.id}/sucessful-submission`)
    }

    actionsRef.current = { submit: handleSubmit, saveAndExit: handleSaveAndExit }

    return (
      <Box px={{ base: 4, md: 10 }} py={8} maxW="3xl">
        <Button variant="link" leftIcon={<CaretLeft />} onClick={onBack} mb={4}>
          {t("permitApplication.show.revision.backToApplication")}
        </Button>
        <Heading as="h1" fontSize="2xl" mb={2}>
          {t("permitApplication.show.revision.reviewAndSubmitTitle")}
        </Heading>
        <Text mb={8}>{t("permitApplication.show.revision.reviewAndSubmitIntro")}</Text>

        <SectionMarker />
        <Heading as="h2" fontSize="xl" mb={4}>
          {t("permitApplication.show.revision.addMessageForReviewer")}
        </Heading>
        <FormControl mb={10}>
          <FormLabel>{t("permitApplication.show.revision.messageOptional")}</FormLabel>
          <Textarea
            value={submitterNote}
            onChange={(event) => setSubmitterNote(event.target.value)}
            bg="white"
            minH="120px"
          />
          <FormHelperText>{t("permitApplication.show.revision.resubmitMessageHelper")}</FormHelperText>
        </FormControl>

        <SectionMarker spaced />
        <Heading as="h2" fontSize="xl" mb={4}>
          {t("permitApplication.show.revision.requestProgress")}
        </Heading>
        {unaddressed.length > 0 && (
          <CustomMessageBox
            status={EFlashMessageStatus.warning}
            mb={6}
            title={t("permitApplication.show.revision.unaddressedRequestsTitle", { count: unaddressed.length })}
            description={t("permitApplication.show.revision.unaddressedRequestsBody")}
            headingProps={{ mb: 0 }}
          >
            <Box as="ul" pl={5}>
              {unaddressed.map((item) => (
                <Box as="li" key={item.label}>
                  {item.label}
                </Box>
              ))}
            </Box>
            <Text>{t("permitApplication.show.revision.unaddressedRequestsHint")}</Text>
          </CustomMessageBox>
        )}
        {fieldItems.length > 0 && (
          <RequestGroup
            title={t("permitApplication.show.revision.revisionsProgress", {
              addressed: fieldItems.filter((item) => item.addressed).length,
              count: fieldItems.length,
            })}
            items={fieldItems}
          />
        )}
        {supportingItems.length > 0 && (
          <RequestGroup
            title={t("permitApplication.show.revision.supportingInformationProgress", {
              addressed: supportingItems.filter((item) => item.addressed).length,
              count: supportingItems.length,
            })}
            items={supportingItems}
          />
        )}

        <ProjectMeetingAdvisory permitApplication={permitApplication} />

        {additionalChanges.length > 0 && (
          <Box mb={8}>
            <SectionMarker spaced />
            <Heading as="h2" fontSize="xl" mb={4}>
              {t("permitApplication.show.revision.additionalChanges")}
            </Heading>
            <Box as="ul" pl={5} fontSize="lg">
              {additionalChanges.map((change) => (
                <Box as="li" key={change.key}>
                  {change.label}
                </Box>
              ))}
            </Box>
          </Box>
        )}

        <Flex gap={4}>
          <Button variant="primary" onClick={handleSubmit} isLoading={isSaving}>
            {t("permitApplication.new.submitApplication")}
          </Button>
          <Button variant="secondary" onClick={handleSaveAndExit} isDisabled={isSaving}>
            {t("permitApplication.show.revision.saveAndExit")}
          </Button>
        </Flex>
      </Box>
    )
  }
)

const SectionMarker = ({ spaced }: { spaced?: boolean }) => (
  <Box w={8} h={1} bg="theme.yellow" mb={3} mt={spaced ? 16 : 0} />
)

const RequestGroup = ({ title, items }: { title: string; items: { label: string; addressed: boolean }[] }) => {
  const { t } = useTranslation()

  return (
    <Box mb={6}>
      <Heading as="h3" fontSize="lg" mb={2}>
        {title}
      </Heading>
      <Box as="ul" pl={5} fontSize="lg">
        {items.map((item) => (
          <Box as="li" key={item.label}>
            {item.addressed ? t("permitApplication.show.revision.addressedItem", { label: item.label }) : item.label}
          </Box>
        ))}
      </Box>
    </Box>
  )
}
