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
import {setApiTypes} from "../util/types.js"

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

    constructor(customConfig){
        this.#config.tabnewsApiUrl = customConfig.tabnewsUrl + "/api/v1"
        setApiContents(this)
        setApiUsers(this)
        setApiTypes(this)
    }

    /**
     * @returns {endpoints}
     */
    get endpoints(){ return endpoints }
    get version(){ return "1.0"}
    getUrlOfEndpoint(endpoint){ return this.#config.tabnewsApiUrl + endpoint}
    get contents(){
        return {get: getContent, getContents, post: postContent, edit: editContent, delete: deleteContent, upvote, downvote}
    }
    get users(){
        return {get: getUser, getContents: getUserContents}
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