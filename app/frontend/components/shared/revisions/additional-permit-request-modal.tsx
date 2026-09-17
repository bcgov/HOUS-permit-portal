import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Spacer,
  Text,
  Textarea,
} from "@chakra-ui/react"
import { MagnifyingGlass, Trash } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useMemo, useState } from "react"
import { UseFieldArrayReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useTemplateVersions } from "../../../hooks/resources/use-template-versions"
import { IPermitApplication } from "../../../models/permit-application"
import { useMst } from "../../../setup/root"
import { IAdditionalPermitRequest } from "../../../types/types"
import { groupTemplateVersionsByCategory } from "../../../utils/template-version-grouping"
import { IRevisionRequestForm } from "../../domains/permit-application/revision-sidebar"

interface IAdditionalPermitRequestModalProps {
  isOpen: boolean
  onClose: () => void
  permitApplication: IPermitApplication
  additionalPermitRequest?: IAdditionalPermitRequest
  requestedTemplateIds: string[]
  useFieldArrayMethods: UseFieldArrayReturn<IRevisionRequestForm, "additionalPermitRequestsAttributes", "fieldId">
  onSave: () => Promise<void>
  disableInput?: boolean
}

export const AdditionalPermitRequestModal = observer(
  ({
    isOpen,
    onClose,
    permitApplication,
    additionalPermitRequest,
    requestedTemplateIds,
    useFieldArrayMethods,
    onSave,
    disableInput,
  }: IAdditionalPermitRequestModalProps) => {
    const { t } = useTranslation()
    const { userStore } = useMst()
    const { currentUser } = userStore
    const { update, append, fields } = useFieldArrayMethods
    const { templateVersions, isLoading } = useTemplateVersions({
      jurisdictionId: permitApplication.jurisdiction?.id,
    })

    const [query, setQuery] = useState("")
    const [selectedTemplateVersionId, setSelectedTemplateVersionId] = useState("")
    const [comment, setComment] = useState(additionalPermitRequest?.comment ?? "")

    useEffect(() => {
      if (!isOpen) return
      setQuery("")
      setComment(additionalPermitRequest?.comment ?? "")
      const match = templateVersions.find(
        (tv) => tv.requirementTemplateId === additionalPermitRequest?.requirementTemplateId
      )
      setSelectedTemplateVersionId(match?.id ?? "")
    }, [isOpen, additionalPermitRequest?.id, templateVersions.length])

    const takenTemplateIds = requestedTemplateIds.filter((id) => id !== additionalPermitRequest?.requirementTemplateId)

    const filteredTemplates = templateVersions.filter((tv) => {
      if (takenTemplateIds.includes(tv.requirementTemplateId)) return false
      return tv.matchesSearchQuery(query)
    })
    const groupedTemplates = useMemo(() => groupTemplateVersionsByCategory(filteredTemplates), [filteredTemplates])

    const index = fields.findIndex((field) => field.id === additionalPermitRequest?.id)

    const handleUpsert = () => {
      const selected = templateVersions.find((tv) => tv.id === selectedTemplateVersionId)
      if (!selected) return

      const newItem = {
        id: additionalPermitRequest?.id,
        userId: currentUser.id,
        requirementTemplateId: selected.requirementTemplateId,
        nameSnapshot: selected.denormalizedTemplateJson?.nickname || selected.label,
        comment,
      }

      if (additionalPermitRequest && index >= 0) {
        update(index, newItem)
      } else {
        append(newItem)
      }

      onSave().then(onClose)
    }

    const handleDelete = () => {
      if (!additionalPermitRequest?.id) return
      update(index, { _destroy: true, id: additionalPermitRequest.id })
      onSave().then(onClose)
    }

    return (
      <Modal onClose={onClose} isOpen={isOpen} size="2xl">
        <ModalOverlay />
        <ModalContent mt={48}>
          <ModalHeader textAlign="center">
            <ModalCloseButton fontSize="11px" />
            <Heading as="h3" fontSize="xl">
              {t("permitApplication.show.revision.addPermitApplication")}
            </Heading>
          </ModalHeader>
          <ModalBody>
            <Flex direction="column" gap={4}>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <MagnifyingGlass />
                </InputLeftElement>
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("permitApplication.show.revision.permitApplicationSearch")}
                  bg="white"
                  isDisabled={disableInput}
                />
              </InputGroup>
              {isLoading ? (
                <Text color="text.secondary">{t("ui.loading")}</Text>
              ) : (
                <RadioGroup
                  value={selectedTemplateVersionId}
                  onChange={setSelectedTemplateVersionId}
                  isDisabled={disableInput}
                >
                  <Flex direction="column" gap={6} maxH="360px" overflowY="auto">
                    {groupedTemplates.map((group) => (
                      <Box key={group.id}>
                        <Heading as="h4" fontSize="md" mb={2}>
                          {group.label}
                        </Heading>
                        <Flex direction="column" gap={2}>
                          {group.templateVersions.map((tv) => (
                            <Flex
                              key={tv.id}
                              as="label"
                              align="center"
                              gap={3}
                              p={3}
                              border="1px solid"
                              borderColor={selectedTemplateVersionId === tv.id ? "theme.blueAlt" : "border.light"}
                              borderRadius="md"
                              bg="white"
                              cursor={disableInput ? "default" : "pointer"}
                            >
                              <Radio value={tv.id} pointerEvents="none" />
                              <Box>
                                <Text fontWeight="medium">{tv.denormalizedTemplateJson?.nickname || tv.label}</Text>
                                {tv.denormalizedTemplateJson?.description && (
                                  <Text fontSize="sm" color="text.secondary">
                                    {tv.denormalizedTemplateJson.description}
                                  </Text>
                                )}
                              </Box>
                            </Flex>
                          ))}
                        </Flex>
                      </Box>
                    ))}
                  </Flex>
                </RadioGroup>
              )}
              <FormControl>
                <FormLabel>{t("permitApplication.show.revision.permitApplicationComment")}</FormLabel>
                <Textarea value={comment} onChange={(e) => setComment(e.target.value)} isDisabled={disableInput} />
              </FormControl>
            </Flex>
            <ModalFooter>
              <Flex width="full" justify="center" gap={4}>
                {disableInput ? (
                  <Button variant="secondary" onClick={onClose}>
                    {t("ui.ok")}
                  </Button>
                ) : (
                  <>
                    <Button onClick={handleUpsert} variant="primary" isDisabled={!selectedTemplateVersionId}>
                      {t("permitApplication.show.revision.addItem")}
                    </Button>
                    <Button variant="secondary" onClick={onClose}>
                      {t("ui.cancel")}
                    </Button>
                    <Spacer />
                    {additionalPermitRequest && (
                      <Button color="semantic.error" leftIcon={<Trash />} variant="link" onClick={handleDelete}>
                        {t("ui.delete")}
                      </Button>
                    )}
                  </>
                )}
              </Flex>
            </ModalFooter>
          </ModalBody>
        </ModalContent>
      </Modal>
    )
  }
)
