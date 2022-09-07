import fetch, { Headers } from "node-fetch"

export default class {

    #config

    constructor(config){
        this.#config = config;
    }

    get version(){ return "1.0"}

    /**
     * makes a request to the tabnews api.
     * @param {string} endpoint 
     * @param {object} config
     * @param {string} config.token 
     * @param {string} config.method 
     * @param {object} config.body 
     * @returns 
     */
    request(endpoint, config={}){
        let {method, token, body} = config;
        let headers = new Headers()
        headers.set("user-agent", `Mozilla/5.0 (compatible; Tabnews.js/${this.version};)`)
        if(token) headers.set("cookie", `session_id=${token}`)
        if(body){
            headers.set("content-type", "application/json")
            body = JSON.stringify(body)
        }

        return fetch(`${this.#config.tabnewsApiUrl}${endpoint}`, {
            method,
            headers,
            body
        })
    }
}