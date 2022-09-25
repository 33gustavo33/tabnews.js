import { tabNewsTypeError } from "../util/error.js"
import { UserData, Content } from "../util/types.js"
import { API } from "./index.js"
import { Watcher } from "./watcher.js"

/**
 * @typedef {Object} watcher_updateUser
 * @property {Array<String>} features
 * @property {number} tabcoins
 * @property {number} tabcash
 * @property {Array<String>} features_before
 * @property {number} tabcoins_before
 * @property {number} tabcash_before
 */

function createWatcher(api){
    /** @extends {Watcher} */
    class UserWatcher extends Watcher {
        #userConfig = {}
        #interval;
        #refreshAtMs;
        constructor(username, observeWhat, refreshAtMs){
            super(["features", "tabcoins", "tabcash"], observeWhat)
            this.#userConfig.username = username
            this.#refreshAtMs = parseInt(refreshAtMs) ? parseInt(refreshAtMs) : 125000 // 120000 = 2 minutes and 5 seconds
        }
        /**
         * Começa a ouvir um evento
         * @param {"watcherUpdate"} event
         * @param {function(watcher_updateUser, eventManager):void} callback
         */
        on = (event, callback) => this.eventManager.on(event, callback) //is like this because other way JSDoc does not work

        async #fetchAndUpdateAndEmit(){
            let user = await api.users.getUser(this.#userConfig.username).catch((err) => this.emit("error", err))
            if(!user) return;
            this.updateAndEmit(user)
        }
        start(){
            this.fetch()
            setInterval(() => {
                this.fetch()
            }, this.#refreshAtMs)
        }
        fetch(){
            this.#fetchAndUpdateAndEmit()
        }
        stop(){
            clearInterval(this.#interval)
        }
    }
    return UserWatcher
}

class UsersManager {
    /** @type {API} @private */
    api
    watcher

    constructor(api){
        if(api instanceof API){
            this.api = api
            this.watcher = createWatcher(api)
        } else {
            throw new tabNewsTypeError("API needs to be a instance of API")
        }
    }

    async getUser(username){
        const user = await this.api.request(`${this.api.endpoints.users}/${username}`).catch((error) => { throw error })
        const userData = await user.json()

        if(user.status === 200){
            return new UserData(userData, this.api)
        } else {
            throw userData
        }
    }
}

export default UsersManager