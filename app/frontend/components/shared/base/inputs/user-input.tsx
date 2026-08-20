import { Box, Button, Flex, FormControl, FormLabel, HStack, Select, Tag, TagProps, Text } from "@chakra-ui/react"
import { CheckCircle, WarningCircle, X } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { ReactNode } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../setup/root"
import { EUserRoles } from "../../../../types/enums"
import { EmailFormControl } from "../../form/email-form-control"
import { TextFormControl } from "../../form/input-form-control"
import { InfoTooltip } from "../../info-tooltip"
import { SharedSpinner } from "../shared-spinner"

export interface IUserInputTypeOption {
  value: string
  label: string
}

interface IUserInputProps {
  index: number
  remove?: (index: number) => any
  adminOnly?: boolean
  // Defaults to user.role (review staff). Pass typeOptions to reuse this row for
  // other invite flows, e.g. project membership.
  typeFieldName?: string
  typeLabel?: string
  typeTooltip?: string
  typeOptions?: IUserInputTypeOption[]
  showNameFields?: boolean
  // Extra fields for one invite flow, e.g. the custom teams a project
  // membership starts on.
  renderAuxiliary?: (index: number) => ReactNode
}

export const UserInput = observer(
  ({
    index,
    remove,
    adminOnly,
    typeFieldName = "role",
    typeLabel,
    typeTooltip,
    typeOptions,
    showNameFields = true,
    renderAuxiliary,
  }: IUserInputProps) => {
    const { formState, control, watch } = useFormContext()
    const { isSubmitting } = formState
    const { t } = useTranslation()

    const emailWatch = watch(`users.${index}.email`)

    const { userStore } = useMst()
    const { reinvitedEmails, invitedEmails, takenEmails, failedEmails } = userStore
    const reinvited = reinvitedEmails?.includes(emailWatch)
    const invited = invitedEmails?.includes(emailWatch)
    const taken = takenEmails?.includes(emailWatch)
    const failed = failedEmails?.includes(emailWatch)

    return (
      <Flex bg="greys.grey03" p={4} borderRadius="md" flexWrap="wrap">
        <HStack spacing={4} w="full">
          <FormControl>
            <HStack spacing={1} align="center" mb={2}>
              <FormLabel mb={0}>{typeLabel || t("auth.role")}</FormLabel>
              {typeTooltip && (
                <InfoTooltip
                  hasArrow
                  placement="top"
                  maxW="320px"
                  whiteSpace="normal"
                  label={typeTooltip}
                  ariaLabel={typeTooltip}
                />
              )}
            </HStack>

            <Controller
              name={`users.${index}.${typeFieldName}`}
              control={control}
              rules={{ required: true }} // Inline validation rule
              render={({ field }) => {
                return (
                  <Select bg="greys.white" {...field}>
                    {/* Native selects can't have a true placeholder; hide the empty
                        option from the list so it only shows when nothing is chosen. */}
                    {!field.value && (
                      <option value="" disabled hidden>
                        {t("ui.pleaseSelect")}
                      </option>
                    )}
                    {typeOptions ? (
                      typeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))
                    ) : adminOnly ? (
                      <option value={EUserRoles.superAdmin}>{t(`user.roles.${EUserRoles.superAdmin}`)}</option>
                    ) : (
                      <>
                        <option value={EUserRoles.reviewer}>{t(`user.roles.${EUserRoles.reviewer}`)}</option>
                        <option value={EUserRoles.reviewManager}>{t(`user.roles.${EUserRoles.reviewManager}`)}</option>
                        <option value={EUserRoles.regionalReviewManager}>
                          {t(`user.roles.${EUserRoles.regionalReviewManager}`)}
                        </option>
                        <option value={EUserRoles.technicalSupport}>
                          {t(`user.roles.${EUserRoles.technicalSupport}`)}
                        </option>
                      </>
                    )}
                  </Select>
                )
              }}
            />
          </FormControl>
          <EmailFormControl fieldName={`users.${index}.email`} validate required />
          {showNameFields && (
            <>
              {/* Names come from IDIR/BCeID on accept; invite-time first/last are optional. */}
              <TextFormControl label={t("user.firstName")} fieldName={`users.${index}.firstName`} />
              <TextFormControl label={t("user.lastName")} fieldName={`users.${index}.lastName`} />
            </>
          )}
          <Box alignSelf="flex-end" minW={150}>
            {isSubmitting ? (
              <SharedSpinner position="relative" top={4} left={5} minW="fit-content" />
            ) : (
              <>
                {reinvited && (
                  <IInviteResultTag
                    bg="semantic.successLight"
                    text={t("user.reinviteSuccess")}
                    icon={<CheckCircle size={20} />}
                  />
                )}
                {invited && (
                  <IInviteResultTag
                    bg="semantic.successLight"
                    text={t("user.inviteSuccess")}
                    icon={<CheckCircle size={20} />}
                  />
                )}
                {taken && (
                  <IInviteResultTag
                    bg="semantic.errorLight"
                    text={t("user.inviteTakenError")}
                    icon={<WarningCircle size={20} />}
                  />
                )}
                {failed && (
                  <IInviteResultTag
                    bg="semantic.errorLight"
                    text={t("user.inviteError")}
                    icon={<WarningCircle size={20} />}
                  />
                )}
              </>
            )}
            {!invited && !taken && !reinvited && !failed && remove && !isSubmitting && (
              <Button onClick={() => remove(index)} variant="tertiary" leftIcon={<X size={16} />}>
                {t("ui.remove")}
              </Button>
            )}
          </Box>
        </HStack>
        {renderAuxiliary && (
          <Box w="full" mt={4}>
            {renderAuxiliary(index)}
          </Box>
        )}
      </Flex>
    )
  }
)

interface IInviteResultTagProps extends TagProps {
  icon: ReactNode
  text: string
}

const IInviteResultTag = ({ bg, icon, text, ...rest }: IInviteResultTagProps) => {
  const color = (bg as string).replace(/Light/g, "")

  return (
    <Tag
      border="1px solid"
      borderColor={color}
      mb={2}
      noOfLines={1}
      bg={bg}
      color={color}
      display="flex"
      alignItems="center"
      gap={2}
      {...rest}
    >
      {icon}
      <Text>{text}</Text>
    </Tag>
  )
}
