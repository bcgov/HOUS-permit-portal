import { t } from "i18next"
import { flow, Instance, toGenerator, types } from "mobx-state-tree"
import * as R from "ramda"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { ECollaborationType, EFlashMessageStatus, ENotificationActionType } from "../types/enums"
import {
  ILinkData,
  INotification,
  IPermitBlockStatusReadyNotificationObjectData,
  IPermitCollaborationNotificationObjectData,
  IPermitNotificationObjectData,
  IProjectMeetingNotificationObjectData,
  ITemplateVersionNotificationObjectData,
  IUserPushPayload,
} from "../types/types"

type LinkGenerator = (notification: INotification, currentUser: any) => ILinkData[]

const showLink = (href: string): ILinkData[] => [{ text: t("ui.show"), href }]

const linkGenerators: Partial<Record<ENotificationActionType, LinkGenerator>> = {
  [ENotificationActionType.newTemplateVersionPublish]: (notification, currentUser) => {
    const objectData = notification.objectData as ITemplateVersionNotificationObjectData
    const linkData = [
      {
        text: t("permitApplication.reviewOutdatedSubmissionLink"),
        href: `/projects`,
      },
    ]
    if (currentUser?.isReviewStaff && currentUser.jurisdiction?.slug) {
      linkData.push({
        text: t("permitApplication.configureStepCodePageLink"),
        href: `/jurisdictions/${currentUser.jurisdiction.slug}/configuration-management/energy-step`,
      })
    }
    if (currentUser?.isManager) {
      linkData.push({
        text: t("permitApplication.reviewUpdatedEditLink"),
        href: `/digital-building-permits/${objectData.templateVersionId}/edit?compare=true`,
      })
    }
    return linkData
  },

  [ENotificationActionType.customizationUpdate]: () => [
    {
      text: t("permitApplication.reviewCustomizedSubmissionLink"),
      href: `/projects`,
    },
  ],

  [ENotificationActionType.submissionCollaborationAssignment]: (notification) => {
    const { permitApplicationId } = notification.objectData as IPermitCollaborationNotificationObjectData
    return showLink(`/permit-applications/${permitApplicationId}/edit`)
  },

  [ENotificationActionType.reviewCollaborationAssignment]: (notification) => {
    const { permitApplicationId } = notification.objectData as IPermitCollaborationNotificationObjectData
    return showLink(`/permit-applications/${permitApplicationId}`)
  },

  [ENotificationActionType.submissionCollaborationUnassignment]: () => [],
  [ENotificationActionType.reviewCollaborationUnassignment]: () => [],

  [ENotificationActionType.projectReviewCollaborationAssignment]: (notification) => {
    const { permitProjectId, jurisdictionSlug } = notification.objectData as {
      permitProjectId: string
      jurisdictionSlug: string
    }
    return showLink(`/jurisdictions/${jurisdictionSlug}/submission-inbox/projects/${permitProjectId}/overview`)
  },

  [ENotificationActionType.projectReviewCollaborationUnassignment]: () => [],

  [ENotificationActionType.permitBlockStatusReady]: (notification) => {
    const data = notification.objectData as IPermitBlockStatusReadyNotificationObjectData
    const href =
      data?.collaborationType === ECollaborationType.review
        ? `/permit-applications/${data.permitApplicationId}`
        : `/permit-applications/${data.permitApplicationId}/edit`
    return showLink(href)
  },

  [ENotificationActionType.publishedTemplateMissingRequirementsMapping]: (notification) => [
    {
      text: "View integration mapping",
      href: `/api-settings/api-mappings/digital-building-permits/${(notification.objectData as ITemplateVersionNotificationObjectData).templateVersionId}/edit`,
    },
  ],

  [ENotificationActionType.scheduledTemplateMissingRequirementsMapping]: (notification) => [
    {
      text: "View integration mapping",
      href: `/api-settings/api-mappings/digital-building-permits/${(notification.objectData as ITemplateVersionNotificationObjectData).templateVersionId}/edit`,
    },
  ],

  [ENotificationActionType.applicationSubmission]: (notification) =>
    showLink(
      `/permit-applications/${(notification.objectData as IPermitNotificationObjectData).permitApplicationId}/edit`
    ),

  [ENotificationActionType.applicationRevisionsRequest]: (notification) =>
    showLink(
      `/permit-applications/${(notification.objectData as IPermitNotificationObjectData).permitApplicationId}/edit`
    ),

  [ENotificationActionType.reviewStarted]: (notification) =>
    showLink(
      `/permit-applications/${(notification.objectData as IPermitNotificationObjectData).permitApplicationId}/edit`
    ),

  [ENotificationActionType.stepCodeReportGenerated]: (notification) => {
    const reportData = notification.objectData as any
    const filename = reportData?.filename || t("ui.download")
    const href = reportData?.downloadUrl || "/step-codes"
    return [{ text: `${t("ui.download")} ${filename}`, href }]
  },

  [ENotificationActionType.preCheckSubmitted]: (notification) => {
    const { preCheckId } = notification.objectData as any
    return showLink(`/pre-checks/${preCheckId}/edit/results-summary`)
  },

  [ENotificationActionType.preCheckCompleted]: (notification) => {
    const { preCheckId } = notification.objectData as any
    return showLink(`/pre-checks/${preCheckId}/edit/results-summary`)
  },

  [ENotificationActionType.fileUploadFailed]: (notification) => {
    const permitApplicationId = (notification.objectData as any)?.permitApplicationId
    if (!permitApplicationId) return []
    return [
      {
        text: t("permitApplication.goToApplication"),
        href: `/permit-applications/${permitApplicationId}/edit`,
      },
    ]
  },

  [ENotificationActionType.resourceReminder]: (notification) => {
    const jurisdictionId = (notification.objectData as any)?.jurisdictionId
    if (!jurisdictionId) return []
    return showLink(`/jurisdictions/${jurisdictionId}/configuration-management/resources`)
  },

  [ENotificationActionType.projectMeetingSubmitted]: (notification) => {
    const { permitProjectId, projectMeetingId } = notification.objectData as IProjectMeetingNotificationObjectData
    return showLink(`/projects/${permitProjectId}/meetings/${projectMeetingId}/sent`)
  },

  [ENotificationActionType.projectMeetingScheduled]: (notification) => {
    const { permitProjectId, projectMeetingId } = notification.objectData as IProjectMeetingNotificationObjectData
    return showLink(`/projects/${permitProjectId}/meetings/${projectMeetingId}`)
  },

  [ENotificationActionType.projectMeetingRescheduled]: (notification) => {
    const { permitProjectId, projectMeetingId } = notification.objectData as IProjectMeetingNotificationObjectData
    return showLink(`/projects/${permitProjectId}/meetings/${projectMeetingId}`)
  },

  [ENotificationActionType.releaseNotePublish]: (notification) => {
    const releaseNoteId = (notification.objectData as { releaseNoteId?: string })?.releaseNoteId
    if (!releaseNoteId) return []
    return showLink(`/release-notes#release-note-${releaseNoteId}`)
  },
}

export const NotificationStoreModel = types
  .model("NotificationStoreModel")
  .props({
    notifications: types.array(types.frozen<INotification>()),
    page: types.maybeNull(types.number),
    totalPages: types.maybeNull(types.number),
    isLoaded: types.maybeNull(types.boolean),
    unreadNotificationsCount: types.optional(types.number, 0),
    popoverOpen: types.optional(types.boolean, false),
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .views((self) => ({
    getSemanticKey(notification: INotification): EFlashMessageStatus {
      return criticalNotificationTypes.includes(notification.actionType)
        ? EFlashMessageStatus.warning
        : EFlashMessageStatus.info
    },
    get anyUnread() {
      return self.unreadNotificationsCount > 0
    },
    get nextPage() {
      return self.page ? self.page + 1 : 1
    },
    get hasMorePages() {
      return self.totalPages > self.page
    },
    get criticalNotifications() {
      return self.notifications
        ?.slice(0, self.unreadNotificationsCount)
        .filter((n) => criticalNotificationTypes.includes(n.actionType))
    },
    generateSpecificLinkData(notification: INotification): ILinkData[] {
      return linkGenerators[notification.actionType]?.(notification, self.rootStore.userStore.currentUser) ?? []
    },
  }))
  .actions((self) => ({
    convertNotificationToUseDate(item): INotification {
      return { ...item, at: item.at ? new Date(item.at * 1000) : new Date() }
    },
    setPopoverOpen(isOpen) {
      self.popoverOpen = isOpen
    },
  }))
  .actions((self) => ({
    setNotifications(notifications) {
      self.notifications = notifications.map((m) => self.convertNotificationToUseDate(m))
    },
    concatToNotifications(notifications) {
      const newNotifications = R.uniqBy(
        (n: INotification) => n.id,
        R.concat(
          self.notifications,
          notifications.map((m) => self.convertNotificationToUseDate(m))
        )
      )
      self.notifications.replace(newNotifications)
    },
  }))
  .actions((self) => ({
    fetchNotifications: flow(function* (opts = {}) {
      if (opts.reset) self.page = self.totalPages = undefined
      self.isLoaded = false
      const response = yield* toGenerator(self.environment.api.fetchNotifications(self.nextPage))

      if (response?.ok) {
        const {
          ok,
          data: {
            data,
            meta: { unreadCount, totalPages },
          },
        } = response

        self.unreadNotificationsCount = unreadCount
        opts.reset ? self.setNotifications(data) : self.concatToNotifications(data)
        self.totalPages = totalPages
        self.page = self.nextPage
        self.isLoaded = true
      }
    }),

    markAllAsRead: flow(function* () {
      const { ok } = yield* toGenerator(self.environment.api.resetLastReadNotifications())
      if (ok) {
        self.unreadNotificationsCount = 0
      }
    }),
  }))
  .actions((self) => ({
    initialFetch: flow(function* () {
      self.fetchNotifications()
    }),
    processWebsocketChange: flow(function* (payload: IUserPushPayload) {
      const existing = self.notifications.find((n) => n.id === payload.data.id)
      if (!existing) {
        self.notifications.unshift(self.convertNotificationToUseDate(payload.data))
      }
      self.unreadNotificationsCount = self.popoverOpen ? 0 : payload.meta.unreadCount
      self.totalPages = payload.meta.totalPages

      // Side-effects are handled by applyNotificationSideEffects (see user_push_processor)
    }),
  }))

const criticalNotificationTypes = [ENotificationActionType.applicationRevisionsRequest]

export interface INotificationStore extends Instance<typeof NotificationStoreModel> {}
