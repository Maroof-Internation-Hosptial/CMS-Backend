import {User} from "../models/user.js"
import  Jwt  from "jsonwebtoken"


export const protect = (req, res, next) => {
    const { authorization } = req.headers

    if (!authorization) {
        return res.status(400).json({ error: "you must be logged in" })
        }
        const token = authorization.replace("Bearer ", "")
    Jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
        if (err) {
            return res.status(400).json({ error: "you must be logged in" })
        }
        const { _id } = payload
        User.findById({_id}).then(userdata => {
        if(!userdata){return res.status(400).json({ error: "user not found" })}    
            req.user = userdata
            next();
        })
    })
}