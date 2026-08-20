import { Box, Heading } from "@chakra-ui/react"
import React from "react"
import { CollaboratorsTabPanelContent } from "../../components/domains/permit-project/collaborators-tab-panel-content"
import { IPermitProject } from "../../models/permit-project"
import { IProjectMembership } from "../../models/project-membership"
import { IProjectTeam } from "../../models/project-team"
import {
  ECollaboratorAccess,
  EMeetingAccess,
  EProjectAccess,
  EProjectMembershipRole,
  EProjectTeamKind,
} from "../../types/enums"

const noopAsync = async () => true

const autoTeam = (
  id: string,
  kind: EProjectTeamKind,
  projectAccess: EProjectAccess,
  collaboratorAccess: ECollaboratorAccess,
  meetingAccess: EMeetingAccess
) =>
  ({
    id,
    name: kind,
    kind,
    projectAccess,
    collaboratorAccess,
    meetingAccess,
    isAuto: true,
    projectMembershipIds: [],
  }) as IProjectTeam

const customTeam = (id: string, name: string, projectMembershipIds: string[]) =>
  ({
    id,
    name,
    kind: EProjectTeamKind.custom,
    projectAccess: EProjectAccess.base,
    collaboratorAccess: ECollaboratorAccess.none,
    meetingAccess: EMeetingAccess.none,
    isAuto: false,
    projectMembershipIds,
  }) as IProjectTeam

const AUTO_TEAM_ID_BY_ROLE = {
  [EProjectMembershipRole.lead]: "t-leads",
  [EProjectMembershipRole.contributor]: "t-contrib",
}

const membership = (
  id: string,
  role: EProjectMembershipRole,
  name: string,
  email: string,
  extraTeam: { id: string; name: string } | null,
  pending = false
) =>
  ({
    id,
    role,
    name,
    email,
    isInvitationPending: pending,
    // Pending invites are on no team until accepted, which is what makes their
    // effective access read as none.
    teams: pending
      ? []
      : [
          {
            id: AUTO_TEAM_ID_BY_ROLE[role],
            name: role,
            kind: EProjectTeamKind[role === "lead" ? "leads" : "contributors"],
          },
          { id: "t-all", name: "All members", kind: EProjectTeamKind.allMembers },
          ...(extraTeam ? [{ id: extraTeam.id, name: extraTeam.name, kind: EProjectTeamKind.custom }] : []),
        ],
  }) as IProjectMembership

const plumbers = { id: "team-plumbers", name: "Plumbers" }

const autoTeams = [
  autoTeam("t-leads", EProjectTeamKind.leads, EProjectAccess.edit, ECollaboratorAccess.manage, EMeetingAccess.manage),
  autoTeam(
    "t-contrib",
    EProjectTeamKind.contributors,
    EProjectAccess.base,
    ECollaboratorAccess.none,
    EMeetingAccess.none
  ),
  autoTeam("t-all", EProjectTeamKind.allMembers, EProjectAccess.read, ECollaboratorAccess.none, EMeetingAccess.view),
]

const customTeams = [customTeam(plumbers.id, plumbers.name, ["m-lead"])]

const populatedProject = {
  ownerName: "Avery Steward",
  canViewCollaborators: true,
  canManageCollaborators: true,
  projectMemberships: [
    membership("m-lead", EProjectMembershipRole.lead, "Jordan Lead", "jordan@example.com", plumbers),
    membership("m-contrib", EProjectMembershipRole.contributor, "Casey Contributor", "casey@example.com", null),
    membership("m-pending", EProjectMembershipRole.contributor, "", "pending@example.com", null, true),
  ],
  autoTeams,
  customTeams,
  projectTeams: [...autoTeams, ...customTeams],
  membershipsForTeam: (team: IProjectTeam) =>
    team.projectMembershipIds.map((id) => populatedProject.projectMemberships.find((m) => m.id === id)).filter(Boolean),
  inviteProjectMemberships: noopAsync,
  updateProjectMembershipRole: noopAsync,
  createProjectTeam: async () => ({ ok: true, data: { data: { id: "team-new" } } }),
  updateProjectTeam: noopAsync,
  destroyProjectTeam: noopAsync,
  reinviteProjectMembership: noopAsync,
  removeProjectMembership: noopAsync,
} as unknown as IPermitProject

const noAccessProject = {
  ownerName: "Avery Steward",
  canViewCollaborators: false,
  canManageCollaborators: false,
  projectMemberships: [],
  autoTeams: [],
  customTeams: [],
  projectTeams: [],
} as unknown as IPermitProject

// Same data, read-only: selects become labels and the actions disappear.
const viewOnlyProject = { ...populatedProject, canManageCollaborators: false } as unknown as IPermitProject

const Section = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <Box borderTop="1px dashed" borderColor="border.light" pt={6} mt={6}>
    <Heading size="sm" px={10} mb={2}>
      {label}
    </Heading>
    {children}
  </Box>
)

const PeopleAndAccessCase = () => (
  <Box>
    <CollaboratorsTabPanelContent permitProject={populatedProject} />
    <Section label="View-only (cannot manage)">
      <CollaboratorsTabPanelContent permitProject={viewOnlyProject} />
    </Section>
    <Section label="No-access empty state">
      <CollaboratorsTabPanelContent permitProject={noAccessProject} />
    </Section>
  </Box>
)

export default { "people-and-access": PeopleAndAccessCase }
