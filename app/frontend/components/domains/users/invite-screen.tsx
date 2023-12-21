import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  Select,
  Tag,
  Text,
} from "@chakra-ui/react"
import { faCircleCheck, faCircleExclamation, faClose, faPaperPlane, faPlus } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { observer } from "mobx-react-lite"
import React from "react"
import { Controller, FormProvider, useFieldArray, useForm, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { EMAIL_REGEX } from "../../../constants"
import { useJurisdiction } from "../../../hooks/resources/use-jurisdiction"
import { useMst } from "../../../setup/root"
import { EUserRoles } from "../../../types/enums"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { RouterLink } from "../../shared/navigation/router-link"

interface IInviteScreenProps {}

type TFormData = {
  users: { firstName?: string; lastName?: string; email?: string; role: EUserRoles; jurisdictionId: string }[]
}

export const InviteScreen = observer(({}: IInviteScreenProps) => {
  const { t } = useTranslation()
  const { jurisdiction, error } = useJurisdiction()
  const {
    userStore: { invite },
  } = useMst()

  const defaultUserValues = {
    role: EUserRoles.reviewManager,
    jurisdictionId: jurisdiction?.id,
  }

  const formMethods = useForm<TFormData>({
    mode: "onChange",
    defaultValues: {
      users: [defaultUserValues],
    },
  })

  const { handleSubmit, formState, control } = formMethods

  const { fields, append, remove } = useFieldArray({
    control,
    name: "users",
  })

  const { isSubmitting } = formState

  const onSubmit = async (formData) => {
    invite(formData)
  }

  const navigate = useNavigate()

  if (!jurisdiction) {
    return (
      <Flex as="main" w="full" bg="greys.white">
        <SharedSpinner />
      </Flex>
    )
  }

  return (
    <Flex direction="column" w="full" bg="greys.white">
      <Container maxW="container.lg" py={16} px={8}>
        <Flex direction="column" gap={8}>
          <Flex direction="column">
            <Heading as="h1">{t("user.inviteTitle")}</Heading>
            <Text>
              {t("user.inviteInstructions")} <RouterLink to="#">{t("user.rolesAndPermissions")}</RouterLink>
            </Text>
          </Flex>
          <Heading fontSize="2xl">{jurisdiction.name}</Heading>
          <FormProvider {...formMethods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Flex direction="column" gap={6}>
                <Flex direction="column" gap={4}>
                  {fields.map((field, index) => (
                    <UserInput key={field.id} index={index} remove={remove} />
                  ))}
                  <Button
                    type="button"
                    variant="tertiary"
                    onClick={() => append(defaultUserValues)}
                    leftIcon={<FontAwesomeIcon style={{ height: 14, width: 14 }} icon={faPlus} />}
                  >
                    {t("user.addUser")}
                  </Button>
                </Flex>
                <Flex gap={4}>
                  <Button
                    variant="primary"
                    type="submit"
                    isLoading={isSubmitting}
                    loadingText={t("ui.loading")}
                    rightIcon={<FontAwesomeIcon style={{ height: 14, width: 14 }} icon={faPaperPlane} />}
                  >
                    {t("user.sendInvites")}
                  </Button>
                  <Button variant="secondary" isLoading={isSubmitting} onClick={() => navigate(-1)}>
                    {t("ui.cancel")}
                  </Button>
                </Flex>
              </Flex>
            </form>
          </FormProvider>
        </Flex>
      </Container>
    </Flex>
  )
})

interface INameFormControlProps {
  label: string
  index: number
  subFieldName: string
}

const NameFormControl = ({ label, index, subFieldName }: INameFormControlProps) => {
  const { register, formState } = useFormContext()
  const { t } = useTranslation()

  return (
    <FormControl isInvalid={!!formState?.errors.users?.[index]?.[subFieldName]} flex={2}>
      <FormLabel>{label}</FormLabel>
      <InputGroup>
        <Flex w="full" direction="column">
          <Input
            bg="greys.white"
            {...register(`users.${index}.${subFieldName}`, {
              validate: {
                satisfiesNameLength: (str) => !str || (str.length >= 2 && str.length < 128) || t("ui.invalidInput"),
              },
            })}
            type={"text"}
          />
        </Flex>
      </InputGroup>
    </FormControl>
  )
}

interface IUserInputProps {
  index: number
  remove: (index: number) => any
}

const UserInput = observer(({ index, remove }: IUserInputProps) => {
  const { register, formState, control, watch } = useFormContext()
  const { t } = useTranslation()

  const emailWatch = watch(`users.${index}.email`)

  const { userStore } = useMst()
  const { invitedEmails, takenEmails } = userStore
  const invited = invitedEmails?.includes(emailWatch)
  const taken = takenEmails?.includes(emailWatch)

  return (
    <Box bg="greys.grey03" p={2} borderRadius="sm">
      <Flex gap={4} align="flex-end">
        <FormControl flex={2}>
          <FormLabel>{t("auth.role")}</FormLabel>
          <Controller
            name={`users.${index}.role`}
            control={control}
            render={({ field }) => (
              <Select bg="greys.white" {...field}>
                <option value="review_manager">Review Manager</option>
                <option value="reviewer">Reviewer</option>
              </Select>
            )}
          />
        </FormControl>
        <FormControl isInvalid={!!formState?.errors?.users?.[index]?.email} flex={3}>
          <FormLabel>{t("auth.emailLabel")}</FormLabel>
          <InputGroup>
            <Flex w="full" direction="column">
              <Input
                bg="greys.white"
                {...register(`users.${index}.email`, {
                  required: true,
                  validate: {
                    matchesEmailRegex: (str) => EMAIL_REGEX.test(str) || t("ui.invalidInput"),
                  },
                })}
                type={"text"}
              />
            </Flex>
          </InputGroup>
        </FormControl>
        <NameFormControl label="First Name (optional)" index={index} subFieldName="firstName" />
        <NameFormControl label="Last Name (optional)" index={index} subFieldName="lastName" />
        {invited && (
          <Tag bg="semantic.successLight" border="1px solid" borderColor="semantic.success" mb={2}>
            <Box color="semantic.success">
              <FontAwesomeIcon style={{ height: 20, width: 20 }} icon={faCircleCheck} /> {t("user.inviteSuccess")}
            </Box>
          </Tag>
        )}
        {taken && (
          <Tag bg="semantic.errorLight" border="1px solid" borderColor="semantic.error" mb={2}>
            <Box color="semantic.error">
              <FontAwesomeIcon style={{ height: 20, width: 20 }} icon={faCircleExclamation} /> {t("user.inviteError")}
            </Box>
          </Tag>
        )}
        {!invited && !taken && (
          <Button
            onClick={() => remove(index)}
            variant="tertiary"
            leftIcon={<FontAwesomeIcon style={{ height: 14, width: 14 }} icon={faClose} />}
          >
            {t("ui.remove")}
          </Button>
        )}
      </Flex>
    </Box>
  )
})
