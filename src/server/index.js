import express from "express"

import cookieParser from "cookie-parser"

import proRoutes from "./routes/pro"
import authRoutes from "./routes/auth"
import offersRoutes from "./routes/offers"
import categoryRoutes from "./routes/categories"
import aroundMeRoutes from "./routes/around-me"
import userRoutes from "./routes/users"
import configRoutes from "./routes/config"
import proValidationRoutes from "./routes/pro-validation"
import adminCategoriesRoutes from "./routes/admin-categories"
import paymentRoutes from "./routes/payment"
import aboutRoutes from "./routes/about"

// Middlewares
import currentPro from "./middlewares/current-pro"
import ensurePro from "./middlewares/ensure-pro"
import currentUser from "./middlewares/current-user"

import forceSsl from "force-ssl-heroku"
import * as admin from "firebase-admin"

import * as serviceAccount from "../Firebase/winwin-60233-firebase-adminsdk-ruwfa-89ae7c5a64.json"

const app = express()

app.use(forceSsl)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate")
  res.setHeader("Pragma", "no-cache")
  res.setHeader("Expires", "0")
  next()
})

app.use(cookieParser())
app.use(currentPro)
app.use(currentUser)

app.use("/api/pros", proRoutes)
app.use("/api/offers", ensurePro, offersRoutes)
app.use("/api/around", aroundMeRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/users", userRoutes)
app.use("/api/about", aboutRoutes)
app.use("/admin/api/config", configRoutes)
app.use("/admin/api/validations/pro", proValidationRoutes)
app.use("/admin/api/categories", adminCategoriesRoutes)
app.use("/auth", authRoutes)
app.use("/payment", paymentRoutes)

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST)

app.use(express.static(process.env.RAZZLE_PUBLIC_DIR))
app.use(express.static(process.env.RAZZLE_PUBLIC_DIR + '/uploads'))

app.get("*", (req, res) => {
  res.send(`
<html>
  <head>
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0"/>
    <link href="https://cdn.materialdesignicons.com/1.3.41/css/materialdesignicons.min.css" rel="stylesheet" type="text/css" />
    ${assets.client.css
      ? `<link rel="stylesheet" href="${assets.client.css}">`
      : ""}
    <title>WinWin Pro</title>
  </head>
  <body>
    <div id='root'></div>
    <script src="${assets.client.js}" defer></script>
  </body>
</html>
  `)
})

export default app
