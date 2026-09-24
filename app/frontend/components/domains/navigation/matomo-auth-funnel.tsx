import { observer } from "mobx-react-lite"
import { useEffect } from "react"
import { useMst } from "../../../setup/root"
import { resolveAndTrackMatomoLoginAttempt } from "../../../utils/matomo"

/** After Keycloak, fire login_success or login_fail once. Unknown outcome (no session, no loginReason) is not an event. */
export const MatomoAuthFunnel = observer(function MatomoAuthFunnel() {
  const { sessionStore, userStore } = useMst()
  const { isValidating, loggedIn } = sessionStore

  useEffect(() => {
    if (isValidating) return
    resolveAndTrackMatomoLoginAttempt({
      loggedIn,
      omniauthProvider: userStore.currentUser?.omniauthProvider,
    })
  }, [isValidating, loggedIn])

  return null
})
