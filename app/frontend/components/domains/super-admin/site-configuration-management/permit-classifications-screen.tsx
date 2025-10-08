import {
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Stack,
  Switch,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Textarea,
  useDisclosure,
} from "@chakra-ui/react"
import { Plus } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import CreatableSelect from "react-select/creatable"
import { IActivity, IPermitType } from "../../../../models/permit-classification"
import { useMst } from "../../../../setup/root"
import { EPermitClassificationType } from "../../../../types/enums"
import { PermitClassificationItem } from "./permit-classification-item"

export const PermitClassificationsScreen = observer(function PermitClassificationsScreen() {
  const { t } = useTranslation()
  const tt = t as any
  const i18nPrefix = "siteConfiguration.permitClassifications"
  const { permitClassificationStore, userStore } = useMst()
  const { currentUser } = userStore
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [tabIndex, setTabIndex] = useState(0)

  const [editingId, setEditingId] = useState<string | null>(null)
  type FormValues = {
    type: EPermitClassificationType
    name: string
    code: string
    description?: string
    enabled: boolean
    category?: string
  }

  const getDefaultValues = (type: EPermitClassificationType = EPermitClassificationType.PermitType): FormValues => ({
    type,
    name: "",
    code: "",
    description: "",
    enabled: true,
    category: "",
  })

  const { control, register, handleSubmit, reset, watch } = useForm<FormValues>({
    defaultValues: getDefaultValues(),
  })
  const formType = watch("type")

  useEffect(() => {
    if (!permitClassificationStore.isLoaded) {
      // Super-admin needs all classifications, including disabled ones
      permitClassificationStore.fetchPermitClassifications(false)
    }
  }, [permitClassificationStore.isLoaded])

  const permitTypes = permitClassificationStore.permitTypes as IPermitType[]
  const activities = permitClassificationStore.activities as IActivity[]
  const groupedActivities = permitClassificationStore.groupedActivities

  if (!currentUser?.isSuperAdmin) {
    return (
      <Container maxW="container.lg" py={8} px={{ base: 8, xl: 0 }} flexGrow={1} as="main">
        <Text color="text.secondary">{tt("errors.unauthorized")}</Text>
      </Container>
    )
  }

  const resetForm = () => {
    setEditingId(null)
    reset(getDefaultValues())
  }

  const openCreate = (type: EPermitClassificationType) => {
    setEditingId(null)
    reset(getDefaultValues(type))
    onOpen()
  }

  const openEdit = (
    item: (IPermitType | IActivity) & {
      type: EPermitClassificationType
      id: string
      name: string
      code: string
    }
  ) => {
    setEditingId(item.id)
    reset({
      type: item.type,
      name: item.name,
      code: item.code,
      description: item.description || "",
      enabled: !!item.enabled,
      category: item.category || "",
    })
    onOpen()
  }

  const onSubmit = handleSubmit(async (values) => {
    const ok = editingId
      ? await permitClassificationStore.updatePermitClassification(editingId, values)
      : await permitClassificationStore.createPermitClassification(values)
    if (ok) {
      onClose()
      resetForm()
    }
  })

  const onDelete = async (id: string, type: EPermitClassificationType) => {
    await permitClassificationStore.destroyPermitClassification(id, type)
  }

  return (
    <Container maxW="container.lg" py={8} px={{ base: 8, xl: 0 }} flexGrow={1} as="main">
      <Stack spacing={6} align="start">
        <Heading as="h1" size="2xl">
          {t(`${i18nPrefix}.title`, "Permit classifications")}
        </Heading>

        <Flex justify="space-between" w="full">
          <Text color="text.secondary">{t(`${i18nPrefix}.description`)}</Text>
          <Button
            leftIcon={<Plus size={16} />}
            onClick={() =>
              openCreate(tabIndex === 0 ? EPermitClassificationType.PermitType : EPermitClassificationType.Activity)
            }
            variant="primary"
          >
            {t("ui.add")}
          </Button>
        </Flex>

        <Tabs w="full" isLazy index={tabIndex} onChange={(i) => setTabIndex(i)}>
          <TabList>
            <Tab>{t("siteConfiguration.permitClassifications.permitTypes")}</Tab>
            <Tab>{t("siteConfiguration.permitClassifications.activities")}</Tab>
          </TabList>
          <TabPanels mt={4}>
            <TabPanel px={0}>
              <Stack spacing={6}>
                {permitTypes.map((pt: any) => (
                  <PermitClassificationItem
                    key={pt.id}
                    classification={pt}
                    onEdit={() => openEdit({ ...pt, type: EPermitClassificationType.PermitType })}
                    onDelete={() => onDelete(pt.id, EPermitClassificationType.PermitType)}
                  />
                ))}
                {permitTypes.length === 0 && <Text color="text.secondary">{t("ui.empty")}</Text>}
              </Stack>
            </TabPanel>
            <TabPanel px={0}>
              <Stack spacing={6}>
                {groupedActivities.labeled.map((g) => (
                  <Stack key={g.label} spacing={3}>
                    <Text as="h3" fontWeight={700} color="text.secondary">
                      {g.label}
                    </Text>
                    {g.list.map((a: any) => (
                      <PermitClassificationItem
                        key={a.id}
                        classification={a}
                        onEdit={() => openEdit({ ...a, type: EPermitClassificationType.Activity })}
                        onDelete={() => onDelete(a.id, EPermitClassificationType.Activity)}
                      />
                    ))}
                  </Stack>
                ))}
                {groupedActivities.uncategorized.map((a: any) => (
                  <PermitClassificationItem
                    key={a.id}
                    classification={a}
                    onEdit={() => openEdit({ ...a, type: EPermitClassificationType.Activity })}
                    onDelete={() => onDelete(a.id, EPermitClassificationType.Activity)}
                  />
                ))}
                {activities.length === 0 && <Text color="text.secondary">{t("ui.empty", "No items yet")}</Text>}
              </Stack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Stack>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingId ? t("ui.edit") : t("ui.add")}</ModalHeader>
          <ModalBody>
            <Stack spacing={4}>
              <FormControl isRequired={!editingId} isDisabled={!!editingId}>
                <FormLabel>{t("ui.type")}</FormLabel>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select {...field}>
                      <option value={EPermitClassificationType.PermitType}>
                        {t("siteConfiguration.permitClassifications.permitType")}
                      </option>
                      <option value={EPermitClassificationType.Activity}>
                        {t("siteConfiguration.permitClassifications.activity")}
                      </option>
                    </Select>
                  )}
                />
              </FormControl>
              <FormControl isRequired={!editingId} isDisabled={!!editingId}>
                <FormLabel>{t("siteConfiguration.permitClassifications.code")}</FormLabel>
                <Input {...register("code", { required: !editingId })} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>{t("siteConfiguration.permitClassifications.name")}</FormLabel>
                <Input {...register("name", { required: true })} />
              </FormControl>
              <FormControl>
                <FormLabel>{t("siteConfiguration.permitClassifications.descriptionLabel")}</FormLabel>
                <Textarea {...register("description")} minH={20} />
              </FormControl>
              {formType === EPermitClassificationType.Activity && (
                <FormControl>
                  <FormLabel>{t("siteConfiguration.permitClassifications.category")}</FormLabel>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <CreatableSelect
                        isClearable
                        value={
                          field.value
                            ? {
                                value: field.value,
                                label:
                                  permitClassificationStore.categoryOptions.find((o) => o.value === field.value)
                                    ?.label || field.value,
                              }
                            : null
                        }
                        onChange={(opt) => field.onChange((opt as any)?.value || "")}
                        options={permitClassificationStore.categoryOptions}
                      />
                    )}
                  />
                </FormControl>
              )}
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">{t("ui.enabled")}</FormLabel>
                <Controller
                  name="enabled"
                  control={control}
                  render={({ field }) => (
                    <Switch isChecked={field.value} onChange={(e) => field.onChange(e.target.checked)} />
                  )}
                />
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <HStack>
              <Button onClick={onClose} variant="secondary">
                {t("ui.cancel")}
              </Button>
              <Button onClick={onSubmit} variant="primary">
                {t("ui.save")}
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  )
})
