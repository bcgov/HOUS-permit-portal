// Standalone synthetic UI fixture. Never imported by the application or report builds.
import bcSansCss from "@bcgov/bc-sans/css/BC_Sans.css?inline"
import { ChakraProvider } from "@chakra-ui/react"
import * as Sentry from "@sentry/react"
import React, { useState } from "react"
import { createRoot } from "react-dom/client"
import { AppErrorBoundary } from "../../app/frontend/components/shared/sentry/error-boundary"
import { FeedbackTab } from "../../app/frontend/components/shared/sentry/feedback-tab"
import "../../app/frontend/i18n/i18n"
import { feedbackController, setSentryUser } from "../../app/frontend/services/observability"
import { feedbackOptions } from "../../app/frontend/services/observability/feedback-appearance"
import { privateTransport } from "../../app/frontend/services/observability/privacy"
import fixtureCss from "./browser-fixture.css?inline"

const envelopes: unknown[] = []
const fonts = document.createElement("style")
fonts.textContent = bcSansCss + fixtureCss
document.head.appendChild(fonts)
let failSubmission = false
const feedback = Sentry.feedbackIntegration(feedbackOptions())
Sentry.init({
  dsn: `https://${"a".repeat(32)}@o1.ingest.us.sentry.io/1`,
  environment: "test",
  release: "hous-permit-portal@" + "a".repeat(40),
  defaultIntegrations: false,
  integrations: [feedback],
  sendClientReports: false,
  dataCollection: { userInfo: false },
  transport: () =>
    privateTransport(
      {
        send: async (envelope) => {
          envelopes.push(envelope)
          document.getElementById("recorded").textContent = JSON.stringify(envelopes, null, 2)
          return { statusCode: failSubmission ? 503 : 200 }
        },
        flush: async () => true,
      },
      "https://test.buildingpermit.gov.bc.ca",
      (eventId, userId) => feedbackController.crash(eventId, userId)
    ),
})
Sentry.setTag("route", "/template-versions/:templateVersionId/preview")
setSentryUser({ id: "12345678-1234-1234-1234-123456789abc", role: "reviewer" })

function Bomb(): React.ReactNode {
  throw new TypeError("Synthetic React rendering failure")
}
function Fixture() {
  const [crashed, setCrashed] = useState(false)
  const [signedIn, setSignedIn] = useState(true)
  const [submissionFails, setSubmissionFails] = useState(false)
  return (
    <ChakraProvider>
      <main className="fixture">
        <p className="eyebrow">Building Permit Hub · Local testing</p>
        <h1>Offline Sentry UI fixture</h1>
        <p>Preview feedback and test crash handling with manufactured data.</p>
        <div className="notice">
          <p>
            <strong>Offline only.</strong> Nothing is sent to Sentry. Sanitized envelopes are recorded at the bottom of
            this page.
          </p>
        </div>
        <div className="controls">
          <section className="card">
            <h2>Manual feedback</h2>
            <p>
              Open the same form used by the drawer, or use the blue Feedback tab on the right. Enter a synthetic
              message and send it.
            </p>
            <button onClick={() => void feedbackController.open("drawer")}>Drawer feedback</button>
          </section>
          <section className="card">
            <h2>Automatic crash feedback</h2>
            <p>
              Trigger a rendering failure. While signed in, the feedback form opens automatically once per page load.
              The recovery screen appears below.
            </p>
            <button disabled={crashed} onClick={() => setCrashed(true)}>
              Synthetic React crash
            </button>
          </section>
          <section className="card">
            <h2>Authentication</h2>
            <span className="status" role="status">
              {signedIn ? "Signed in as synthetic reviewer" : "Signed out"}
            </span>
            <p>
              Log out before triggering a crash to check that public visitors do not receive an automatic prompt. Manual
              feedback stays available.
            </p>
            <button
              className="secondary"
              disabled={!signedIn}
              onClick={() => {
                setSentryUser(undefined)
                setSignedIn(false)
              }}
            >
              Synthetic logout
            </button>
          </section>
        </div>
        <section className="card section">
          <h2>Submission behavior</h2>
          <label className="options">
            <input
              type="checkbox"
              checked={submissionFails}
              onChange={(event) => {
                failSubmission = event.target.checked
                setSubmissionFails(event.target.checked)
              }}
            />
            <span>Simulate submission failure</span>
          </label>
          <p className="helper">
            {submissionFails
              ? "Failure mode is on. Send feedback to see the widget’s error state; the attempted envelope is still recorded below."
              : "Success mode is on. Feedback submissions receive a simulated successful response."}
          </p>
        </section>
        <FeedbackTab />
        <section className="card section">
          <div className="section-header">
            <h2>Application preview</h2>
            <button className="secondary" onClick={() => window.location.reload()}>
              Reset fixture
            </button>
          </div>
          <p>Reset to sign back in, clear recorded events, and test the automatic prompt again.</p>
          <div className="preview">
            <AppErrorBoundary>{crashed ? <Bomb /> : <p>The synthetic application is healthy.</p>}</AppErrorBoundary>
          </div>
        </section>
        <section className="card">
          <h2>Recorded envelopes</h2>
          <p>Inspect the outgoing sanitized data here. This is a local recording, not proof of delivery to Sentry.</p>
          <pre id="recorded" tabIndex={0} aria-label="Recorded telemetry envelopes">
            No events recorded
          </pre>
        </section>
      </main>
    </ChakraProvider>
  )
}
createRoot(document.getElementById("root")).render(<Fixture />)
