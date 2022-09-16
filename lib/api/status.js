import {tabNewsHttpError, tabNewsError} from "../util/error.js"
import { Status } from "../util/types.js"
import EventManager from "../util/events.js"
let api;

function setApiStatus(toBeSetApi){
    api = toBeSetApi
}

/** @returns {Promise<Status>} */
function getStatus(){
    return new Promise(async (resolve, reject) => {
        let status = await api.request(api.endpoints.status.status).then(res => res.json()).catch((err) => {throw new tabNewsHttpError(err, api.getUrlOfEndpoint(api.endpoints.status.status))})
        let users = await api.request(api.endpoints.status.usersCreated).then(res => res.json()).catch((err) => {throw new tabNewsHttpError(err, api.getUrlOfEndpoint(api.endpoints.status.usersCreated))})
        let root = await api.request(api.endpoints.status.rootCreated).then(res => res.json()).catch((err) => {throw new tabNewsHttpError(err, api.getUrlOfEndpoint(api.endpoints.status.rootCreated))})
        let child = await api.request(api.endpoints.status.childrenCreated).then(res => res.json()).catch((err) => {throw new tabNewsHttpError(err, api.getUrlOfEndpoint(api.endpoints.status.childrenCreated))})
        resolve(new Status({status, users, root, child}))
    })
}

/**
 * @typedef {Status} watcher_update
 */
/**
 * @typedef {Object} eventManager
 * @property {function():void} clearAllListeners
 */

class StatusWatcher extends EventManager {
    #refreshAtMs = 125000;
    #interval;
    constructor(refreshAtMs){
        super()
        this.#refreshAtMs = parseInt(refreshAtMs) ? parseInt(refreshAtMs) : 125000 // 120000 = 2 minutes and 5 seconds
    }

    /**
     * Começa a ouvir um evento
     * @param {"watcherUpdate"} event
     * @param {function(watcher_update, eventManager):void} callback
     */
    on = (event, callback) => this.eventManager.on(event, callback) //is like this because other way JSDoc does not work

    async #fetchAndUpdateAndEmit(){
        let status = await getStatus().catch((err) => this.emit("error", err))
        if(!status) return;
        this.emit("watcherUpdate", status) //is like this because status will always change!
    }

    start(){
        this.#fetchAndUpdateAndEmit()
        this.#interval = setInterval(() => this.#fetchAndUpdateAndEmit(), this.#refreshAtMs)
    }

    fetch(){
        this.#fetchAndUpdateAndEmit()
    }

    destroy(){
        clearInterval(this.#interval)
    }
}

//esse é o unico lugar que o Watcher está separado, você me pergunta: porque?
//eu respondo: O status sempre vai estar mudando! então não vale a pena comparar os valores atuais com os valores anteriores
//e por isso, ele não é exatamente um Watcher. então ele fica aqui.

export {
    setApiStatus,
    getStatus,
    StatusWatcher
}