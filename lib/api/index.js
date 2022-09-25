import fetch, { Headers, Response } from "node-fetch"
//import endpoints from "./endpoints.json" assert {type: "json"};
const endpoints = {
    "login": "/sessions",
    "user": "/user",
    "users": "/users",
    "content": "/contents",
    "status": {
        "childrenCreated": "/analytics/child-content-published",
        "rootCreated": "/analytics/root-content-published",
        "usersCreated": "/analytics/users-created",
        "status": "/status"
    }
}

import ContentManager from "./contents.js"
import StatusManager from "./status.js"
import UserManager from "./user.js"
import UsersManager from "./users.js"

/**
 * @typedef endpoints
 * @property {string} login
 * @property {string} user
 * @property {string} users
 * @property {string} content
 * @property {object} status
 * @property {object} status.childrenCreated
 * @property {object} status.rootCreated
 * @property {object} status.usersCreated
 * @property {object} status.status
 */

class API {
    #config = {};
    token
    logger;
    endpoints = endpoints;

    constructor(customConfig, logger){
        if(!customConfig || !logger) return;
        this.#config.tabnewsApiUrl = customConfig.tabnewsUrl + "/api/v1"
        this.#config.agentUser = customConfig.customAgentUser 
        this.logger = logger
        this.contents = new ContentManager(this)
        this.status = new StatusManager(this)
        this.user = new UserManager(this)
        this.users = new UsersManager(this)
    }

    get version(){ return "1.1"}

    getUrlOfEndpoint(endpoint){ return this.#config.tabnewsApiUrl + endpoint}

    #buildRequestConfig(method, token, body){
        const headers = new Headers()
        const config = {}

        headers.set("user-agent", `Mozilla/5.0 (compatible; Tabnews.js/${this.version}; ${this.#config.agentUser})`)
        if(this.token) headers.set("cookie", `session_id=${this.token}`)
        if(token) headers.set("cookie", `session_id=${token}`)
        if(body){
            headers.set("content-type", "application/json")
            config.body = JSON.stringify(body)
        }

        config.headers = headers
        config.method = method
        return config
    }

    /**
     * faz um request para a api do tabnews
     * @param {string} endpoint 
     * @param {object} [options]
     * @param {string} options.token
     * @param {string} options.method 
     * @param {object} options.body 
     * @returns {Promise<Response>}
     */
    request(endpoint, options={}){
        const {method, token, body} = options;
        const requestConfig = this.#buildRequestConfig(method, token, body)

        this.logger.logRequest(endpoint, method, token, body)

        return fetch(this.getUrlOfEndpoint(endpoint), requestConfig)
    }
}

export {
    API
}

export default API