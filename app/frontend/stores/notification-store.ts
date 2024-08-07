import { t } from "i18next"
import { flow, Instance, toGenerator, types } from "mobx-state-tree"
import * as R from "ramda"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { ENotificationActionType } from "../types/enums"
import { ILinkData, INotification, IPermitNotificationObjectData, IUserPushPayload } from "../types/types"

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
    getSemanticKey(notification: INotification) {
      return criticalNotificationTypes.includes(notification.actionType) ? "warning" : "info"
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
      let objectData = notification.objectData
      const draftFilterUriComponent = encodeURIComponent(self.rootStore.permitApplicationStore.draftStatuses.join(","))
      if (notification.actionType === ENotificationActionType.newTemplateVersionPublish) {
        objectData = objectData as IPermitNotificationObjectData
        const linkData = [
          {
            text: t("permitApplication.reviewOutdatedSubmissionLink"),
            href: `/permit-applications?requirementTemplateId=${objectData.requirementTemplateId}&status=${draftFilterUriComponent}&flash=${encodeURIComponent(
              JSON.stringify({
                type: "success",
                title: t("permitApplication.reviewOutdatedTitle"),
                message: t("permitApplication.reviewOutdatedMessage"),
              })
            )}`,
          },
        ]
        if (currentUser.isManager) {
          linkData.push({
            text: t("permitApplication.reviewUpdatedEditLink"),
            href: `/digital-building-permits/${objectData.templateVersionId}/edit?compare=true`,
          })
        }

        return linkData
      } else if (notification.actionType === ENotificationActionType.customizationUpdate) {
        objectData = objectData as IPermitNotificationObjectData
        return [
          {
            text: t("permitApplication.reviewCustomizedSubmissionLink"),
            href: `/permit-applications?requirementTemplateId=${objectData.requirementTemplateId}&status=${draftFilterUriComponent}&flash=${encodeURIComponent(
              JSON.stringify({
                type: "success",
                title: t("permitApplication.reviewCustomizedTitle"),
                message: t("permitApplication.reviewCustomizedMessage"),
              })
            )}`,
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
            href: `/api-settings/api-mappings/digital-building-permits/${objectData.templateVersionId}/edit`,
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
      const {
        ok,
        data: {
          data,
          meta: { unreadCount, totalPages },
        },
      } = response

      if (ok) {
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
    }),
  }))

const criticalNotificationTypes = [ENotificationActionType.applicationRevisionsRequest]

export interface INotificationStore extends Instance<typeof NotificationStoreModel> {}
