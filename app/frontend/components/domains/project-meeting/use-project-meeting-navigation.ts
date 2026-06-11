import * as R from "ramda"
import { useLocation, useNavigate } from "react-router-dom"
import { useMst } from "../../../setup/root"
import { EProjectMeetingRequesterRelationship } from "../../../types/enums"
import { projectMeetingNavSections } from "./nav-sections"

export const useProjectMeetingNavigation = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { projectMeetingStore, permitProjectStore } = useMst()
  const currentProjectMeeting = projectMeetingStore.currentProjectMeeting
  const currentPermitProject = permitProjectStore.currentPermitProject

  const getRequesterIsOwner = () =>
    currentProjectMeeting?.requesterRelationship === EProjectMeetingRequesterRelationship.ownerOrLandholder

  const getPropertyInformationRequestsEnabled = () =>
    currentPermitProject?.jurisdiction?.propertyInformationRequestsEnabled ?? false

  const getVisibleSections = () =>
    projectMeetingNavSections.filter((section) => {
      if (section.nonOwnerOnly && getRequesterIsOwner()) return false
      if (section.propertyInformationRequestsOnly && !getPropertyInformationRequestsEnabled()) return false
      return true
    })

  const getCurrentSectionLocation = () => {
    const currentSection = pathname.split("/").pop()
    if (getRequesterIsOwner() && currentSection === "authorization-documents") {
      return "contact-details"
    }
    if (!getPropertyInformationRequestsEnabled() && currentSection === "property-information") {
      return "review"
    }
    return currentSection
  }

  const getCurrentSectionKey = () => {
    const visibleSections = getVisibleSections()
    const currentSection = getCurrentSectionLocation()
    return visibleSections.find((link) => link.location === currentSection)?.key
  }

  const getNextSection = () => {
    const visibleSections = getVisibleSections()
    const currentKey = getCurrentSectionKey()
    const currentIndex = visibleSections.findIndex((link) => link.key === currentKey)
    const next =
      currentIndex === -1 || currentIndex === visibleSections.length - 1 ? null : visibleSections[currentIndex + 1]
    return next
  }

  const getPreviousSection = () => {
    const visibleSections = getVisibleSections()
    const currentKey = getCurrentSectionKey()
    const currentIndex = visibleSections.findIndex((link) => link.key === currentKey)
    if (currentIndex <= 0) return null
    return visibleSections[currentIndex - 1]
  }

  const navigateToNext = () => {
    const nextSection = getNextSection()
    if (nextSection) {
      const baseUrl = R.pipe(R.split("/"), R.dropLast(1), R.join("/"))(pathname)
      navigate(`${baseUrl}/${nextSection.location}`)
    }
  }

  const navigateToPrevious = () => {
    const previousSection = getPreviousSection()
    if (previousSection) {
      const baseUrl = R.pipe(R.split("/"), R.dropLast(1), R.join("/"))(pathname)
      navigate(`${baseUrl}/${previousSection.location}`)
    }
  }

  const navigateToSection = (sectionKey: string) => {
    const visibleSections = getVisibleSections()
    const section = visibleSections.find((link) => link.key === sectionKey)
    if (section) {
      const baseUrl = R.pipe(R.split("/"), R.dropLast(1), R.join("/"))(pathname)
      navigate(`${baseUrl}/${section.location}`)
    }
  }

  return {
    navigateToNext,
    navigateToPrevious,
    navigateToSection,
    getCurrentSectionKey,
    hasPrevious: getPreviousSection() !== null,
  }
}
