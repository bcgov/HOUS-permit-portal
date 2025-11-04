import { useCallback, useEffect, useRef } from "react"
import { useMst } from "../setup/root"

export function useJiraCollector() {
  const { sessionStore, userStore } = useMst()
  const { loggedIn } = sessionStore
  const { currentUser } = userStore
  const showCollectorDialogRef = useRef<(() => void) | null>(null)

  // Build user context string
  const buildUserContext = useCallback(() => {
    const userContext = [
      `Submitted from: ${window.location.href}`,
      `User Agent: ${navigator.userAgent}`,
      loggedIn ? `Logged in: Yes` : `Logged in: No`,
    ]

    if (loggedIn && currentUser) {
      userContext.push(`User ID: ${currentUser.id}`)
      if (currentUser.email) {
        userContext.push(`User Email: ${currentUser.email}`)
      }
      if (currentUser.name) {
        userContext.push(`User Name: ${currentUser.name}`)
      }
    }

    return userContext.join("\n") + "\n\n"
  }, [loggedIn, currentUser])

  // Load Jira collector script
  const loadJiraCollector = useCallback(() => {
    const scriptSrc = import.meta.env.VITE_JIRA_COLLECTOR_SCRIPT_SRC
    if (!scriptSrc) {
      return // Environment variable not set, skip loading
    }

    // Check if script already exists
    if (!document.getElementById("jira-collector-script")) {
      const script = document.createElement("script")
      script.id = "jira-collector-script"
      script.type = "text/javascript"
      script.src = scriptSrc
      document.head.appendChild(script)

      script.onload = () => {
        window.ATL_JQ_PAGE_PROPS = {
          triggerFunction: function (showCollectorDialog: () => void) {
            showCollectorDialogRef.current = showCollectorDialog
          },
          fieldValues: {
            description: buildUserContext(),
          },
        }
      }

      script.onerror = () => {
        console.warn("Failed to load Jira collector script")
      }
    } else {
      // Script already loaded, update context
      if (window.ATL_JQ_PAGE_PROPS) {
        window.ATL_JQ_PAGE_PROPS.fieldValues = {
          description: buildUserContext(),
        }
      }
    }
  }, [buildUserContext])

  // Ensure script is loaded when user context changes
  useEffect(() => {
    loadJiraCollector()
  }, [loadJiraCollector])

  const openFeedbackCollector = useCallback(
    (e?: React.MouseEvent<HTMLElement>) => {
      e?.preventDefault()
      const scriptSrc = import.meta.env.VITE_JIRA_COLLECTOR_SCRIPT_SRC

      if (!scriptSrc) {
        // Fallback to email if collector script not configured
        window.location.href = "mailto:digital.codes.permits@gov.bc.ca?subject=Building Permit Hub Feedback"
        return
      }

      // Ensure script is loaded before trying to open
      loadJiraCollector()

      // Check if dialog function is available (set by triggerFunction callback)
      if (showCollectorDialogRef.current) {
        showCollectorDialogRef.current()
      } else {
        // Fallback to email if collector hasn't initialized yet or failed to load
        window.location.href = "mailto:digital.codes.permits@gov.bc.ca?subject=Building Permit Hub Feedback"
      }
    },
    [loadJiraCollector]
  )

  return { openFeedbackCollector, loadJiraCollector }
}
