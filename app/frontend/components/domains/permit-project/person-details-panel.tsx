import { Avatar, Box, Button, Flex, IconButton, Radio, RadioGroup, Text, VStack } from "@chakra-ui/react"
import { CaretLeft, X } from "@phosphor-icons/react"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  EFlashMessageStatus,
  EProjectAccess,
  EProjectContactDesignation,
  EProjectMembershipStatus,
} from "../../../types/enums"
import { IProjectPerson } from "../../../types/types"
import { CustomMessageBox } from "../../shared/base/custom-message-box"
import { ConfirmationModal } from "../../shared/modals/confirmation-modal"
import { RouterLink } from "../../shared/navigation/router-link"
import { ProjectAccessTag } from "../../shared/permit-projects/project-access-tag"
import { ProjectRoleSelect } from "../../shared/select/selectors/project-role-select"

interface IPersonDetailsPanelProps {
  person: IProjectPerson
  isSelf?: boolean
  // Three levels: role tags (Expanded on self and Standard), access and
  // contact designation (Full), and re-send (same as invite).
  canEditRoleTags: boolean
  canManageStanding: boolean
  canResend: boolean
  canRemove: boolean
  primaryContactName?: string | null
  alternateContactNames?: string[]
  isSaving: boolean
  onClose: () => void
  onSave: (changes: {
    roleTags?: string[]
    contactDesignation?: EProjectContactDesignation
    access?: EProjectAccess
  }) => void
  onReinvite?: () => Promise<boolean>
  onRemove: () => void
}

type TPanelView = "summary" | "role" | "contact" | "access" | "resend"

const SectionDivider = () => (
  <Box as="hr" w="full" flexShrink={0} my={0} border="0" borderTop="1px solid" borderColor="border.light" />
)

const sectionTitleProps = { fontWeight: "bold", fontSize: "lg", lineHeight: "short" } as const

const sameTags = (left: string[], right: string[]) => {
  if (left.length !== right.length) return false
  const rightTags = new Set(right)
  return left.every((tag) => rightTags.has(tag))
}

const BackLink = ({ onClick }: { onClick: () => void }) => {
  const { t } = useTranslation()

  return (
    <Button
      variant="link"
      leftIcon={<CaretLeft size={20} />}
      onClick={onClick}
      alignSelf="flex-start"
      fontWeight="normal"
      fontSize="md"
      color="text.link"
      textDecoration="none"
      h="auto"
      minH={0}
      px={0}
      mb={3}
      iconSpacing={0.5}
    >
      {t("ui.back")}
    </Button>
  )
}

const EditorFooter = ({
  onCancel,
  onSave,
  isSaving,
}: {
  onCancel: () => void
  onSave: () => void
  isSaving: boolean
}) => {
  const { t } = useTranslation()

  return (
    <Flex
      flexShrink={0}
      align="center"
      gap={4}
      px={6}
      py={4}
      borderTop="1px solid"
      borderColor="border.light"
      bg="greys.white"
    >
      <Button variant="secondary" onClick={onCancel} isDisabled={isSaving}>
        {t("ui.cancel")}
      </Button>
      <Button variant="primary" onClick={onSave} isDisabled={isSaving}>
        {t("ui.onlySave")}
      </Button>
    </Flex>
  )
}

const RoleEditor = ({
  draftRoles,
  isSaving,
  onBack,
  onDraftRolesChange,
}: {
  draftRoles: string[]
  isSaving: boolean
  onBack: () => void
  onDraftRolesChange: (roleTags: string[]) => void
}) => {
  const { t } = useTranslation()

  return (
    <VStack align="stretch" spacing={0}>
      <BackLink onClick={onBack} />
      <Text {...sectionTitleProps} mb={2}>
        {t("permitProject.people.projectRole")}
      </Text>
      <Text fontSize="lg" mb={4}>
        {t("permitProject.people.selectAllThatApply")}
      </Text>
      <ProjectRoleSelect roleTags={draftRoles} isDisabled={isSaving} onChange={onDraftRolesChange} />
    </VStack>
  )
}

const ContactEditor = ({
  personName,
  currentDesignation,
  draftContact,
  primaryContactName,
  alternateContactNames = [],
  isSaving,
  onBack,
  onDraftContactChange,
}: {
  personName: string
  currentDesignation: EProjectContactDesignation
  draftContact: EProjectContactDesignation
  primaryContactName?: string | null
  alternateContactNames?: string[]
  isSaving: boolean
  onBack: () => void
  onDraftContactChange: (designation: EProjectContactDesignation) => void
}) => {
  const { t } = useTranslation()
  const replacingPrimary =
    draftContact === EProjectContactDesignation.primary &&
    currentDesignation !== EProjectContactDesignation.primary &&
    !!primaryContactName
  const contactName = (name?: string | null) => name || t("permitProject.people.notAssigned")

  return (
    <VStack align="stretch" spacing={0}>
      <BackLink onClick={onBack} />
      <Text {...sectionTitleProps} mb={2}>
        {t("permitProject.people.projectContacts")}
      </Text>
      <Text fontSize="md" lineHeight="1.68">
        {t("permitProject.people.projectContactsDescription")}
      </Text>
      <VStack align="stretch" spacing={2} pt={4}>
        <Box>
          <Text fontWeight="bold" fontSize="md">
            {t("permitProject.people.primaryContact")}
          </Text>
          <Text fontSize="md">{contactName(primaryContactName)}</Text>
        </Box>
        <Box>
          <Text fontWeight="bold" fontSize="md">
            {t("permitProject.people.alternateContact")}
          </Text>
          {alternateContactNames.length > 0 ? (
            alternateContactNames.map((name, index) => (
              <Text key={`${name}-${index}`} fontSize="md">
                {name}
              </Text>
            ))
          ) : (
            <Text fontSize="md">{t("permitProject.people.notAssigned")}</Text>
          )}
        </Box>
      </VStack>
      <RadioGroup
        value={draftContact}
        isDisabled={isSaving}
        onChange={(value) => onDraftContactChange(value as EProjectContactDesignation)}
      >
        <VStack align="stretch" spacing={2.5} pt={4}>
          <Text fontWeight="bold" fontSize="lg">
            {t("permitProject.people.contactQuestion")}
          </Text>
          <Radio value={EProjectContactDesignation.primary} size="lg">
            <Text fontSize="lg">{t("permitProject.people.contactYesPrimary")}</Text>
          </Radio>
          <Radio value={EProjectContactDesignation.alternate} size="lg">
            <Text fontSize="lg">{t("permitProject.people.contactYesAlternate")}</Text>
          </Radio>
          <Radio value={EProjectContactDesignation.none} size="lg">
            <Text fontSize="lg">{t("ui.no")}</Text>
          </Radio>
        </VStack>
      </RadioGroup>
      {replacingPrimary && (
        <CustomMessageBox status={EFlashMessageStatus.warning} mt={4}>
          <Text fontSize="md">
            {t("permitProject.people.replacePrimaryContact", {
              name: personName,
              existing: primaryContactName,
            })}
          </Text>
        </CustomMessageBox>
      )}
    </VStack>
  )
}

const AccessEditor = ({
  draftAccess,
  isSaving,
  onBack,
  onDraftAccessChange,
}: {
  draftAccess: EProjectAccess | null
  isSaving: boolean
  onBack: () => void
  onDraftAccessChange: (access: EProjectAccess) => void
}) => {
  const { t } = useTranslation()

  return (
    <VStack align="stretch" spacing={0}>
      <BackLink onClick={onBack} />
      <Text {...sectionTitleProps} mb={2}>
        {t("permitProject.people.projectAccess")}
      </Text>
      <Text fontSize="md" lineHeight="1.68">
        {t("permitProject.people.accessIntro")}{" "}
        <RouterLink to="/compare-access-levels" color="text.link">
          {t("permitProject.people.compareAccessLevels")}
        </RouterLink>
      </Text>
      <RadioGroup
        value={draftAccess ?? ""}
        isDisabled={isSaving}
        onChange={(value) => onDraftAccessChange(value as EProjectAccess)}
      >
        <VStack align="stretch" spacing={2} pt={4}>
          {Object.values(EProjectAccess).map((access) => {
            const selected = draftAccess === access
            return (
              <Box
                key={access}
                border="1px solid"
                borderColor={selected ? "semantic.info" : "border.light"}
                bg={selected ? "semantic.infoLight" : "greys.white"}
                borderRadius="sm"
                p={4}
                cursor="pointer"
                onClick={() => {
                  if (!isSaving) onDraftAccessChange(access)
                }}
              >
                <Radio value={access} alignItems="flex-start" spacing={4} w="full">
                  <Box>
                    <Text fontWeight="bold" fontSize="md">
                      {t(`permitProject.people.access.${access}`)}
                    </Text>
                    <Text fontSize="sm" mt={2}>
                      {t(`permitProject.people.accessChoiceDescription.${access}`)}
                    </Text>
                  </Box>
                </Radio>
              </Box>
            )
          })}
        </VStack>
      </RadioGroup>
    </VStack>
  )
}

export const PersonDetailsPanel = ({
  person,
  isSelf = false,
  canEditRoleTags,
  canManageStanding,
  canResend,
  canRemove,
  primaryContactName,
  alternateContactNames,
  isSaving,
  onClose,
  onSave,
  onReinvite,
  onRemove,
}: IPersonDetailsPanelProps) => {
  const { t } = useTranslation()
  const isActive = person.status === EProjectMembershipStatus.active
  const isExpired = person.status === EProjectMembershipStatus.expired
  const [view, setView] = useState<TPanelView>("summary")
  const [draftRoles, setDraftRoles] = useState<string[]>([])
  const [draftContact, setDraftContact] = useState<EProjectContactDesignation>(person.contactDesignation)
  const [draftAccess, setDraftAccess] = useState<EProjectAccess | null>(person.access)
  const [resent, setResent] = useState(false)

  useEffect(() => {
    setView("summary")
    setResent(false)
  }, [person.id])

  const contactLabel = (designation: EProjectContactDesignation) => {
    if (designation === EProjectContactDesignation.primary) return t("permitProject.people.primaryContact")
    if (designation === EProjectContactDesignation.alternate) return t("permitProject.people.alternateContact")
    return t("permitProject.people.notAProjectContact")
  }

  const openView = (next: Exclude<TPanelView, "summary" | "resend">) => {
    if (next === "role") setDraftRoles([...person.roleTags])
    if (next === "contact") setDraftContact(person.contactDesignation)
    if (next === "access") setDraftAccess(person.access)
    setView(next)
  }

  const openResendView = () => setView("resend")

  const handleSendReinvite = async () => {
    if (!onReinvite) return
    const ok = await onReinvite()
    if (ok) {
      setResent(true)
      setView("summary")
    }
  }

  const backToSummary = () => setView("summary")

  const save = async () => {
    if (view === "role" && !sameTags(draftRoles, person.roleTags)) {
      await Promise.resolve(onSave({ roleTags: draftRoles }))
    }
    if (view === "contact" && draftContact !== person.contactDesignation) {
      await Promise.resolve(onSave({ contactDesignation: draftContact }))
    }
    if (view === "access" && draftAccess && draftAccess !== person.access) {
      await Promise.resolve(onSave({ access: draftAccess }))
    }
    setView("summary")
  }

  const changeButton = (next: Exclude<TPanelView, "summary" | "resend">, canChange: boolean) =>
    canChange ? (
      <Button
        variant="link"
        size="sm"
        h="auto"
        minH={0}
        px={0}
        alignSelf="flex-start"
        textDecoration="none"
        isDisabled={isSaving}
        onClick={() => openView(next)}
      >
        {t("ui.change")}
      </Button>
    ) : null

  return (
    <Flex
      as="aside"
      direction="column"
      w="360px"
      flexShrink={0}
      h="full"
      minH={0}
      overflow="hidden"
      borderLeft="1px solid"
      borderColor="border.light"
      bg="greys.white"
    >
      <Flex
        align="center"
        justify="space-between"
        gap={3}
        px={6}
        py={5}
        flexShrink={0}
        borderBottom="1px solid"
        borderColor="border.light"
      >
        <Flex align="center" gap={3} minW={0}>
          <Avatar name={person.name} size="md" bg="semantic.warningLight" color="text.primary" />
          <Text fontWeight="bold" fontSize="lg" noOfLines={2}>
            {person.name}
          </Text>
        </Flex>
        <IconButton aria-label={t("ui.close")} icon={<X />} variant="ghost" onClick={onClose} />
      </Flex>

      <Box flex={1} minH={0} overflowY="auto" px={6} py={6}>
        {view === "summary" && (
          <VStack align="stretch" spacing={6}>
            {resent && (
              <CustomMessageBox
                status={EFlashMessageStatus.success}
                title={t("permitProject.people.inviteResentTitle")}
                description={t("permitProject.people.inviteResentDescription", { name: person.name })}
              />
            )}

            {!isActive && (
              <CustomMessageBox status={isExpired ? EFlashMessageStatus.error : EFlashMessageStatus.info}>
                <Text as="div" fontSize="md">
                  {t(isExpired ? "permitProject.people.invitationExpired" : "permitProject.people.invitationSent")}{" "}
                  {canResend && onReinvite && (
                    <Button
                      variant="link"
                      size="sm"
                      h="auto"
                      minH={0}
                      px={0}
                      fontWeight="normal"
                      textDecoration="underline"
                      onClick={openResendView}
                    >
                      {t(isExpired ? "permitProject.people.sendNewInvite" : "permitProject.people.resendInvite")}
                    </Button>
                  )}
                </Text>
              </CustomMessageBox>
            )}

            <Box>
              <Text {...sectionTitleProps} mb={3}>
                {t("permitProject.people.personalDetails")}
              </Text>
              {isActive ? (
                <VStack align="stretch" spacing={3}>
                  <Box as="dl">
                    {(
                      [
                        { label: t("permitProject.people.personalDetailsFields.name"), value: person.name },
                        {
                          label: t("permitProject.people.personalDetailsFields.organization"),
                          value: person.organization,
                        },
                      ] as const
                    ).map((item) => (
                      <Box key={item.label} mb={2}>
                        <Text as="dt" fontSize="xs" fontWeight="bold" color="text.secondary">
                          {item.label}
                        </Text>
                        <Text as="dd" fontSize="md">
                          {item.value || t("ui.notProvided")}
                        </Text>
                      </Box>
                    ))}
                  </Box>
                  <Text fontSize="sm" color="text.secondary">
                    {isSelf ? (
                      <>
                        {t("permitProject.people.personalDetailsSelfPrefix")}
                        <RouterLink to="/profile" color="text.link">
                          {t("permitProject.people.personalDetailsSelfLink")}
                        </RouterLink>
                        .
                      </>
                    ) : (
                      t("permitProject.people.personalDetailsOtherNote")
                    )}
                  </Text>
                </VStack>
              ) : (
                <Text fontSize="md">{t("permitProject.people.personalDetailsPlaceholder")}</Text>
              )}
            </Box>

            <Box>
              <Text fontWeight="bold" fontSize="md" mb={3}>
                {t("permitProject.people.status")}
              </Text>
              <VStack align="stretch" spacing={3}>
                <Text fontSize="md">
                  {isActive
                    ? t("permitProject.people.statusActive")
                    : isExpired
                      ? t("permitProject.people.statusExpired")
                      : t("permitProject.people.statusPending")}
                </Text>
                {!isActive && canResend && onReinvite && (
                  <Button
                    variant="link"
                    size="sm"
                    h="auto"
                    minH={0}
                    px={0}
                    alignSelf="flex-start"
                    textDecoration="none"
                    onClick={openResendView}
                  >
                    {t("permitProject.people.resendInvite")}
                  </Button>
                )}
              </VStack>
            </Box>

            <SectionDivider />

            <Box>
              <Text {...sectionTitleProps} mb={3}>
                {t("permitProject.people.projectRole")}
              </Text>
              <VStack align="stretch" spacing={3}>
                <Text fontSize="md">{person.roleTags.join(", ") || t("ui.notProvided")}</Text>
                {changeButton("role", canEditRoleTags)}
              </VStack>
            </Box>

            <SectionDivider />

            <Box>
              <Text {...sectionTitleProps} mb={3}>
                {t("permitProject.people.projectContact")}
              </Text>
              <VStack align="stretch" spacing={3}>
                <Text fontSize="md">{contactLabel(person.contactDesignation)}</Text>
                {changeButton("contact", canManageStanding)}
              </VStack>
            </Box>

            <SectionDivider />

            <Box>
              <Text {...sectionTitleProps} mb={3}>
                {t("permitProject.people.projectAccess")}
              </Text>
              <VStack align="stretch" spacing={3}>
                {person.access && <ProjectAccessTag access={person.access} alignSelf="flex-start" />}
                {person.access && (
                  <Text fontSize="md">{t(`permitProject.people.accessDescription.${person.access}`)}</Text>
                )}
                {person.access && (
                  <RouterLink to="/compare-access-levels" color="text.link" fontSize="md" alignSelf="flex-start">
                    {t("permitProject.people.compareAccessLevels")}
                  </RouterLink>
                )}
                {changeButton("access", canManageStanding)}
              </VStack>
            </Box>

            <Box>
              <Text fontWeight="bold" fontSize="md">
                {t("permitProject.people.additionalAccess")}
              </Text>
              <Text fontSize="sm" color="text.secondary" mt={2.5}>
                {t("permitProject.people.additionalAccessPlaceholder")}
              </Text>
            </Box>

            {canRemove && (
              <>
                <SectionDivider />
                <Box>
                  <Text {...sectionTitleProps} mb={3}>
                    {t("permitProject.people.removePerson")}
                  </Text>
                  <VStack align="stretch" spacing={3}>
                    <Text fontSize="md">{t("permitProject.people.removePersonDescription")}</Text>
                    <ConfirmationModal
                      promptHeader={t("permitProject.people.removeConfirmTitle")}
                      promptMessage={t("permitProject.people.removeConfirmBody")}
                      confirmText={t("permitProject.people.removeFromProject")}
                      confirmButtonBg="semantic.error"
                      onConfirm={onRemove}
                      renderTrigger={(onOpen) => (
                        <Button
                          variant="link"
                          size="sm"
                          h="auto"
                          minH={0}
                          px={0}
                          alignSelf="flex-start"
                          textDecoration="none"
                          onClick={onOpen}
                          isDisabled={isSaving}
                        >
                          {t("permitProject.people.removeFromProject")}
                        </Button>
                      )}
                    />
                  </VStack>
                </Box>
              </>
            )}
          </VStack>
        )}

        {view === "resend" && (
          <VStack align="stretch" spacing={5}>
            <BackLink onClick={backToSummary} />
            <Text {...sectionTitleProps}>{t("permitProject.people.resendPanel.title")}</Text>
            <Text fontSize="md">
              {t("permitProject.people.resendPanel.description", {
                firstName: person.firstName || person.name,
              })}
            </Text>
          </VStack>
        )}

        {view === "role" && (
          <RoleEditor
            draftRoles={draftRoles}
            isSaving={isSaving}
            onBack={backToSummary}
            onDraftRolesChange={setDraftRoles}
          />
        )}
        {view === "contact" && (
          <ContactEditor
            personName={person.name}
            currentDesignation={person.contactDesignation}
            draftContact={draftContact}
            primaryContactName={primaryContactName}
            alternateContactNames={alternateContactNames}
            isSaving={isSaving}
            onBack={backToSummary}
            onDraftContactChange={setDraftContact}
          />
        )}
        {view === "access" && (
          <AccessEditor
            draftAccess={draftAccess}
            isSaving={isSaving}
            onBack={backToSummary}
            onDraftAccessChange={setDraftAccess}
          />
        )}
      </Box>

      {view === "resend" && (
        <Flex
          flexShrink={0}
          align="center"
          gap={4}
          px={6}
          py={4}
          borderTop="1px solid"
          borderColor="border.light"
          bg="greys.white"
        >
          <Button variant="secondary" onClick={backToSummary} isDisabled={isSaving}>
            {t("ui.cancel")}
          </Button>
          <Button variant="primary" onClick={handleSendReinvite} isLoading={isSaving}>
            {t("permitProject.people.resendPanel.send")}
          </Button>
        </Flex>
      )}

      {view !== "summary" && view !== "resend" && <EditorFooter onCancel={onClose} onSave={save} isSaving={isSaving} />}
    </Flex>
  )
}
