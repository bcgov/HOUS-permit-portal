import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  Input,
  Link,
  ListItem,
  Radio,
  RadioGroup,
  SimpleGrid,
  Text,
  UnorderedList,
  VStack,
} from "@chakra-ui/react"
import { CaretLeft } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { IPermitProject } from "../../../models/permit-project"
import { useMst } from "../../../setup/root"
import { EFlashMessageStatus, EProjectAccess, EProjectContactDesignation } from "../../../types/enums"
import { CustomMessageBox } from "../../shared/base/custom-message-box"
import { RouterLink } from "../../shared/navigation/router-link"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import { ProjectAccessTag } from "../../shared/permit-projects/project-access-tag"
import { ProjectRoleSelect } from "../../shared/select/selectors/project-role-select"

interface IAddProjectPersonFormProps {
  permitProject: IPermitProject
}

interface IAddProjectPersonFormValues {
  firstName: string
  lastName: string
  email: string
  roleTags: string[]
  contactDesignation: EProjectContactDesignation | ""
  access: EProjectAccess | ""
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const SectionDivider = () => <Box as="hr" w="full" my={0} border="0" borderTop="1px solid" borderColor="border.light" />

export const AddProjectPersonForm = observer(({ permitProject }: IAddProjectPersonFormProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { projectPeopleStore } = useMst()
  const { primaryContactName, alternateContactNames, createProjectPerson, search } = projectPeopleStore

  useEffect(() => {
    if (!primaryContactName) {
      search()
    }
  }, [permitProject.id])

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<IAddProjectPersonFormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      roleTags: [],
      contactDesignation: "",
      access: "",
    },
  })

  const peoplePath = `/projects/${permitProject.id}/people`

  const onSubmit = async (values: IAddProjectPersonFormValues) => {
    if (!values.contactDesignation || !values.access) return

    const created = await createProjectPerson({
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      roleTags: values.roleTags,
      contactDesignation: values.contactDesignation,
      access: values.access,
    })

    if (created) {
      navigate(peoplePath)
    }
  }

  const errorEntries = [
    errors.firstName && { id: "add-person-first-name", message: errors.firstName.message },
    errors.lastName && { id: "add-person-last-name", message: errors.lastName.message },
    errors.email && { id: "add-person-email", message: errors.email.message },
    errors.contactDesignation && { id: "add-person-contact-designation", message: errors.contactDesignation.message },
    errors.access && { id: "add-person-access", message: errors.access.message },
  ].filter(Boolean) as { id: string; message?: string }[]

  const resolvedPrimaryName = primaryContactName || permitProject.ownerName || t("permitProject.people.notAssigned")
  const resolvedAlternateNames =
    alternateContactNames.length > 0 ? alternateContactNames.join(", ") : t("permitProject.people.notAssigned")

  return (
    <Flex direction="column" flex={1} minW={0} h="full" minH={0} overflowY="auto" bg="greys.white" p={10}>
      <Box as="form" onSubmit={handleSubmit(onSubmit)} noValidate maxW="640px" w="full">
        <VStack align="stretch" spacing={8}>
          <VStack align="flex-start" spacing={3}>
            <RouterLinkButton
              to={peoplePath}
              variant="link"
              leftIcon={<CaretLeft size={16} />}
              px={0}
              color="text.link"
            >
              {t("permitProject.details.people")}
            </RouterLinkButton>
            <Heading as="h2" size="lg" mb={0}>
              {t("permitProject.people.addPersonTitle")}
            </Heading>
            <Text color="text.secondary">{t("permitProject.people.addPersonDescription")}</Text>
          </VStack>

          {isSubmitted && errorEntries.length > 0 && (
            <CustomMessageBox
              status={EFlashMessageStatus.error}
              title={t("permitProject.people.missingRequiredFieldsTitle")}
            >
              <UnorderedList pl={4} spacing={1}>
                {errorEntries.map((entry) => (
                  <ListItem key={entry.id}>
                    <Link
                      href={`#${entry.id}`}
                      color="text.link"
                      textDecoration="underline"
                      onClick={(event) => {
                        event.preventDefault()
                        document.getElementById(entry.id)?.focus()
                      }}
                    >
                      {entry.message}
                    </Link>
                  </ListItem>
                ))}
              </UnorderedList>
            </CustomMessageBox>
          )}

          <VStack align="stretch" spacing={4}>
            <Heading as="h3" size="md" mb={0}>
              {t("permitProject.people.contactInformation")}
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isInvalid={Boolean(errors.firstName)}>
                <FormLabel htmlFor="add-person-first-name">{t("permitProject.people.firstName")}</FormLabel>
                <Input
                  id="add-person-first-name"
                  bg="greys.white"
                  {...register("firstName", {
                    validate: (value) => value.trim().length > 0 || t("permitProject.people.firstNameRequired"),
                  })}
                />
                <FormErrorMessage>{errors.firstName?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={Boolean(errors.lastName)}>
                <FormLabel htmlFor="add-person-last-name">{t("permitProject.people.lastName")}</FormLabel>
                <Input
                  id="add-person-last-name"
                  bg="greys.white"
                  {...register("lastName", {
                    validate: (value) => value.trim().length > 0 || t("permitProject.people.lastNameRequired"),
                  })}
                />
                <FormErrorMessage>{errors.lastName?.message}</FormErrorMessage>
              </FormControl>
            </SimpleGrid>

            <FormControl isInvalid={Boolean(errors.email)}>
              <FormLabel htmlFor="add-person-email">{t("permitProject.people.email")}</FormLabel>
              <Input
                id="add-person-email"
                type="email"
                bg="greys.white"
                {...register("email", {
                  validate: (value) => EMAIL_PATTERN.test(value.trim()) || t("permitProject.people.emailRequired"),
                })}
              />
              <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
            </FormControl>
          </VStack>

          <SectionDivider />

          <VStack align="stretch" spacing={3}>
            <Box>
              <Heading as="h3" size="md" mb={1}>
                {t("permitProject.people.projectRolesOptional")}
              </Heading>
              <Text fontSize="sm" color="text.secondary">
                {t("permitProject.people.projectRolesDescription")}
              </Text>
            </Box>
            <Controller
              name="roleTags"
              control={control}
              render={({ field }) => <ProjectRoleSelect roleTags={field.value} onChange={field.onChange} />}
            />
          </VStack>

          <SectionDivider />

          <VStack align="stretch" spacing={4}>
            <Box>
              <Heading as="h3" size="md" mb={1}>
                {t("permitProject.people.projectContacts")}
              </Heading>
              <Text fontSize="md" color="text.secondary">
                {t("permitProject.people.projectContactsDescription")}
              </Text>
            </Box>

            <VStack
              align="stretch"
              spacing={2}
              p={4}
              bg="greys.grey03"
              borderRadius="md"
              border="1px solid"
              borderColor="border.light"
            >
              <Flex justify="space-between" gap={4}>
                <Text fontWeight="bold" fontSize="sm">
                  {t("permitProject.people.primaryContact")}
                </Text>
                <Text fontSize="sm">{resolvedPrimaryName}</Text>
              </Flex>
              <Flex justify="space-between" gap={4}>
                <Text fontWeight="bold" fontSize="sm">
                  {t("permitProject.people.alternateContact")}
                </Text>
                <Text fontSize="sm">{resolvedAlternateNames}</Text>
              </Flex>
            </VStack>

            <Controller
              name="contactDesignation"
              control={control}
              rules={{ required: t("permitProject.people.contactDesignationRequired") }}
              render={({ field }) => (
                <FormControl as="fieldset" isInvalid={Boolean(errors.contactDesignation)}>
                  <FormLabel as="legend" fontWeight="bold" mb={2}>
                    {t("permitProject.people.makeProjectContactPrompt")}
                  </FormLabel>
                  <RadioGroup value={field.value} onChange={field.onChange}>
                    <VStack align="flex-start" spacing={2}>
                      <Radio id="add-person-contact-designation" value={EProjectContactDesignation.primary}>
                        {t("permitProject.people.contactChoicePrimary")}
                      </Radio>
                      <Radio value={EProjectContactDesignation.alternate}>
                        {t("permitProject.people.contactChoiceAlternate")}
                      </Radio>
                      <Radio value={EProjectContactDesignation.none}>
                        {t("permitProject.people.contactChoiceNone")}
                      </Radio>
                    </VStack>
                  </RadioGroup>
                  <FormErrorMessage>{errors.contactDesignation?.message}</FormErrorMessage>
                </FormControl>
              )}
            />
          </VStack>

          <SectionDivider />

          <VStack align="stretch" spacing={4}>
            <Box>
              <Heading as="h3" size="md" mb={1}>
                {t("permitProject.people.projectAccess")}
              </Heading>
              <Text fontSize="md" color="text.secondary">
                {t("permitProject.people.projectAccessDescription")}{" "}
                <RouterLink to="/compare-access-levels" color="text.link">
                  {t("permitProject.people.compareAccessLevels")}
                </RouterLink>
              </Text>
            </Box>

            <Controller
              name="access"
              control={control}
              rules={{ required: t("permitProject.people.accessRequired") }}
              render={({ field }) => (
                <FormControl as="fieldset" isInvalid={Boolean(errors.access)}>
                  <RadioGroup value={field.value} onChange={field.onChange}>
                    <VStack align="stretch" spacing={3}>
                      {Object.values(EProjectAccess).map((access, idx) => {
                        const isSelected = field.value === access
                        return (
                          <Box
                            key={access}
                            as="label"
                            cursor="pointer"
                            p={4}
                            borderRadius="md"
                            border="1px solid"
                            borderColor={isSelected ? "theme.blue" : "border.light"}
                            bg={isSelected ? "semantic.infoLight" : "greys.white"}
                          >
                            <Radio
                              id={idx === 0 ? "add-person-access" : undefined}
                              value={access}
                              alignItems="flex-start"
                              w="full"
                            >
                              <VStack align="flex-start" spacing={1.5} ml={1}>
                                <ProjectAccessTag access={access} />
                                <Text fontSize="sm" color="text.primary">
                                  {t(`permitProject.people.formAccessDescription.${access}`)}
                                </Text>
                              </VStack>
                            </Radio>
                          </Box>
                        )
                      })}
                    </VStack>
                  </RadioGroup>
                  <FormErrorMessage>{errors.access?.message}</FormErrorMessage>
                </FormControl>
              )}
            />
          </VStack>

          <HStack spacing={3} pt={2}>
            <Button variant="secondary" onClick={() => navigate(peoplePath)} isDisabled={isSubmitting}>
              {t("ui.cancel")}
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              {t("permitProject.people.addPersonSubmit")}
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Flex>
  )
})
