import fetch, { Headers } from "node-fetch"
import endpoints from "./endpoints.js";

export default class {

    /** @type {import("../types.js").config} */
    #config

    constructor(config){
        this.#config = config;
    }

    /**
     * @returns {import("../types.js").endpoints}
     */
    get endpoints(){ return endpoints }
    get version(){ return "1.0"}
    getUrlOfEndpoint(endpoint){ return this.#config.tabnewsApiUrl + endpoint}

    /**
     * makes a request to the tabnews api.
     * @param {string} endpoint 
     * @param {object} config
     * @param {string} config.token 
     * @param {string} config.method 
     * @param {object} config.body 
     * @returns {Promise}
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

        return fetch(this.getUrlOfEndpoint(endpoint), {
            method,
            headers,
            body
        })
    }
}