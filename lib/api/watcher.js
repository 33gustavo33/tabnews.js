import EventManager from "../util/events.js"

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

function checkIfValueExists(value){
    return !(typeof value === 'undefined' || value === null) 
}

function checkWhatHasChanged(data1, data2, observeWhat, defaultObserveWhat){
    let result = {}
    let itemsChanged = 0;
    for(let itemToObserve of observeWhat){
        let value1 = data1[itemToObserve] //newVal
        let value2 = data2[itemToObserve] //lastVal
        if(checkIfValueExists(value1) && defaultObserveWhat.includes(itemToObserve) && !result[itemToObserve]){ //check if the itemToObserve is valid
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
        let result = checkWhatHasChanged(data, this.#lastValues, this.#config.observeWhat, this.#observeWhat)
        for(let [key, value] of Object.entries(result)){
            this.#lastValues[key] = value;
        }
        let resultAfterMiddleware = this.#middleware(result)
        if(result.itemsChanged > 0) this.emit("watcherUpdate", resultAfterMiddleware)
    }

}

export {
    Watcher
}