import { Button } from "@chakra-ui/react"
import { Download, PaperPlaneRight } from "@phosphor-icons/react"
import { t } from "i18next"
import React, { useState } from "react"
import { EFileUploadAttachmentType } from "../../../types/enums"
import { IReportDocument } from "../../../types/types"
import { FileDownloadButton } from "../../shared/base/file-download-button"
import { ConfirmationModal } from "../../shared/confirmation-modal"

export function ReportDocumentActions({
  freshReport,
  awaitingReport,
  canEmail,
  onShare,
}: {
  freshReport: IReportDocument | null
  awaitingReport: boolean
  canEmail: boolean
  onShare: (reportId: string) => Promise<unknown>
}) {
  const [isSharing, setIsSharing] = useState(false)
  const reportReady = !!freshReport

  const handleShare = async () => {
    if (!freshReport) return
    setIsSharing(true)
    try {
      await onShare(freshReport.id)
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <>
      {reportReady ? (
        <FileDownloadButton
          variant="secondary"
          size="md"
          modelType={EFileUploadAttachmentType.ReportDocument}
          document={freshReport}
          simpleLabel
        />
      ) : (
        <Button
          type="button"
          variant="secondary"
          size="md"
          leftIcon={<Download size={16} />}
          isDisabled
          isLoading={awaitingReport}
          loadingText={t("ui.download")}
        >
          {t("ui.download")}
        </Button>
      )}
      {canEmail &&
        (reportReady ? (
          <ConfirmationModal
            title={t("stepCode.shareReport.confirmTitle")}
            body={t("stepCode.shareReport.confirmBody")}
            onConfirm={async (closeModal) => {
              await handleShare()
              closeModal()
            }}
            renderTriggerButton={(props) => (
              <Button
                {...props}
                type="button"
                variant="secondary"
                size="md"
                leftIcon={<PaperPlaneRight size={16} />}
                isLoading={isSharing}
              >
                {t("stepCode.shareReport.action")}
              </Button>
            )}
            renderConfirmationButton={(props) => (
              <Button {...props} variant="primary" isLoading={isSharing}>
                {t("stepCode.shareReport.confirm")}
              </Button>
            )}
          />
        ) : (
          <Button
            type="button"
            variant="secondary"
            size="md"
            leftIcon={<PaperPlaneRight size={16} />}
            isDisabled
            isLoading={awaitingReport}
            loadingText={t("stepCode.shareReport.action")}
          >
            {t("stepCode.shareReport.action")}
          </Button>
        ))}
    </>
  )
}
