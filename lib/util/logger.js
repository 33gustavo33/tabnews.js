export default class {
    #config = {};
    
    constructor(config){
        this.#config = config;
    }

    log(text){
        if(this.#config.log) console.log(text)
    }

    blank(){
        if(this.#config.log) console.log()
    }
}