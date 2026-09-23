import {
  Box,
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  ListItem,
  Text,
  Textarea,
  UnorderedList,
} from "@chakra-ui/react"
import { CaretLeft } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { IPermitApplication } from "../../../models/permit-application"
import { handleScrollToTop } from "../../../utils/utility-functions"

interface IReviewAndSendRequestsScreenProps {
  permitApplication: IPermitApplication
  onBack: () => void
  onExitRevisionMode: () => void
}

// TODO: adding a permit is prompted from this confirm step later, and does not
// touch permit-application status or revision gating. No checkbox here saves anything.
export const ReviewAndSendRequestsScreen = observer(
  ({ permitApplication, onBack, onExitRevisionMode }: IReviewAndSendRequestsScreenProps) => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [applicantNote, setApplicantNote] = useState(permitApplication.latestSubmissionVersion?.applicantNote ?? "")

    useEffect(() => {
      handleScrollToTop()
    }, [])
    const [isSaving, setIsSaving] = useState(false)

    const fieldRevisions = permitApplication.latestFieldRevisionRequests
    const supportingInformation = permitApplication.latestSupportingDocumentRevisionRequests
    const requestCount = fieldRevisions.length + supportingInformation.length

    const saveNote = async () => {
      const response = await permitApplication.updateRevisionRequests({ applicantNote })
      return response?.ok
    }

    const handleSaveAndExit = async () => {
      setIsSaving(true)
      const ok = await saveNote()
      setIsSaving(false)
      if (!ok) return
      onExitRevisionMode()
    }

    const handleSend = async () => {
      setIsSaving(true)
      const ok = await saveNote()
      if (!ok) {
        setIsSaving(false)
        return
      }
      const sent = await permitApplication.finalizeRevisionRequests()
      setIsSaving(false)
      if (sent) navigate(`/jurisdictions/${permitApplication.jurisdiction.slug}/submission-inbox`)
    }

    return (
      <Box px={{ base: 4, md: 10 }} py={8} maxW="3xl">
        <Button variant="link" leftIcon={<CaretLeft />} onClick={onBack} mb={4}>
          {t("permitApplication.show.revision.backToPermitApplication")}
        </Button>
        <Heading as="h1" fontSize="2xl" mb={2}>
          {t("permitApplication.show.revision.reviewAndSendTitle")}
        </Heading>
        <Text mb={8}>{t("permitApplication.show.revision.reviewAndSendIntro")}</Text>

        <SectionMarker />
        <Heading as="h2" fontSize="xl" mb={4}>
          {t("permitApplication.show.revision.addMessageForSubmitter")}
        </Heading>
        <FormControl mb={10}>
          <FormLabel>{t("permitApplication.show.revision.messageOptional")}</FormLabel>
          <Textarea
            value={applicantNote}
            onChange={(event) => setApplicantNote(event.target.value)}
            bg="white"
            minH="120px"
          />
          <FormHelperText>{t("permitApplication.show.revision.messageHelper")}</FormHelperText>
        </FormControl>

        <SectionMarker spaced />
        <Heading as="h2" fontSize="xl" mb={4}>
          {t("permitApplication.show.revision.requestsCount", { count: requestCount })}
        </Heading>

        {fieldRevisions.length > 0 && (
          <RequestGroup
            title={t("permitApplication.show.revision.revisionsCount", { count: fieldRevisions.length })}
            items={fieldRevisions.map(
              (request) => request.requirementJson?.label || t("permitApplication.show.revision.revisionRequest")
            )}
          />
        )}
        {supportingInformation.length > 0 && (
          <RequestGroup
            title={t("permitApplication.show.revision.supportingInformationCount", {
              count: supportingInformation.length,
            })}
            items={supportingInformation.map((request) => request.title || "")}
          />
        )}

        <Flex gap={4} mt={8}>
          <Button variant="primary" onClick={handleSend} isLoading={isSaving}>
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
                {requestCount}
              </Flex>
            </Flex>
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

const RequestGroup = ({ title, items }: { title: string; items: string[] }) => (
  <Box mb={6}>
    <Heading as="h3" fontSize="md" mb={2}>
      {title}
    </Heading>
    <UnorderedList>
      {items.map((item, index) => (
        <ListItem key={`${title}-${index}`}>{item}</ListItem>
      ))}
    </UnorderedList>
  </Box>
)
