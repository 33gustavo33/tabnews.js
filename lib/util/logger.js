export default class {
    #config = {};
    
    constructor(config){
        this.#config = config;
    }

    #colors = {
        "white": "1;37",
        "red": "0;31",
        "green": "0;32",
        "blue": "0;34"
    }
    /**
     * @param {string} text 
     */
    log(text){
        //To-do: adicionar cores
        if(this.#config.log) console.log(text)
    }

    blank(){
        if(this.#config.log) console.log()
    }
}