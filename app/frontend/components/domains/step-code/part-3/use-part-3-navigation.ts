import * as R from "ramda"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { usePart3StepCode } from "../../../../hooks/resources/use-part-3-step-code"
import { IPart3NavLink } from "../../../../types/types"
import { navLinks } from "./sidebar/nav-sections"

function flattenNavLinks(links: IPart3NavLink[]): IPart3NavLink[] {
  return links.flatMap((link) => [link, ...flattenNavLinks(link.subLinks)])
}

const allNavLinks = flattenNavLinks(navLinks)

export const usePart3Navigation = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { permitApplicationId } = useParams()
  const { checklist } = usePart3StepCode()

  // Computed lazily so callers always see the latest relevance state
  // (sections like baseline-occupancies update relevance flags mid-save)
  const getRelevantNavLinks = () => allNavLinks.filter((link) => checklist?.isRelevant(link.key) !== false)

  const getCurrentSectionKey = () => {
    const currentSection = pathname.split("/").pop()
    return getRelevantNavLinks().find((link) => link.location === currentSection)?.key
  }

  const getNextSection = () => {
    const links = getRelevantNavLinks()
    const currentKey = getCurrentSectionKey()
    const currentIndex = links.findIndex((link) => link.key === currentKey)
    if (currentIndex === -1 || currentIndex === links.length - 1) return null
    return links[currentIndex + 1]
  }

  const getPreviousSection = () => {
    const links = getRelevantNavLinks()
    const currentKey = getCurrentSectionKey()
    const currentIndex = links.findIndex((link) => link.key === currentKey)
    if (currentIndex <= 0) return null
    return links[currentIndex - 1]
  }

  const getBaseUrl = () => R.pipe(R.split("/"), R.dropLast(1), R.join("/"))(pathname)

  const navigateToNext = () => {
    const nextSection = getNextSection()
    if (nextSection) {
      navigate(`${getBaseUrl()}/${nextSection.location}`)
    }
  }

  const navigateToPrevious = () => {
    const previousSection = getPreviousSection()
    if (previousSection) {
      navigate(`${getBaseUrl()}/${previousSection.location}`)
    }
  }

  const navigateToSection = (sectionKey: string) => {
    const section = getRelevantNavLinks().find((link) => link.key === sectionKey)
    if (section) {
      navigate(`${getBaseUrl()}/${section.location}`)
    }
  }

  const goBackPath = permitApplicationId ? `/permit-applications/${permitApplicationId}/edit` : "/step-codes"

  return {
    navigateToNext,
    navigateToPrevious,
    navigateToSection,
    getNextSection,
    getPreviousSection,
    getCurrentSectionKey,
    hasNext: getNextSection() !== null,
    hasPrevious: getPreviousSection() !== null,
    goBackPath,
  }
}
