import {
  Avatar,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react"
import { CaretLeft, X } from "@phosphor-icons/react"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import Select, { components, OptionProps, SingleValueProps, StylesConfig } from "react-select"
import {
  EFlashMessageStatus,
  EProjectAccess,
  EProjectContactDesignation,
  EProjectMembershipStatus,
} from "../../../types/enums"
import { IOption, IProjectPerson } from "../../../types/types"
import { CustomMessageBox } from "../../shared/base/custom-message-box"
import { ConfirmationModal } from "../../shared/modals/confirmation-modal"
import { RouterLink } from "../../shared/navigation/router-link"
import { ProjectAccessTag } from "../../shared/permit-projects/project-access-tag"
import { ProjectRoleSelect } from "../../shared/select/selectors/project-role-select"

interface IContactOption extends IOption<EProjectContactDesignation> {
  isDisabled?: boolean
}

interface IPersonDetailsPanelProps {
  person: IProjectPerson
  isSelf?: boolean
  canEdit: boolean
  canRemove: boolean
  primaryContactName?: string | null
  isSaving: boolean
  onClose: () => void
  onSave: (changes: {
    roleTags?: string[]
    contactDesignation?: EProjectContactDesignation
    access?: EProjectAccess
  }) => void
  onReinvite?: (email?: string) => Promise<boolean>
  onRemove: () => void
}

type TEditableField = "role" | "contact" | "access"

const AccessOption = (props: OptionProps<IOption<EProjectAccess>, false>) => (
  <components.Option {...props}>
    <ProjectAccessTag access={props.data.value} />
  </components.Option>
)

const AccessValue = (props: SingleValueProps<IOption<EProjectAccess>, false>) => (
  <components.SingleValue {...props}>
    <ProjectAccessTag access={props.data.value} />
  </components.SingleValue>
)

const contactSelectStyles: StylesConfig<IContactOption, false> = {
  control: (css, state) => ({
    ...css,
    borderColor: state.isFocused ? "var(--chakra-colors-focus)" : "var(--chakra-colors-border-light)",
    borderRadius: "6px",
    minHeight: "var(--chakra-sizes-10)",
    boxShadow: "none",
    fontSize: "var(--chakra-fontSizes-sm)",
    ":hover": {
      borderColor: "var(--chakra-colors-border-base)",
    },
  }),
  menuPortal: (css) => ({
    ...css,
    zIndex: 10,
  }),
  option: (css, state) => ({
    ...css,
    cursor: state.isDisabled ? "not-allowed" : "pointer",
    color: "var(--chakra-colors-text-primary)",
    backgroundColor: state.isFocused ? "var(--chakra-colors-semantic-infoLight)" : undefined,
  }),
}

const SectionDivider = () => (
  <Box as="hr" w="full" flexShrink={0} my={0} border="0" borderTop="1px solid" borderColor="border.light" />
)

const sectionTitleProps = { fontWeight: "bold", fontSize: "lg", lineHeight: "short" } as const

export const PersonDetailsPanel = ({
  person,
  isSelf = false,
  canEdit,
  canRemove,
  primaryContactName,
  isSaving,
  onClose,
  onSave,
  onReinvite,
  onRemove,
}: IPersonDetailsPanelProps) => {
  const { t } = useTranslation()
  const openPrimaryConfirm = useRef<(() => void) | null>(null)
  const isActive = person.status === EProjectMembershipStatus.active
  const isExpired = person.status === EProjectMembershipStatus.expired
  const isPrimaryContact = isActive && person.contactDesignation === EProjectContactDesignation.primary
  const [openField, setOpenField] = useState<TEditableField | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isResendingView, setIsResendingView] = useState(false)
  const [resendEmail, setResendEmail] = useState("")
  const [resentToEmail, setResentToEmail] = useState<string | null>(null)
  const fieldsDisabled = !canEdit || isSaving

  useEffect(() => {
    setOpenField(null)
    setMenuOpen(false)
    setIsResendingView(false)
    setResentToEmail(null)
  }, [person.id])

  useEffect(() => {
    if (!openField) {
      setMenuOpen(false)
      return
    }

    const timeoutId = window.setTimeout(() => setMenuOpen(true), 0)
    return () => window.clearTimeout(timeoutId)
  }, [openField])

  const closeEditor = () => {
    setMenuOpen(false)
    setOpenField(null)
  }

  const openResendView = () => {
    setResendEmail("")
    setIsResendingView(true)
  }

  const handleSendReinvite = async () => {
    if (!onReinvite) return
    const trimmed = resendEmail.trim()
    if (!trimmed) return
    const ok = await onReinvite(trimmed)
    if (ok) {
      setResentToEmail(trimmed)
      setIsResendingView(false)
    }
  }

  const contactOptions = useMemo<IContactOption[]>(
    () => [
      { value: EProjectContactDesignation.none, label: t("permitProject.people.notAProjectContact") },
      { value: EProjectContactDesignation.alternate, label: t("permitProject.people.alternateContact") },
      { value: EProjectContactDesignation.primary, label: t("permitProject.people.primaryContact") },
    ],
    [t]
  )
  const contactValue = contactOptions.find((option) => option.value === person.contactDesignation) ?? null
  const accessOptions = useMemo<IOption<EProjectAccess>[]>(
    () =>
      Object.values(EProjectAccess).map((access) => ({
        value: access,
        label: t(`permitProject.people.access.${access}`),
      })),
    [t]
  )
  const accessValue = accessOptions.find((option) => option.value === person.access) ?? null
  const menuIsOpen = (field: TEditableField) => openField === field && menuOpen

  const changeButton = (field: TEditableField) =>
    canEdit ? (
      <Button
        variant="link"
        size="sm"
        h="auto"
        minH={0}
        px={0}
        alignSelf="flex-start"
        textDecoration="none"
        isDisabled={isSaving}
        onClick={() => setOpenField(field)}
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

      {isResendingView ? (
        <>
          <VStack align="stretch" spacing={5} flex={1} minH={0} overflowY="auto" px={6} py={6}>
            <Button
              variant="link"
              size="sm"
              leftIcon={<CaretLeft size={16} />}
              alignSelf="flex-start"
              px={0}
              onClick={() => setIsResendingView(false)}
            >
              {t("ui.back")}
            </Button>

            <Text {...sectionTitleProps}>{t("permitProject.people.resendPanel.title")}</Text>

            <Text fontSize="md">
              {t("permitProject.people.resendPanel.description", {
                firstName: person.firstName || person.name,
              })}
            </Text>

            <FormControl>
              <FormLabel htmlFor="resend-invite-email">{t("permitProject.people.email")}</FormLabel>
              <Input
                id="resend-invite-email"
                type="email"
                value={resendEmail}
                onChange={(event) => setResendEmail(event.target.value)}
                isDisabled={isSaving}
              />
            </FormControl>
          </VStack>

          <HStack
            justify="flex-start"
            spacing={3}
            px={6}
            py={4}
            flexShrink={0}
            borderTop="1px solid"
            borderColor="border.light"
          >
            <Button variant="secondary" onClick={() => setIsResendingView(false)} isDisabled={isSaving}>
              {t("ui.cancel")}
            </Button>
            <Button
              variant="primary"
              onClick={handleSendReinvite}
              isLoading={isSaving}
              isDisabled={!resendEmail.trim()}
            >
              {t("permitProject.people.resendPanel.send")}
            </Button>
          </HStack>
        </>
      ) : (
        <VStack align="stretch" spacing={6} flex={1} minH={0} overflowY="auto" px={6} py={6}>
          {resentToEmail && (
            <CustomMessageBox
              status={EFlashMessageStatus.success}
              title={t("permitProject.people.inviteResentTitle")}
              description={t("permitProject.people.inviteResentDescription", { email: resentToEmail })}
            />
          )}

          {!isActive && (
            <CustomMessageBox status={isExpired ? EFlashMessageStatus.error : EFlashMessageStatus.info}>
              <Text as="div" fontSize="md">
                {t(isExpired ? "permitProject.people.invitationExpired" : "permitProject.people.invitationSent")}{" "}
                {canEdit && onReinvite && (
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
                      { label: t("permitProject.people.personalDetailsFields.phone"), value: person.phone },
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
              {!isActive && canEdit && onReinvite && (
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
            {openField === "role" ? (
              <ProjectRoleSelect
                roleTags={person.roleTags}
                isDisabled={fieldsDisabled}
                menuIsOpen={menuIsOpen("role")}
                onMenuClose={() => {
                  if (menuOpen) closeEditor()
                }}
                onChange={(roleTags) => onSave({ roleTags })}
              />
            ) : (
              <VStack align="stretch" spacing={3}>
                <Text fontSize="md">{person.roleTags.join(", ") || t("ui.notProvided")}</Text>
                {changeButton("role")}
              </VStack>
            )}
          </Box>

          <SectionDivider />

          <Box>
            <Text {...sectionTitleProps} mb={3}>
              {t("permitProject.people.projectContact")}
            </Text>
            {openField === "contact" && !isPrimaryContact ? (
              <Select<IContactOption, false>
                autoFocus
                options={contactOptions}
                value={contactValue}
                isDisabled={fieldsDisabled}
                menuIsOpen={menuIsOpen("contact")}
                menuPortalTarget={typeof document === "undefined" ? undefined : document.body}
                menuPosition="fixed"
                styles={contactSelectStyles}
                onMenuClose={() => {
                  if (menuOpen) closeEditor()
                }}
                onChange={(option) => {
                  if (!option || option.value === person.contactDesignation) return
                  if (isActive && option.value === EProjectContactDesignation.primary) {
                    closeEditor()
                    openPrimaryConfirm.current?.()
                    return
                  }
                  onSave({ contactDesignation: option.value })
                  closeEditor()
                }}
              />
            ) : (
              <VStack align="stretch" spacing={3}>
                <Text fontSize="md">{contactValue?.label}</Text>
                {canEdit && isPrimaryContact ? (
                  <Button
                    variant="link"
                    size="sm"
                    h="auto"
                    minH={0}
                    px={0}
                    alignSelf="flex-start"
                    textDecoration="none"
                    isDisabled
                  >
                    {t("ui.change")}
                  </Button>
                ) : (
                  changeButton("contact")
                )}
              </VStack>
            )}
            <ConfirmationModal
              promptHeader={t("permitProject.people.transferPrimaryTitle")}
              promptMessage={t("permitProject.people.transferPrimaryBody", { name: primaryContactName })}
              confirmText={t("permitProject.people.transferPrimaryConfirm")}
              onConfirm={() => onSave({ contactDesignation: EProjectContactDesignation.primary })}
              renderTrigger={(onOpen) => {
                openPrimaryConfirm.current = onOpen
                return null
              }}
            />
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
              {openField === "access" ? (
                <Select<IOption<EProjectAccess>, false>
                  autoFocus
                  options={accessOptions}
                  value={accessValue}
                  isDisabled={fieldsDisabled}
                  menuIsOpen={menuIsOpen("access")}
                  menuPortalTarget={typeof document === "undefined" ? undefined : document.body}
                  menuPosition="fixed"
                  components={{ Option: AccessOption, SingleValue: AccessValue }}
                  styles={contactSelectStyles as StylesConfig<IOption<EProjectAccess>, false>}
                  onMenuClose={() => {
                    if (menuOpen) closeEditor()
                  }}
                  onChange={(option) => {
                    if (!option || option.value === person.access) return
                    onSave({ access: option.value })
                    closeEditor()
                  }}
                />
              ) : (
                changeButton("access")
              )}
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
    </Flex>
  )
}
