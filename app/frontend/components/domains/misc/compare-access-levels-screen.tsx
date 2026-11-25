import { Box, Container, Flex, Heading, Table, Tbody, Td, Text, Th, Tr, VisuallyHidden, VStack } from "@chakra-ui/react"
import { Check, Diamond, Minus } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { EProjectAccess } from "../../../types/enums"

type TMark = "yes" | "no" | "conditional"

const COLUMNS = [EProjectAccess.limited, EProjectAccess.expanded, EProjectAccess.full] as const

type TComparisonRow = { action: string } & Record<(typeof COLUMNS)[number], TMark>

const MARK_FROM_CODE: Record<string, TMark> = { y: "yes", n: "no", c: "conditional" }

const MARK_ICON = { yes: Check, no: Minus, conditional: Diamond }

const MARK_LABEL = {
  yes: "compareAccessLevels.markYes",
  no: "compareAccessLevels.markNo",
  conditional: "compareAccessLevels.markConditional",
} as const

// marks are Limited, Expanded, Full: y can, n cannot, c only with extra access
const row = (action: string, marks: string): TComparisonRow => ({
  action,
  limited: MARK_FROM_CODE[marks[0]],
  expanded: MARK_FROM_CODE[marks[1]],
  full: MARK_FROM_CODE[marks[2]],
})

const LEVELS = [
  { access: EProjectAccess.limited, paragraphs: ["limitedBody1", "limitedBody2"] },
  { access: EProjectAccess.expanded, paragraphs: ["expandedBody1", "expandedBody2"] },
  { access: EProjectAccess.full, paragraphs: ["fullBody1", "fullBody2"] },
] as const

const SECTIONS: { surface: string; rows: TComparisonRow[] }[] = [
  {
    surface: "overview",
    rows: [
      row("viewProjectName", "yyy"),
      row("editProjectName", "nny"),
      row("viewProjectInformation", "yyy"),
      row("editProjectInformation", "nny"),
      row("viewProjectStatus", "yyy"),
      row("leaveProject", "yyy"),
    ],
  },
  {
    surface: "permitApplications",
    rows: [
      row("addPermitApplication", "nyy"),
      row("viewPermitApplicationList", "yyy"),
      row("viewPermitApplication", "cyy"),
      row("viewPermitApplicationStatus", "yyy"),
      row("editPermitApplication", "cyy"),
      row("updateDraftTemplate", "cyy"),
      row("acknowledgeElectiveChanges", "cyy"),
      row("uploadOrDeleteSupportingDocuments", "cyy"),
      row("downloadSupportingDocuments", "cyy"),
      row("downloadRevisionReferenceDocuments", "cyy"),
      row("viewStepCode", "cyy"),
      row("createOrEditStepCode", "cyy"),
      row("deleteOrRestoreStepCode", "nyy"),
      row("assignRequirementBlock", "nyy"),
      row("assignSubmitPermission", "nyy"),
      row("submitPermitApplication", "nyy"),
      row("removeAndArchiveDraft", "ncy"),
      row("restoreArchivedDraft", "nny"),
      row("respondToRevisionRequests", "cyy"),
      row("respondToAdditionalInformationRequests", "cyy"),
    ],
  },
  {
    surface: "peopleAndAccess",
    rows: [
      row("viewPeople", "yyy"),
      row("viewInvitations", "nyy"),
      row("viewPersonAccess", "yyy"),
      row("invitePerson", "ncy"),
      row("chooseAccessWhenInviting", "ncy"),
      row("changeContactDesignation", "nny"),
      row("changeAccess", "nny"),
      row("changeProjectRole", "nyy"),
      row("removePerson", "nny"),
      row("resendOrCancelInvitation", "ncy"),
    ],
  },
  {
    surface: "projectMeetings",
    rows: [
      row("viewMeetingList", "nyy"),
      row("viewMeeting", "nyy"),
      row("viewMeetingDetails", "nyy"),
      row("downloadMeetingDocuments", "nyy"),
      row("requestMeeting", "nyy"),
      row("editMeetingRequest", "nyy"),
      row("downloadCalendarInvite", "nyy"),
      row("cancelMeetingRequest", "nyy"),
      row("viewLocalGovernmentNotes", "nyy"),
    ],
  },
  {
    surface: "projectNotes",
    rows: [row("viewProjectNotes", "nyy")],
  },
  {
    surface: "activity",
    rows: [row("viewProjectActivity", "nyy")],
  },
]

const AccessMark = ({ mark, labelled = true }: { mark: TMark; labelled?: boolean }) => {
  const { t } = useTranslation()
  const Icon = MARK_ICON[mark]
  const icon = <Icon size={24} aria-hidden />

  if (!labelled) return icon

  return (
    <Flex justify="center" role="img" aria-label={t(MARK_LABEL[mark])}>
      {icon}
    </Flex>
  )
}

export const CompareAccessLevelsScreen = () => {
  const { t } = useTranslation()

  return (
    <Container maxW="container.lg" pt={14} pb="36" px="8">
      <Heading as="h1" mb={0} color="text.primary">
        {t("compareAccessLevels.title")}
      </Heading>
      <Text pt={5} fontSize="lg" lineHeight="1.68" color="text.secondary" maxW="800px">
        {t("compareAccessLevels.intro")}
      </Text>

      <Box as="section" mt={12} maxW="800px">
        <Heading as="h2" size="lg" mb={3} color="text.primary">
          {t("compareAccessLevels.choosingTitle")}
        </Heading>
        <Text fontSize="lg" lineHeight="1.68" color="text.secondary">
          {t("compareAccessLevels.choosingIntro")}
        </Text>
        <VStack align="stretch" spacing={5} mt={7}>
          {LEVELS.map((level) => (
            <Box key={level.access}>
              <Heading as="h3" size="md" mb={2} color="text.primary">
                {t(`permitProject.people.access.${level.access}`)}
              </Heading>
              {level.paragraphs.map((paragraph) => (
                <Text key={paragraph} fontSize="lg" lineHeight="1.68" color="text.secondary" mb={3.5} _last={{ mb: 0 }}>
                  {t(`compareAccessLevels.${paragraph}`)}
                </Text>
              ))}
            </Box>
          ))}
        </VStack>
      </Box>

      <Box as="section" mt={14}>
        <Heading as="h2" size="lg" mb={2} color="text.primary">
          {t("compareAccessLevels.comparisonTitle")}
        </Heading>
        <Text fontSize="lg" lineHeight="1.68" color="text.secondary" maxW="800px">
          {t("compareAccessLevels.comparisonIntro")}
        </Text>

        <Box as="section" mt={4} aria-labelledby="access-level-key">
          <Heading as="h3" id="access-level-key" size="md" mb={4} color="text.primary">
            {t("compareAccessLevels.keyTitle")}
          </Heading>
          <VStack align="flex-start" spacing={4}>
            {(["no", "yes", "conditional"] as const).map((mark) => (
              <Flex key={mark} align="center" gap="10px">
                <AccessMark mark={mark} labelled={false} />
                <Text fontSize="lg" color="text.secondary">
                  {t(MARK_LABEL[mark])}
                </Text>
              </Flex>
            ))}
          </VStack>
        </Box>

        <Box mt={5} overflowX="auto">
          <Table
            variant="simple"
            sx={{ "th, td": { borderColor: "border.light" }, th: { textTransform: "none", letterSpacing: "normal" } }}
          >
            <VisuallyHidden as="caption">{t("compareAccessLevels.tableCaption")}</VisuallyHidden>
            {SECTIONS.map((section) => (
              <Tbody key={section.surface}>
                <Tr bg="theme.blue" borderColor="theme.blue">
                  <Th
                    colSpan={4}
                    scope="colgroup"
                    bg="theme.blue"
                    color="white"
                    fontSize="lg"
                    fontWeight="bold"
                    py={3.5}
                    textAlign="left"
                    borderColor="theme.blue"
                  >
                    {t(`compareAccessLevels.surfaces.${section.surface}`)}
                  </Th>
                </Tr>
                <Tr bg="theme.blueLight">
                  <Th
                    scope="col"
                    bg="theme.blueLight"
                    color="text.primary"
                    fontWeight="bold"
                    fontSize="md"
                    textAlign="left"
                    borderBottomColor="theme.blue"
                  >
                    {t("compareAccessLevels.actionColumn")}
                  </Th>
                  {COLUMNS.map((access) => (
                    <Th
                      key={access}
                      scope="col"
                      bg="theme.blueLight"
                      color="text.primary"
                      fontWeight="bold"
                      fontSize="md"
                      textAlign="center"
                      w="148px"
                      borderBottomColor="theme.blue"
                    >
                      {t(`permitProject.people.access.${access}`)}
                    </Th>
                  ))}
                </Tr>
                {section.rows.map((comparisonRow) => (
                  <Tr key={comparisonRow.action}>
                    <Th
                      scope="row"
                      fontWeight="normal"
                      color="text.primary"
                      fontSize="md"
                      textAlign="left"
                      whiteSpace="normal"
                      py={4}
                    >
                      {t(`compareAccessLevels.actions.${comparisonRow.action}`)}
                    </Th>
                    {COLUMNS.map((access) => (
                      <Td key={access} textAlign="center" py={4}>
                        <AccessMark mark={comparisonRow[access]} />
                      </Td>
                    ))}
                  </Tr>
                ))}
              </Tbody>
            ))}
          </Table>
        </Box>
      </Box>
    </Container>
  )
}
