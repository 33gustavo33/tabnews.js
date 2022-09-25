import { tabNewsTypeError } from "../util/error.js"
import { Status } from "../util/types.js"
import { API } from "./index.js"

class StatusManager {
    /** @type {API} @private*/
    api

    constructor(api){
        if(api instanceof API){
            this.api = api
        } else {
            throw new tabNewsTypeError("API needs to be a instance of API")
        }
    }

    async getStatus(){
        let status = await this.api.request(this.api.endpoints.status.status).then(res => res.json()).catch((error) => { throw error })
        let users = await this.api.request(this.api.endpoints.status.usersCreated).then(res => res.json()).catch((error) => { throw error })
        let root = await this.api.request(this.api.endpoints.status.rootCreated).then(res => res.json()).catch((error) => { throw error })
        let child = await this.api.request(this.api.endpoints.status.childrenCreated).then(res => res.json()).catch((error) => { throw error })
        return new Status({status, users, root, child})
    }
}

export default StatusManager