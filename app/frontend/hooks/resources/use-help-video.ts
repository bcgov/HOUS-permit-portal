import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
import { useMst } from "../../setup/root"

export const useHelpVideo = () => {
  const { videoId } = useParams()
  const { helpVideoStore } = useMst()
  const { currentHelpVideo, fetchHelpVideo } = helpVideoStore
  const [error, setError] = useState<Error | undefined>(undefined)
  const { t } = useTranslation()

  useEffect(() => {
    if (!videoId) return
    ;(async () => {
      try {
        const video = await fetchHelpVideo(videoId)
        if (video) {
          setError(null)
        } else {
          setError(new Error(t("helpVideos.fetchError")))
        }
      } catch (e) {
        console.error(e.message)
        setError(new Error(t("helpVideos.fetchError")))
      }
    })()
  }, [videoId])

  const matchedVideo = currentHelpVideo?.id === videoId || currentHelpVideo?.slug === videoId ? currentHelpVideo : null

  return { currentHelpVideo: matchedVideo, error }
}
