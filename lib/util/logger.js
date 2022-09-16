const logo = `
████████╗ █████╗ ██████╗ ███╗   ██╗███████╗██╗    ██╗███████╗        ██╗███████╗  v1.1.0
╚══██╔══╝██╔══██╗██╔══██╗████╗  ██║██╔════╝██║    ██║██╔════╝        ██║██╔════╝
   ██║   ███████║██████╔╝██╔██╗ ██║█████╗  ██║ █╗ ██║███████╗        ██║███████╗
   ██║   ██╔══██║██╔══██╗██║╚██╗██║██╔══╝  ██║███╗██║╚════██║   ██   ██║╚════██║
   ██║   ██║  ██║██████╔╝██║ ╚████║███████╗╚███╔███╔╝███████║██╗╚█████╔╝███████║
   ╚═╝   ╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═══╝╚══════╝ ╚══╝╚══╝ ╚══════╝╚═╝ ╚════╝ ╚══════╝`

export default class {
    #config = {};
    
    constructor(config){
        this.#config = config;
    }

    #colors = {
        "white": "1;37",
        "default": "0",
        "red": "0;31",
        "green": "0;32",
        "blue": "0;34"
    }

    /**
     * @param {string} text 
     * @param {"white" | "red" | "green" | "blue"} [color]
     */
    log(text, color, omitSymbol){
        if(!this.#config.log) return;
        let colorSelected = this.#colors[color] ? this.#colors[color] : this.#colors["default"]
        let defaultSymbol = "";

        if(!omitSymbol) defaultSymbol = "Tabnews.JS> "
        console.log("\x1b[%sm%s\x1b[%sm%s\x1b[0m", this.#colors["blue"], defaultSymbol, colorSelected, text)
    }

    printLogo(){
        if(!this.#config.debug) return
        let colorSelected = "green"
        this.log(logo, colorSelected, true)
        this.log(`Modo Log: ${this.#config.log}`, colorSelected, true)
        this.log(`Modo debug: ${this.#config.debug}`, colorSelected, true)
        this.log(`Url do tabnews: ${this.#config.tabnewsUrl} : ${this.#config.customAgentUser}`, colorSelected, true)
        this.blank()       
    }

    blank(){
        if(!this.#config.log) return 
        console.log()
    }
    /**
     * @param {string} endpoint 
     * @param {string} method 
     * @param {string} token 
     * @param {string} body 
     */
    logRequest(endpoint, method="GET", token=null, body=null){
        if(!this.#config.debug) return;
        if(!endpoint || !method) return;
        let tokenString = token ? token : "no token"
        let bodyString = body ? JSON.stringify(body) : "no body"
        this.log(`Api: REQUEST ${method} TO ${endpoint}. With token: ${tokenString} - With body: ${bodyString}`, "green")
    }
}