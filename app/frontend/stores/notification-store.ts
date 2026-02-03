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
  ITemplateVersionNotificationObjectData,
  IUserPushPayload,
} from "../types/types"

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
      const currentUser = self.rootStore.userStore.currentUser
      const jurisdiction = currentUser.jurisdiction
      let objectData = notification.objectData
      if (notification.actionType === ENotificationActionType.newTemplateVersionPublish) {
        const linkData = [
          {
            text: t("permitApplication.reviewOutdatedSubmissionLink"),
            href: `/projects`,
          },
        ]
        if (currentUser?.isReviewStaff && currentUser.jurisdiction?.slug) {
          linkData.push({
            text: t("permitApplication.configureStepCodePageLink"),
            href: `/jurisdictions/${jurisdiction.slug}/configuration-management/energy-step`,
          })
        }
        if (currentUser.isManager) {
          linkData.push({
            text: t("permitApplication.reviewUpdatedEditLink"),
            href: `/digital-building-permits/${(objectData as ITemplateVersionNotificationObjectData).templateVersionId}/edit?compare=true`,
          })
        }

        return linkData
      } else if (notification.actionType === ENotificationActionType.customizationUpdate) {
        return [
          {
            text: t("permitApplication.reviewCustomizedSubmissionLink"),
            href: `/projects`,
          },
        ]
      } else if (
        [
          ENotificationActionType.submissionCollaborationAssignment,
          ENotificationActionType.submissionCollaborationUnassignment,
          ENotificationActionType.reviewCollaborationAssignment,
          ENotificationActionType.reviewCollaborationUnassignment,
        ].includes(notification.actionType)
      ) {
        const collaborationData = objectData as IPermitCollaborationNotificationObjectData
        return [
          ENotificationActionType.submissionCollaborationAssignment,
          ENotificationActionType.reviewCollaborationAssignment,
        ].includes(notification.actionType)
          ? [
              {
                text: t("ui.show"),
                href:
                  notification.actionType === ENotificationActionType.submissionCollaborationAssignment
                    ? `/permit-applications/${collaborationData.permitApplicationId}/edit`
                    : `/permit-applications/${collaborationData.permitApplicationId}`,
              },
            ]
          : []
      } else if (notification.actionType === ENotificationActionType.permitBlockStatusReady) {
        const collaborationData = objectData as IPermitBlockStatusReadyNotificationObjectData
        return [
          {
            text: t("ui.show"),
            href:
              collaborationData?.collaborationType === ECollaborationType.review
                ? `/permit-applications/${collaborationData.permitApplicationId}`
                : `/permit-applications/${collaborationData.permitApplicationId}/edit`,
          },
        ]
      } else if (
        [
          ENotificationActionType.publishedTemplateMissingRequirementsMapping,
          ENotificationActionType.scheduledTemplateMissingRequirementsMapping,
        ].includes(notification.actionType)
      ) {
        return [
          {
            text: "View integration mapping",
            href: `/api-settings/api-mappings/digital-building-permits/${(objectData as ITemplateVersionNotificationObjectData).templateVersionId}/edit`,
          },
        ]
      } else if (
        notification.actionType === ENotificationActionType.applicationSubmission ||
        notification.actionType === ENotificationActionType.applicationRevisionsRequest ||
        notification.actionType === ENotificationActionType.applicationView
      ) {
        return [
          {
            text: t("ui.show"),
            href: `/permit-applications/${(notification.objectData as IPermitNotificationObjectData).permitApplicationId}/edit`,
          },
        ]
      } else if (notification.actionType === ENotificationActionType.stepCodeReportGenerated) {
        const reportData = notification.objectData as any
        const filename = reportData?.filename || t("ui.download")
        // Use direct S3 url if provided, otherwise route to step-codes listing where latest report shows a Download button
        const href = reportData?.downloadUrl || "/step-codes"
        return [
          {
            text: `${t("ui.download")} ${filename}`,
            href,
          },
        ]
      } else if (notification.actionType === ENotificationActionType.preCheckSubmitted) {
        const preCheckData = notification.objectData as any
        return [
          {
            text: t("ui.show"),
            href: `/pre-checks/${preCheckData?.preCheckId}/edit/results-summary`,
          },
        ]
      } else if (notification.actionType === ENotificationActionType.preCheckCompleted) {
        const preCheckData = notification.objectData as any
        return [
          {
            text: t("ui.show"),
            href: `/pre-checks/${preCheckData?.preCheckId}/edit/results-summary`,
          },
        ]
      } else if (notification.actionType === ENotificationActionType.fileUploadFailed) {
        const fileUploadData = notification.objectData as any
        const permitApplicationId = fileUploadData?.permitApplicationId
        if (!permitApplicationId) {
          return []
        }

        return [
          {
            text: t("permitApplication.goToApplication"),
            href: `/permit-applications/${permitApplicationId}/edit`,
          },
        ]
      } else if (notification.actionType === ENotificationActionType.resourceReminder) {
        const data = notification.objectData as any
        const jurisdictionId = data?.jurisdictionId
        if (!jurisdictionId) {
          return []
        }
        // Assuming link goes to jurisdiction resources page
        return [
          {
            text: t("ui.show"),
            href: `/jurisdictions/${jurisdictionId}/configuration-management/resources`,
          },
        ]
      }
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
      const newNotifications = R.concat(
        self.notifications,
        notifications.map((m) => self.convertNotificationToUseDate(m))
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
      self.notifications.unshift(self.convertNotificationToUseDate(payload.data))
      self.unreadNotificationsCount = self.popoverOpen ? 0 : payload.meta.unreadCount
      self.totalPages = payload.meta.totalPages

      // Side-effects are handled by applyNotificationSideEffects (see user_push_processor)
    }),
  }))

const criticalNotificationTypes = [ENotificationActionType.applicationRevisionsRequest]

export interface INotificationStore extends Instance<typeof NotificationStoreModel> {}
