import { tabNewsTypeError } from "../util/error.js"
import { ClientUserData } from "../util/types.js"
import { API } from "./index.js"

class UserManager {
    /** @type {API} @private */
    api

    constructor(api){
        if(api instanceof API){
            this.api = api
        } else {
            throw new tabNewsTypeError("API needs to be a instance of API")
        }
    }

    async getUserToken(loginData){
        const session = await this.api.request(this.api.endpoints.login, {method: "POST", body: loginData}).catch((error) => { throw error })
        const sessionData = await session.json()

        if(session.status === 201){
            return sessionData.token
        } else {
            throw sessionData
        }
    }

    async getUserData(token){
        const user = await this.api.request(this.api.endpoints.user, {token}).catch((error) => { throw error })
        const userData = await user.json()

        if(user.status === 200){
            return new ClientUserData(userData, token, this.api)
        } else {
            throw userData
        }
    }

    async editUser(options, username, email, token){
        const userPatched = await this.api.request(`${this.api.endpoints.users}/${username}`, {token, method: "PATCH", body: options}).catch((error) => { throw error })
        const userPatchedData = await userPatched.json()

        if(userPatched.status === 200){
            return new ClientUserData({...userPatchedData, email}, token, this.api)
        } else {
            throw userPatchedData
        }
    }
}

export default UserManager