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
import { SharedSpinner } from "../shared-spinner"

interface IUserInputProps {
  index: number
  remove?: (index: number) => any
  adminOnly?: boolean
}

export const UserInput = observer(({ index, remove, adminOnly }: IUserInputProps) => {
  const { formState, control, watch } = useFormContext()
  const { isSubmitting } = formState
  const { t } = useTranslation()

  const emailWatch = watch(`users.${index}.email`)

  const { userStore } = useMst()
  const { reinvitedEmails, invitedEmails, takenEmails } = userStore
  const reinvited = reinvitedEmails?.includes(emailWatch)
  const invited = invitedEmails?.includes(emailWatch)
  const taken = takenEmails?.includes(emailWatch)

  return (
    <Flex bg="greys.grey03" p={4} borderRadius="md" flexWrap="wrap">
      <HStack spacing={4} w="full">
        <FormControl>
          <FormLabel>{t("auth.role")}</FormLabel>

          <Controller
            name={`users.${index}.role`}
            control={control}
            rules={{ required: true }} // Inline validation rule
            render={({ field }) => {
              return (
                <>
                  <Select bg="greys.white" placeholder={t("ui.pleaseSelect")} {...field}>
                    {adminOnly ? (
                      <option value={EUserRoles.superAdmin}>{t(`user.roles.${EUserRoles.superAdmin}`)}</option>
                    ) : (
                      <>
                        <option value={EUserRoles.reviewer}>{t(`user.roles.${EUserRoles.reviewer}`)}</option>
                        <option value={EUserRoles.reviewManager}>{t(`user.roles.${EUserRoles.reviewManager}`)}</option>
                        <option value={EUserRoles.regionalReviewManager}>
                          {t(`user.roles.${EUserRoles.regionalReviewManager}`)}
                        </option>
                      </>
                    )}
                  </Select>
                </>
              )
            }}
          />
        </FormControl>
        <EmailFormControl fieldName={`users.${index}.email`} validate required />
        <TextFormControl label={t("user.firstName")} fieldName={`users.${index}.firstName`} required />
        <TextFormControl label={t("user.lastName")} fieldName={`users.${index}.lastName`} required />
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
                  text={t("user.inviteError")}
                  icon={<WarningCircle size={20} />}
                />
              )}
            </>
          )}
          {!invited && !taken && !reinvited && remove && !isSubmitting && (
            <Button onClick={() => remove(index)} variant="tertiary" leftIcon={<X size={16} />}>
              {t("ui.remove")}
            </Button>
          )}
        </Box>
      </HStack>
    </Flex>
  )
})

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
