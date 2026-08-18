import { Box, Flex, FormControl, FormLabel, Heading, HStack, Select, Stack, Text } from "@chakra-ui/react"
import { UsersThree } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IPermitProject } from "../../../models/permit-project"
import { COLLABORATOR_ACCESS_ORDER, PROJECT_ACCESS_ORDER, TEAM_ACCESS_ORDER } from "../../../models/project-permissions"
import { IProjectTeam } from "../../../models/project-team"
import { EFlashMessageStatus, EProjectTeamKind } from "../../../types/enums"
import { CustomMessageBox } from "../../shared/base/custom-message-box"
import { InfoTooltip } from "../../shared/info-tooltip"

interface IProps {
  permitProject: IPermitProject
}

export const TeamsTabPanelContent = observer(({ permitProject }: IProps) => {
  const { t } = useTranslation()

  return (
    <Flex direction="column" flex={1} bg="greys.white" p={10} gap={8}>
      <Box as="section">
        <HStack align="center" spacing={4} mb={6}>
          <UsersThree size={32} />
          <Heading as="h2" size="lg" mb={0}>
            {t("permitProject.teams.title")}
          </Heading>
        </HStack>
        <Text color="text.secondary">{t("permitProject.teams.description")}</Text>
      </Box>

      <CustomMessageBox status={EFlashMessageStatus.info} description={t("permitProject.teams.autoTeamsHint")} />

      {/* COLLAB TODO(phase 2): add custom teams (e.g. viewers, plumbers) with explicit
          membership and granular per-record permissions. */}
      <Stack spacing={6}>
        {permitProject.autoTeams.map((team) => (
          <TeamCard key={team.id} permitProject={permitProject} team={team} />
        ))}
      </Stack>
    </Flex>
  )
})

const ACCESS_ORDER_BY_DOMAIN = {
  projectAccess: PROJECT_ACCESS_ORDER,
  collaboratorAccess: COLLABORATOR_ACCESS_ORDER,
  teamAccess: TEAM_ACCESS_ORDER,
} as const

const TeamCard = observer(({ permitProject, team }: IProps & { team: IProjectTeam }) => {
  const { t } = useTranslation()
  const members = permitProject.membershipsForTeam(team.kind as EProjectTeamKind)

  return (
    <Box border="1px solid" borderColor="border.light" borderRadius="sm" p={6}>
      <Flex justify="space-between" align="baseline" mb={4} gap={4} wrap="wrap">
        <Box>
          <HStack spacing={1} align="center" mb={1}>
            <Heading as="h3" size="md" mb={0}>
              {t(`permitProject.teams.kind.${team.kind as EProjectTeamKind}`)}
            </Heading>
            {team.kind !== EProjectTeamKind.custom && (
              <InfoTooltip
                hasArrow
                placement="top"
                maxW="320px"
                whiteSpace="normal"
                label={t(`permitProject.teams.kindTooltip.${team.kind as EProjectTeamKind}`)}
                ariaLabel={t(`permitProject.teams.kindTooltip.${team.kind as EProjectTeamKind}`)}
              />
            )}
          </HStack>
          <Text fontSize="sm" color="text.secondary">
            {t("permitProject.teams.memberCount", { count: members.length })}
          </Text>
        </Box>
        <Text fontSize="sm">{members.map((membership) => membership.name).join(", ")}</Text>
      </Flex>

      <Flex gap={4} wrap="wrap">
        {(Object.keys(ACCESS_ORDER_BY_DOMAIN) as Array<keyof typeof ACCESS_ORDER_BY_DOMAIN>).map((domain) => (
          <FormControl key={domain} w="260px">
            <FormLabel>{t(`permitProject.teams.permissions.${domain}`)}</FormLabel>
            <Select
              value={team[domain]}
              isDisabled={!permitProject.canManageTeams}
              onChange={(e) => permitProject.updateProjectTeam(team.id, { [domain]: e.target.value } as any)}
            >
              {ACCESS_ORDER_BY_DOMAIN[domain].map((level) => (
                <option key={level} value={level}>
                  {t(`permitProject.teams.${domain}.${level}` as any)}
                </option>
              ))}
            </Select>
          </FormControl>
        ))}
      </Flex>
    </Box>
  )
})
