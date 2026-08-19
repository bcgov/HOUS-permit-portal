import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  ListItem,
  Radio,
  RadioGroup,
  Stack,
  Text,
  UnorderedList,
} from "@chakra-ui/react"
import { CaretLeft } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { Link as RouterLink, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { usePermitProject } from "../../../hooks/resources/use-permit-project"
import { useMst } from "../../../setup/root"
import { EFlashMessageStatus } from "../../../types/enums"
import { CustomMessageBox } from "../../shared/base/custom-message-box"
import { ErrorScreen } from "../../shared/base/error-screen"
import { LoadingScreen } from "../../shared/base/loading-screen"
import ProjectInfoRow from "../../shared/project/project-info-row"

export const ProjectMeetingRequestScreen = observer(function ProjectMeetingRequestScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { permitProjectId } = useParams<{ permitProjectId: string }>()
  const { currentPermitProject, error: projectError } = usePermitProject()
  const { projectMeetingStore, siteConfigurationStore } = useMst()
  const [selectedOption, setSelectedOption] = useState("yes")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createError, setCreateError] = useState(false)
  const projectIsLoaded = currentPermitProject?.id === permitProjectId && currentPermitProject.isFullyLoaded
  const isAddPermitsMode = searchParams.get("source") === "add-permits"
  const addedCount = Number(searchParams.get("count") || 0)
  const hasMeetingRequiredPermits = searchParams.get("requiresMeeting") === "true"
  const projectMeetingsAvailable =
    projectIsLoaded &&
    currentPermitProject.canManageMeetings &&
    siteConfigurationStore.projectMeetingsEnabled &&
    currentPermitProject.jurisdiction?.projectMeetingsEnabled

  if (projectError || createError) return <ErrorScreen />
  if (!projectIsLoaded) return <LoadingScreen />
  if (!permitProjectId || !projectMeetingsAvailable) {
    return <ErrorScreen error={new Error(t("projectMeeting.validation.featureUnavailable"))} />
  }

  const createMeetingAndContinue = async () => {
    setIsSubmitting(true)
    try {
      const meeting = await projectMeetingStore.createProjectMeeting(permitProjectId)
      if (meeting) {
        navigate(`/projects/${permitProjectId}/meetings/${meeting.id}/edit/relationship`)
      } else {
        setCreateError(true)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddPermitsContinue = () => {
    if (selectedOption === "yes") {
      createMeetingAndContinue()
      return
    }

    navigate(`/projects/${permitProjectId}/overview`)
  }

  return (
    <Container maxW="container.lg" p={8} as="main">
      {isAddPermitsMode ? (
        <AddPermitsRequestContent
          addedCount={addedCount}
          hasMeetingRequiredPermits={hasMeetingRequiredPermits}
          isSubmitting={isSubmitting}
          selectedOption={selectedOption}
          onSelectedOptionChange={setSelectedOption}
          onContinue={handleAddPermitsContinue}
          onCancel={() => navigate(`/projects/${permitProjectId}/overview`)}
        />
      ) : (
        <StandardRequestContent isSubmitting={isSubmitting} onContinue={createMeetingAndContinue} />
      )}
    </Container>
  )
})

function ProjectMeetingIntro({ showVisibility = false }: { showVisibility?: boolean }) {
  const { t } = useTranslation()

  return (
    <>
      <Heading as="h1" size="2xl" mb={3}>
        {t("projectMeeting.request.title")}
      </Heading>
      <Text fontSize="lg" mb={4}>
        {t("projectMeeting.request.intro")}
      </Text>
      {showVisibility && (
        <Text fontSize="lg" mb={4}>
          {t("projectMeeting.request.visibility")}
        </Text>
      )}
      <Text fontSize="lg" mb={2}>
        {t("projectMeeting.request.chanceTo")}
      </Text>
      <UnorderedList spacing={1} mb={8}>
        <ListItem>{t("projectMeeting.request.discussProposal")}</ListItem>
        <ListItem>{t("projectMeeting.request.askQuestions")}</ListItem>
        <ListItem>{t("projectMeeting.request.learnRequirements")}</ListItem>
        <ListItem>{t("projectMeeting.request.meetOfficials")}</ListItem>
      </UnorderedList>
    </>
  )
}

interface IStandardRequestContentProps {
  isSubmitting: boolean
  onContinue: () => void
}

function StandardRequestContent({ isSubmitting, onContinue }: IStandardRequestContentProps) {
  const { t } = useTranslation()
  const { currentPermitProject } = usePermitProject()

  return (
    <Flex direction="column" gap={6}>
      <Button
        variant="link"
        as={RouterLink}
        to={`/projects/${currentPermitProject?.id}/overview`}
        leftIcon={<CaretLeft size={20} />}
        alignSelf="flex-start"
      >
        {t("projectMeeting.backToProjectOverview")}
      </Button>
      <Box>
        <ProjectMeetingIntro showVisibility />
      </Box>

      <Box as="section">
        <Heading as="h2" variant="yellowline" size="lg" mb={4}>
          {t("projectMeeting.projectInformation")}
        </Heading>
        <ProjectInfoRow label={t("permitProject.overview.address")} value={currentPermitProject?.fullAddress} isBold />
        <ProjectInfoRow label={t("permitProject.overview.pid")} value={currentPermitProject?.pid} />
        <ProjectInfoRow
          label={t("permitProject.overview.jurisdictionName")}
          value={currentPermitProject?.jurisdiction?.disambiguatedName}
        />
      </Box>

      <CustomMessageBox
        status={EFlashMessageStatus.info}
        title={t("projectMeeting.request.checkProjectInformation.title")}
      >
        <Text fontSize="sm">
          {t("projectMeeting.request.checkProjectInformation.description")}{" "}
          <Text
            as={RouterLink}
            to={`/projects/${currentPermitProject?.id}/overview?editProjectInfo=true`}
            display="inline"
            fontSize="sm"
            textDecoration="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("projectMeeting.request.checkProjectInformation.link")}
          </Text>
        </Text>
      </CustomMessageBox>

      <Button variant="primary" alignSelf="flex-start" onClick={onContinue} isLoading={isSubmitting}>
        {t("ui.continue")}
      </Button>
    </Flex>
  )
}

interface IAddPermitsRequestContentProps {
  addedCount: number
  hasMeetingRequiredPermits: boolean
  isSubmitting: boolean
  selectedOption: string
  onSelectedOptionChange: (value: string) => void
  onContinue: () => void
  onCancel: () => void
}

function AddPermitsRequestContent({
  addedCount,
  hasMeetingRequiredPermits,
  isSubmitting,
  selectedOption,
  onSelectedOptionChange,
  onContinue,
  onCancel,
}: IAddPermitsRequestContentProps) {
  const { t } = useTranslation()

  return (
    <Flex direction="column" gap={6}>
      <CustomMessageBox
        status={EFlashMessageStatus.success}
        title={t("projectMeeting.request.addPermitsSuccess.title", { count: addedCount })}
        description={t("projectMeeting.request.addPermitsSuccess.description")}
      />

      <Box>
        <ProjectMeetingIntro />
      </Box>

      {hasMeetingRequiredPermits && (
        <CustomMessageBox
          status={EFlashMessageStatus.info}
          title={t("projectMeeting.request.requiredPermits.title")}
          description={t("projectMeeting.request.requiredPermits.description")}
        />
      )}

      <Box as="section">
        <Heading as="h2" variant="yellowline" size="lg" mb={4}>
          {t("projectMeeting.request.question")}
        </Heading>
        <RadioGroup value={selectedOption} onChange={onSelectedOptionChange}>
          <Stack spacing={2}>
            <Radio value="yes">{t("projectMeeting.request.yes")}</Radio>
            <Radio value="no">{t("projectMeeting.request.no")}</Radio>
          </Stack>
        </RadioGroup>
      </Box>

      <Flex gap={3}>
        <Button variant="secondary" onClick={onCancel} isDisabled={isSubmitting}>
          {t("ui.cancel")}
        </Button>
        <Button variant="primary" onClick={onContinue} isLoading={isSubmitting}>
          {t("ui.continue")}
        </Button>
      </Flex>
    </Flex>
  )
}
