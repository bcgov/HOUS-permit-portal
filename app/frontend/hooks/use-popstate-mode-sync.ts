import { useEffect } from "react"
import { ISubmissionInboxStore } from "../stores/submission-inbox-store"

/**
 * Syncs viewMode/displayMode with browser back/forward navigation.
 *
 * Unlike filter params (status, unread, etc.) which use replaceState and only
 * need to be read once on mount, viewMode and displayMode use pushState so that
 * toggling between views creates real browser history entries. This means we need
 * to listen for popstate events to restore the correct modes when the user
 * navigates with the back/forward buttons.
 *
 * restoreModesFromUrl() sets the store values directly (without pushing a new
 * history entry), avoiding an infinite push loop.
 */
export const usePopStateModeSync = (store: ISubmissionInboxStore) => {
  useEffect(() => {
    store.restoreModesFromUrl()

    const onPopState = () => store.restoreModesFromUrl()
    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [store])
}
