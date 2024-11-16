import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useMst } from "../../../../../setup/root"
import { ERequirementTemplateType } from "../../../../../types/enums"
import { ICopyRequirementTemplateFormData } from "../../../../../types/types"
import { SharedSpinner } from "../../../../shared/base/shared-spinner"
import { RequirementTemplateGrid } from "../../../../shared/requirement-template/requirement-template-grid"

export const CopyFromLiveModal: React.FC = () => {
  const { requirementTemplateStore } = useMst()
  const { copyRequirementTemplate } = requirementTemplateStore
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [isCopying, setIsCopying] = useState(false)

  const handleCopyFrom = async (rt) => {
    setIsCopying(true)
    const overrideData: ICopyRequirementTemplateFormData = {
      id: rt.id,
      type: ERequirementTemplateType.EarlyAccessRequirementTemplate,
    }
    const copiedTemplate = await copyRequirementTemplate(overrideData)
    setIsCopying(false)
    if (copiedTemplate) navigate(`/early-access/requirement-templates/${copiedTemplate.id}/edit`)
  }

  return (
    <>
      <Button variant="primary" onClick={onOpen}>
        {t("earlyAccessRequirementTemplate.new.copyFromLive")}
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("earlyAccessRequirementTemplate.new.copyFromLive")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <RequirementTemplateGrid
              renderActions={(rt) =>
                isCopying ? (
                  <SharedSpinner />
                ) : (
                  <Button variant="primary" onClick={() => handleCopyFrom(rt)}>
                    {t("earlyAccessRequirementTemplate.new.copyFromThis")}
                  </Button>
                )
              }
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
