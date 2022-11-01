import {Router} from "express"
import bodyParser from "body-parser"
import jwt from "jsonwebtoken"

import passport from "passport"
import axios from "axios"
import {Strategy as FbStrategy} from "passport-facebook"
import {Strategy as GoogleStrategy} from "passport-google-oauth20"

import {appSecret, fbOptions, googleOptions, appUrl, appId} from "../../config"
import Pro from "../models/pro"
import User from "../models/user"
import {forLogin} from "../../types/pro"

import validate from "../middlewares/validate"
import respectSchema from "../validators/respect-schema"

import {compare} from "../../lib/crypto"
import appleSignin from 'apple-signin-auth'

async function userFromFbProfile(profile) {
    const fbId = profile.id
    const email = profile.emails ? profile.emails[0].value : undefined

    const query = {
        where: {fbId},
    }

    if (email) {
        query.orWhere = {email}
    }

    let user = await User.query(query).fetch()

    if (!user) {
        user = await User.forge({
            fbId,
            email,
        }).save()
    } else if (!user.get("fbId")) {
        await user.save({fbId}, {patch: true})
    }

    return user
}

function formatUser(user) {
    const token = jwt.sign({id: user.get("id")}, appSecret)

    const firstTime = !user.has("username")

    const formated = {
        ...user.serialize(),
        token,
        firstTime,
    }

    return formated
}

passport.use(
    new FbStrategy(fbOptions, async (token, refresh, profile, done) => {
        const user = await userFromFbProfile(profile)
        done(null, user)
    }),
)

passport.use(
    new GoogleStrategy(
        googleOptions,
        async (accessToken, refreshToken, profile, done) => {
            const goId = profile.id
            const email = profile.emails ? profile.emails[0].value : undefined

            const query = {
                where: {goId},
            }

            if (email) {
                query.orWhere = {email}
            }

            let user = await User.query(query).fetch()

            if (!user) {
                user = await User.forge({
                    goId,
                    email,
                }).save()
            } else if (!user.get("goId")) {
                await user.save({goId}, {patch: true})
            }

            done(null, user)
        },
    ),
)

const r = new Router()

r.use(bodyParser.json())

// POST /api/auth/pros
// Create a new jwt token for a pro
r.post("/pro", validate(respectSchema(forLogin)))
r.post("/pro", async (req, res) => {
    const {email, password} = req.body
    const pro = await new Pro({email}).fetch({
        withRelated: ["offers"],
    })

    if (!pro) {
        res.status(404).end()
        return
    }

    if (!await compare(password, pro.get("passwordDigest"))) {
        res.status(404).end()
        return
    }

    const token = jwt.sign({id: pro.get("id")}, appSecret)

    const response = Object.assign(pro.serialize(), {token})
    delete response.passwordDigest
    res.json(response)
})



r.post('/apple', async (req, res, next) => {
    try {
        const {body} = req;
        const {
            email,
            fullName,
            identityToken
        } = body;

        try {
            const clientId = appId
            // verify token (will throw error if failure)
            const {sub: userAppleId} = await appleSignin.verifyIdToken(identityToken, {
                audience: clientId,
                ignoreExpiration: true, // ignore token expiry (never expires)
            });
           
		   
                try {
                    const query = {
                        where: {apId: userAppleId},
                    }

                    if (email) {
                        query.orWhere = {email}
                    }

                    var user = await User.query(query).fetch()

                    if (!user) {
                        user = await User.forge({
                            apId: userAppleId,
                            email,
                        }).save()
                    } else if (!user.get("apId")) {
                        await user.save({apId: userAppleId}, {patch: true})
                    }
                    user = await User.query(query).fetch()
                    res.json(formatUser(user));
                   
                } catch (e) {
                    console.log(e);
                    res.status(400).end();
                }

            
        } catch (e) {
            console.log("Verification failed")
            next(e);
        }
    } catch (e) {
        next(e);
    }
});


r.post("/user", async (req, res) => {
    const {username, password} = req.body
    if (!username || !password) {
        return res.status(404).end()
    }

    const user = await User.where({
        username: username.trim().toLowerCase(),
    }).fetch()
    if (!user) {
        return res.status(404).end()
    }

    if (!await compare(password, user.get("passwordDigest"))) {
        return res.status(404).end()
    }

    const token = jwt.sign({id: user.get("id")}, appSecret)

    const response = user.toJSON()
    delete response.passwordDigest

    res.json({
        ...response,
        token,
    })
})

r.get("/facebook", passport.authenticate("facebook", {scope: ["email"]}))
r.get(
    "/facebook/callback",
    passport.authenticate("facebook", {session: false}),
    (req, res) => {
        const user = formatUser(req.user)

        const userJSON = JSON.stringify(user)
        const userURI = encodeURIComponent(userJSON)

        res.send(`
      <script id="result">${userJSON}</script>
      <script>
        setTimeout(
          function () {
            window.location = "${appUrl}://login/${userURI}"
        }, 200)
      </script>
    `)
    },
)
r.post("/facebook/token", async (req, res) => {
    const {token} = req.body
    const {data: profile} = await axios.get(
        `https://graph.facebook.com/v2.8/me?fields=id,name,email&access_token=${token}`,
    )
    const user = await userFromFbProfile(profile)
    res.json(formatUser(user))
})

r.get("/google", passport.authenticate("google", {scope: ["email"]}))
r.get(
    "/google/callback",
    passport.authenticate("google", {session: false}),
    (req, res) => {
        const user = formatUser(req.user)

        const userJSON = JSON.stringify(user)
        const userURI = encodeURIComponent(userJSON)

        res.redirect(`${appUrl}://login/${userURI}`)
    },
)

export default r
