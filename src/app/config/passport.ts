/* eslint-disable @typescript-eslint/no-explicit-any */
import passport from "passport"
import { Strategy as LocalStrategy } from "passport-local"
import { userModel } from "../modules/user/user.model";
import bcryptjs from "bcryptjs"
import { IsActive } from "../modules/user/user.interface";

// use passport js for credential based authentication
passport.use(
    new LocalStrategy({
        usernameField: "email",
        passwordField: "password"
    }, async (email: string, password: string, done) => {
        try {
            const isUserExists = await userModel.findOne({ email });

            if (!isUserExists) {
                return done("User does not exist")
            }

            if (!isUserExists.isVerified) {
                return done("User is not verified")
            }

            if (isUserExists.isActive === IsActive.BLOCKED || isUserExists.isActive === IsActive.INACTIVE) {
                return done(`User is ${isUserExists.isActive}`)
            }
            if (isUserExists.isDeleted) {
                return done("User is deleted")
            }

            const isPassWordMatched = await bcryptjs.compare(password as string, isUserExists.password);

            if (!isPassWordMatched) {
                return done(null, false, { message: "Password does not match" })
            }

            return done(null, isUserExists)
        } catch (error) {
            console.log(error)
            done(error)
        }
    })
)

passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
    done(null, user._id)
})

passport.deserializeUser(async (id: string, done: any) => {
    try {
        const user = await userModel.findById(id);
        done(null, user)
    } catch (error) {
        console.log(error);
        done(error)
    }
})