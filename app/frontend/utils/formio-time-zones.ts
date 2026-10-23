import moment from "moment-timezone"

// Both FormIO versions import this same Moment instance. The package entrypoint
// loads pinned IANA data, including historical rules. FormIO otherwise fetches
// its own older data from the CDN, even when Moment already has zones loaded.
const formioMoment = moment as typeof moment & {
  zonesLoaded: boolean
  zonesPromise: Promise<void>
}
formioMoment.zonesLoaded = true
formioMoment.zonesPromise = Promise.resolve()

export { moment }
