import { Button, Heading, HStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { Link as RouterLink } from "react-router-dom"
import { usePermitProject } from "../../../../../hooks/resources/use-permit-project"
import ProjectInfoRow from "../../../../shared/project/project-info-row"
import { useProjectMeetingNavigation } from "../../use-project-meeting-navigation"
import { SectionHeading } from "../shared/section-heading"

export const ProjectInformationSection = observer(() => {
  const { t } = useTranslation()
  const { currentPermitProject } = usePermitProject()
  const { navigateToNext } = useProjectMeetingNavigation()

  return (
    <form onSubmit={(event) => event.preventDefault()}>
      <SectionHeading
        title={t("projectMeeting.sections.projectInformation.title")}
        description={t("projectMeeting.sections.projectInformation.description")}
      />
      <Heading as="h2" size="md" mb={4}>
        {t("projectMeeting.projectInformation")}
      </Heading>
      <ProjectInfoRow
        label={t("permitProject.overview.address")}
        value={currentPermitProject?.fullAddress}
        isBold
        stacked
      />
      <ProjectInfoRow label={t("permitProject.overview.pid")} value={currentPermitProject?.pid} stacked />
      <ProjectInfoRow
        label={t("permitProject.overview.jurisdictionName")}
        value={currentPermitProject?.jurisdiction?.disambiguatedName}
        stacked
      />
      <HStack spacing={3} mt={8}>
        <Button variant="secondary" as={RouterLink} to={`/projects/${currentPermitProject?.id}/overview`}>
          {t("ui.back")}
        </Button>
        <Button variant="primary" onClick={navigateToNext}>
          {t("ui.continue")}
        </Button>
      </HStack>
    </form>
  )
})
