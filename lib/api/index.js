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
import {setApiContents, getContent, getContents, postContent, editContent, deleteContent, upvote, downvote} from "./contents.js"
import {setApiUsers, getUser, getUserContents} from "./users.js"
import {setApiUser, getUserData, getUserToken, editUser} from "./user.js"
import {setApiStatus, getStatus, StatusWatcher} from "./status.js"
import {setApiTypes} from "../util/types.js"
import { ContentWatcher, UserWatcher } from "./watchers.js"

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

export default class {
    #config = {};
    logger;

    constructor(customConfig, logger){
        this.#config.tabnewsApiUrl = customConfig.tabnewsUrl + "/api/v1"
        this.#config.agentUser = customConfig.customAgentUser 
        this.logger = logger
        setApiContents(this)
        setApiUsers(this)
        setApiUser(this)
        setApiStatus(this)
        setApiTypes(this)
    }

    /**
     * @returns {endpoints}
     */
    get endpoints(){ return endpoints }
    get version(){ return "1.0"}
    getUrlOfEndpoint(endpoint){ return this.#config.tabnewsApiUrl + endpoint}
    get contents(){
        return {get: getContent, getContents, post: postContent, edit: editContent, delete: deleteContent, upvote, downvote, watcher: ContentWatcher}
    }
    get users(){
        return {get: getUser, getContents: getUserContents, watch: UserWatcher}
    }
    get user(){
        return {get: getUserData, getToken: getUserToken, edit: editUser}
    }
    get status(){
        return{get: getStatus, watcher: StatusWatcher}
    }

    /**
     * faz um request para a api do tabnews
     * @param {string} endpoint 
     * @param {object} [config]
     * @param {string} config.token
     * @param {string} config.method 
     * @param {object} config.body 
     * @returns {Promise<Response>}
     */
    request(endpoint, config={}){
        let {method, token, body} = config;
        let headers = new Headers()
        headers.set("user-agent", `Mozilla/5.0 (compatible; Tabnews.js/${this.version}; ${this.#config.agentUser})`)
        if(token) headers.set("cookie", `session_id=${token}`)
        if(body){
            headers.set("content-type", "application/json")
            body = JSON.stringify(body)
        }
        this.logger.logRequest(endpoint, method, token, body)

        return fetch(this.getUrlOfEndpoint(endpoint), {
            method,
            headers,
            body
        })
    }
}