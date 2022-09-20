//import default_config from "./config.json" assert {type: "json"};
// no futuro quando o node não exibir mais a mensagem 
// (node:11380) ExperimentalWarning: Importing JSON modules is an experimental feature. This feature could change at any time
// eu vou descomentar a primeira linha e deletar a de baixo.
const default_config = {
    "tabnewsUrl": "https://www.tabnews.com.br",
    "log": true,
    "customAgentUser": "default",
    "debug": false
}
import validator from "./util/validator.js"
import API from "./api/index.js"
import logger from "./util/logger.js"
import EventManager from "./util/events.js"
import {tabNewsError, tabNewsHttpError} from "./util/error.js"
import {ClientUserData, Content, Status, UserData} from "./util/types.js"
import { StatusWatcher } from "./api/status.js"
import { ContentWatcher, UserWatcher } from "./api/watchers.js"

/**
 * @typedef loginData
 * @property {string} [email]
 * @property {string} [password]
 * @property {string} [token]
 */

/**
 * @typedef config
 * @property {string} [tabnewsUrl]
 * @property {boolean} [log]
 * @property {string} [customAgentUser]
 * @property {boolean} [debug]
 */

/**
 * @typedef tabcoins_result
 * @property {number} tabcoins
 */

/**
 * A classe principal do client
 * @extends {EventManager}
 */

export default class Client extends EventManager {
    /** @type {config} */
    #config;
    /** @type {string} */
    #token;
    /** @type {string} */
    #id;
    /** @type {ClientUserData} */
    #userData;
    /** @type {boolean} */
    #connected;
    /** @type {loginData} */
    #loginData;
    /** @type {API} */
    api;
    /** @type {logger} */
    logger

    /**
     * cria o cliente.
     * @param {config} [customConfig]
     */
    constructor(customConfig={}){
        super()
        this.#config = validator.validateConfig(customConfig, default_config)
        this.logger = new logger(this.#config)
        this.api = new API(this.#config, this.logger)
        if(this.#config.debug) this.logger.printLogo()
    }
    
    get connected(){return this.#connected}
    get token(){return this.#token}
    get contents(){
        if(!this.#connected) throw new tabNewsError("Você não pode acessar a propriedade contents do Client enquanto o Client não está logado.")
        return {
            /**
             * obtém um conteúdo
             * @param {string} author
             * @param {string} slug
             * @returns {Promise<Content>}
             */
            get: (author, slug) => {
                return this.api.contents.get(author, slug)
            },
            /**
             * retorna todos os conteúdos atuais
             * @param {"new" | "old" | "relevant"} [strategy] 
             * @param {number} [page]
             * @return {Promise<Content[]>}
             */
            getContents: (strategy="new", page=1) => {
                return this.api.contents.getContents(strategy, page)
            },
            /** 
             * posta um conteúdo
             * @param {object} content
             * @param {string} [content.parentId]
             * @param {string} [content.customSlug]
             * @param {string} [content.title]
             * @param {string} content.body
             * @param {string} [content.sourceUrl]
             * @returns {Promise<Content>}
             */
            post: (content) => {
                return this.api.contents.post(content, this.#token)
            },
            /** 
             * edita um conteúdo
             * @param {string} author
             * @param {string} slug
             * @param {object} content
             * @param {string} [content.title]
             * @param {string} [content.body]
             * @param {string} [content.sourceUrl]
             * @returns {Promise<Content>}
             */
            edit: (author, slug, content) => {
                return this.api.contents.edit(author, slug, content, this.#token)
            },
            /** 
             * deleta um conteúdo
             * @param {string} author
             * @param {string} slug
             * @returns {Promise<Content>}
             */
            delete: (author, slug) => {
                return this.api.contents.delete(author, slug, this.#token)
            },
            /**
             * dá uma tabcoin para um conteudo
             * @param {string} author 
             * @param {string} slug 
             * @returns {Promise<tabcoins_result>}
             */
            upvote: (author, slug) => {
                return this.api.contents.upvote(author, slug, this.#token)
            },
            /**
             * retira um tabcoin de um conteúdo
             * @param {string} author 
             * @param {string} slug 
             * @returns {Promise<tabcoins_result>}
             */
            downvote: (author, slug) => {
                return this.api.contents.downvote(author, slug, this.#token)
            },
            /**
             * @param {string} author 
             * @param {string} slug 
             * @param {Array<"children_deep_count" | "updated_at" | "owner_username" | "tabcoins" | "body" | "title" | "source_url">} [observeWhat]
             * @param {number} ms
             * @returns {ContentWatcher}
             */ 
            watch: (author, slug, observeWhat, ms) => new this.api.contents.watcher(author, slug, observeWhat, ms)
        }
    }
    get status(){
        if(!this.#connected) throw new tabNewsError("Você não pode acessar a propriedade status do Client enquanto o Client não está logado.")
        return {
            /**
             * obtém os status do tabnews.
             * @returns {Promise<Status>}
             */
            get: () => {
                return this.api.status.get()
            },
            /**
             * @param {number} ms 
             * @returns {StatusWatcher}
             */
            watch: (ms) => new this.api.status.watcher(ms)
        }
    }
    get users(){
        if(!this.#connected) throw new tabNewsError("Você não pode acessar a propriedade users do Client enquanto o Client não está logado.")
        return {
            /**
             * obtém um usuario
             * @param {string} username
             * @returns {Promise<UserData>}
             */
            get: (username) => {
                return this.api.users.get(username)
            },
            /**
             * retorna todos os conteúdos de um usuario
             * @param {string} username
             * @param {"new" | "old" | "relevant"} [strategy] 
             * @param {number} [page]
             * @return {Promise<Content[]>}
             */
            getContentsOfUser: (username, strategy="new", page=1) => {
                return this.api.users.getContents(username, strategy, page)
            },
            /**
             * @param {string} username
             * @param {Array<"features" | "tabcoins" | "tabcash">} [observeWhat]
             * @param {number} ms
             * @returns {UserWatcher}
             */ 
            watch: (username, observeWhat, ms) => new this.api.users.watch(username, observeWhat, ms)
        }
    }
    get user(){
        if(!this.#connected) throw new tabNewsError("Você não pode acessar a propriedade user do Client enquanto o Client não está logado.")
        return {
            /**
             * @returns {Promise<ClientUserData>} 
             */
            get: () => {
                return new Promise((resolve, reject) => {
                    this.api.user.get(this.#token).then((user) => {
                        this.#userData = user;
                        resolve(user)
                    }).catch(reject)
                })
            },
            /**
             * edita o usuario do client
             * @param {object} options 
             * @param {string} [options.username]
             * @returns {Promise<ClientUserData>}
             */
            edit: (options={}) => {
                return new Promise((resolve, reject) => {
                    this.api.user.edit(options, this.#userData.username, this.#userData.email, this.#token).then((user) => {
                        this.#userData = user;
                        resolve(user)
                    }).catch(reject)
                })
            },
            /**
             * @param {Array<"features" | "tabcoins" | "tabcash">} [observeWhat]
             * @param {number} ms
             * @returns {UserWatcher}
             */ 
            watch: (observeWhat, ms) => new this.api.users.watch(this.#userData.username, observeWhat, ms),

            ...this.#userData
        }
    }

    /**
     * Conecte seu cliente a uma conta.
     * @param {loginData} loginData
     * @returns {Promise<ClientUserData>}
     * @example
     * client.login({email: "example@example.com", password: "examplePassword"})
     * client.login({token: "my token"})
     */

    login(loginData){
        return new Promise(async (resolve, reject) => {
            let token = loginData.token
            if(!token) token = await this.api.user.getToken(loginData).catch(reject)
            if(!token) return;
            this.#token = token

            let user = await this.api.user.get(this.#token).catch(reject)
            if(!user) return;

            this.#connected = true;
            this.#loginData = loginData
            this.#id = user.id
            this.#userData = user
            resolve(user)
            this.emit("ready", user)
        })
    }
    /**
     * destroi a conexão atual do client
     * @example
     * client.destroy()
     */
    destroy(){
        this.#token = undefined;
        this.#connected = false;
        this.#id = undefined;
        this.emit("destroyed", this.#userData)
        this.#userData = undefined;
    }
}