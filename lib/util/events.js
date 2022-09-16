import {ClientUserData} from "./types.js"
function isArray(array){
    if(typeof array == "object" && !(array == null)) return (array).forEach ? true : false
    return false
}

/**
 * @typedef {ClientUserData} data
 */
/**
 * @typedef {Object} eventManager
 * @property {function():void} clearAllListeners
 */

//Temporario esse arquivo, eu vou deletar ele quando eu entender como documentar um EventEmitter(Solução nativa do node.js pra eventos)

export default class { 
    #events = {}
    eventManager = {
        select: (eventName) => {
            return this.#events[eventName]
        },
        set: (eventName, value) => {
            return this.#events[eventName] = value
        },
        create: (eventName) => {
            let eventArray = this.eventManager.select(eventName)
            if(!isArray(eventArray)) this.eventManager.set(eventName, [])
        },
        on: (event, callback) => {
            this.eventManager.create(event)
            return this.eventManager.select(event).push(callback)
        },
        emit: (event, ...data) => {
            this.eventManager.create(event)
            let allEvents = this.eventManager.select(event)
            allEvents.forEach((callback) => {
                if(typeof callback == "function") callback(...data, this.eventManager.publicEventManager(event))
            })
        },
        publicEventManager: (event) => {
            return {
                clearAllListeners: () => {
                    this.#events[event] = []
                }
            }
        }
    }

    emit = this.eventManager.emit
    /**
     * Começa a ouvir um evento
     * @param {"ready" | "destroyed"} event
     * @param {function(data, eventManager):void} callback
     */
    on = (event, callback) => this.eventManager.on(event, callback) //is like this because other way JSDoc does not work

}