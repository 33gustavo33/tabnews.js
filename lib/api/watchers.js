import EventManager from "../util/events.js"
import {getContent} from "./contents.js"
import {getUser} from "./users.js"

function areEqualArrays(array1=[], array2=[]){
    if(!Array.isArray(array1) || !Array.isArray(array2)) return false;
    if(!(array1.length == array2.length)) return false;

    let result = true;
    array1.forEach((value, index) => {
        if(!(value == array2[index])) result = false
    })
    return result
}

function isEqual(value1, value2){
    if(!(typeof value1 == typeof value2)) return false;
    if(value1 == value2) return true;
    if(value1 instanceof Date && value2 instanceof Date) return isEqual(value1.toUTCString(), value2.toUTCString())
    if(Array.isArray(value1) && Array.isArray(value2)) return areEqualArrays(value1, value2)
    return false;
}

function checkWhatHasChanged(data1, data2, observeWhat, defaultObserveWhat){
    let result = {}
    let itemsChanged = 0;
    for(let itemToObserve of observeWhat){
        let value1 = data1[itemToObserve] //newVal
        let value2 = data2[itemToObserve] //lastVal
        if(value1 && defaultObserveWhat.includes(itemToObserve) && !result[itemToObserve]){ //check if the itemToObserve is valid
            if(!isEqual(value1, value2)){ //check if the item has changed
                itemsChanged++
                result[itemToObserve] = value1
                result[itemToObserve+"_before"] = value2
            }
        }
    }
    return {...result, itemsChanged}
}
/**
 * @typedef {Object} eventManager
 * @property {function():void} clearAllListeners
 */
/** @extends {EventManager} */
class Watcher extends EventManager {
    #config = {}
    //"children_deep_count", "updated_at", "owner_username", "tabcoins", "body", "title", "source_url"
    #lastValues = {}
    #observeWhat = []
    #middleware = (data) => data
    constructor(defaultObserveWhat, observeWhat=[], middleware){
        super()

        this.#observeWhat = defaultObserveWhat
        this.#config.observeWhat = defaultObserveWhat
        
        if(Array.isArray(observeWhat)) this.#config.observeWhat = observeWhat
        if(typeof middleware == "function") this.#middleware = middleware

        for(let value of defaultObserveWhat){
            this.#lastValues[value] = null
        }
    }
    /** @private */
    updateAndEmit(data){
        if(!data) return;
        let result = checkWhatHasChanged(data, this.#lastValues, this.#config.observeWhat, this.#config.observeWhat)
        for(let [key, value] of Object.entries(result)){
            this.#lastValues[key] = value;
        }
        let resultAfterMiddleware = this.#middleware(result)
        if(result.itemsChanged > 0) this.emit("watcherUpdate", resultAfterMiddleware)
    }

}

function dateMiddleware(data){
    let result = {...data}
    for(let [key, value] of Object.entries(result)){
        if((key.endsWith("_at") || key.endsWith("_at_before")) && value) result[key] = new Date(value)
    }
    return result
} //middleware to set dates

/**
 * @typedef {Object} watcher_updateContent
 * @property {string} children_deep_count
 * @property {string} children_deep_count_before
 * @property {Date} updated_at
 * @property {Date} updated_at_before
 * @property {string} owner_username
 * @property {string} owner_username_before
 * @property {number} tabcoins
 * @property {number} tabcoins_before
 * @property {string} body
 * @property {string} body_before
 * @property {string} title
 * @property {string} title_before
 * @property {string} source_url
 * @property {string} source_url_before
 * @property {number} itemsChanged
 */
/** @extends {Watcher} */
class ContentWatcher extends Watcher {
    #contentConfig = {}
    #interval;
    #refreshAtMs;
    constructor(author, slug, observeWhat, refreshAtMs){
        super(["children_deep_count", "updated_at", "owner_username", "tabcoins", "body", "title", "source_url"], observeWhat, dateMiddleware)
        this.#contentConfig.author = author
        this.#contentConfig.slug = slug
        this.#refreshAtMs = parseInt(refreshAtMs) ? parseInt(refreshAtMs) : 125000 // 120000 = 2 minutes and 5 seconds
    }
    /**
     * Começa a ouvir um evento
     * @param {"watcherUpdate"} event
     * @param {function(watcher_updateContent, eventManager):void} callback
     */
    on = (event, callback) => this.eventManager.on(event, callback) //is like this because other way JSDoc does not work

    async #fetchAndUpdateAndEmit(){
        let content = await getContent(this.#contentConfig.author, this.#contentConfig.slug).catch((err) => this.emit("error", err))
        if(!content) return;
        this.updateAndEmit(content)
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
/**
 * @typedef {Object} watcher_updateUser
 * @property {Array<String>} features
 * @property {number} tabcoins
 * @property {number} tabcash
 * @property {Array<String>} features_before
 * @property {number} tabcoins_before
 * @property {number} tabcash_before
 */
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
        let user = await getUser(this.#userConfig.username).catch((err) => this.emit("error", err))
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

export {
    ContentWatcher,
    UserWatcher
}