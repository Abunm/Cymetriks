const port = process.env.PORT || 3000
export const baseUrl = process.env.BASE_URL || `http://localhost:${port}`
export const appSecret = process.env.APP_SECRET || "winwin supersecret key"
export const devMail = 'contact@winwin-apps.com'
export const MapAccessToken = "pk.eyJ1Ijoid2lud2luYXBwbWFwcyIsImEiOiJja2p3czJ3c3owaHl1MndtbHVieGpqMGttIn0.IwqEaXuBLO_GIoUnt9Y4aA" //Check mapbox to change
export const appId = process.env.appIdForAppleLogIn || ''

const DevFbId = "1123877388070061"
const DevFbSecret = "db5941b94f0f30579867cf0d1cdee68d"
const DevGoogleId =
  "146151512409-j8kni6adbuj0kd2b9svju2h6g1ps43jv.apps.googleusercontent.com"
const DevGoogleSecret = "_Ff2RfyQwtdY1XHOPynDErf3"

export const fbOptions = {
  clientID: DevFbId,
  clientSecret: DevFbSecret,
  callbackURL: `${baseUrl}/auth/facebook/callback`,
  profileFields: ["id", "emails"],
}

export const googleOptions = {
  clientID: process.env.GOOGLE_APP_ID || DevGoogleId,
  clientSecret: process.env.GOOGLE_APP_SECRET || DevGoogleSecret,
  callbackURL: `${baseUrl}/auth/google/callback`,
  accessType: "offline",
}

export const appUrl = "winwin"
