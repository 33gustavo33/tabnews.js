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
import { tabNewsError } from "./util/error.js"
import { ClientUserData, Content, Status, UserData } from "./util/types.js"

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
             * @example
             * client.contents.get("filipedeschamps", "tentando-construir-um-pedaco-de-internet-mais-massa")
             */
            get: (author, slug) => {
                return this.api.contents.getContent(author, slug)
            },
            /**
             * retorna todos os conteúdos atuais
             * @param {"new" | "old" | "relevant"} [strategy] 
             * @param {number} [page]
             * @return {Promise<Content[]>}
             * @example
             * client.contents.getContents()
             * client.contents.getContents("relevant", 3)
             * client.contents.getContents("old")
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
             * @example
             * client.contents.post({
             *    title: "Olá"
             *    body: "Mundo!"
             * })
             */
            post: (content) => {
                return this.api.contents.postContent(content, this.#token)
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
             * @example
             * client.contents.edit("filipedeschamps", "tentando-construir-um-pedaco-de-internet-mais-massa", {title: "Novo titulo"})
             */
            edit: (author, slug, content) => {
                return this.api.contents.editContent(author, slug, content, this.#token)
            },
            /** 
             * deleta um conteúdo
             * @param {string} author
             * @param {string} slug
             * @returns {Promise<Content>}
             * @example
             * client.contents.delete("filipedeschamps", "tentando-construir-um-pedaco-de-internet-mais-massa")
             */
            delete: (author, slug) => {
                return this.api.contents.deleteContent(author, slug, this.#token)
            },
            /**
             * dá uma tabcoin para um conteudo
             * @param {string} author 
             * @param {string} slug 
             * @returns {Promise<tabcoins_result>}
             * @example
             * client.contents.upvote("filipedeschamps", "tentando-construir-um-pedaco-de-internet-mais-massa")
             */
            upvote: (author, slug) => {
                return this.api.contents.upvote(author, slug, this.#token)
            },
            /**
             * retira um tabcoin de um conteúdo
             * @param {string} author 
             * @param {string} slug 
             * @returns {Promise<tabcoins_result>}
             * @example
             * client.contents.get("filipedeschamps", "tentando-construir-um-pedaco-de-internet-mais-massa")
             */
            downvote: (author, slug) => {
                return this.api.contents.downvote(author, slug, this.#token)
            },
            /**
             * @param {string} author 
             * @param {string} slug 
             * @param {Array<"children_deep_count" | "updated_at" | "owner_username" | "tabcoins" | "body" | "title" | "source_url">} [observeWhat]
             * @param {number} ms
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
             * @example
             * client.status.get()
             */
            get: () => {
                return this.api.status.getStatus()
            }
        }
    }
    get users(){
        if(!this.#connected) throw new tabNewsError("Você não pode acessar a propriedade users do Client enquanto o Client não está logado.")
        return {
            /**
             * obtém um usuario
             * @param {string} username
             * @returns {Promise<UserData>}
             * @example
             * client.users.get("gustavo33")
             */
            get: (username) => {
                return this.api.users.getUser(username)
            },
            /**
             * retorna todos os conteúdos de um usuario
             * @param {string} username
             * @param {"new" | "old" | "relevant"} [strategy] 
             * @param {number} [page]
             * @return {Promise<Content[]>}
             * @example
             * client.users.getContentsOfUser("gustavo33", "old")
             */
            getContentsOfUser: (username, strategy="new", page=1) => {
                return this.api.contents.getUserContents(username, strategy, page)
            },
            /**
             * @param {string} username
             * @param {Array<"features" | "tabcoins" | "tabcash">} [observeWhat]
             * @param {number} ms
             */ 
            watch: (username, observeWhat, ms) => new this.api.users.watcher(username, observeWhat, ms)
        }
    }
    get user(){
        if(!this.#connected) throw new tabNewsError("Você não pode acessar a propriedade user do Client enquanto o Client não está logado.")
        return {
            /**
             * @returns {Promise<ClientUserData>} 
             * @example
             * client.user.get()
             */
            get: () => {
                return new Promise((resolve, reject) => {
                    this.api.user.getUserData(this.#token).then((user) => {
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
             * @example
             * client.user.edit({username: "Novo username"})
             */
            edit: (options={}) => {
                return new Promise((resolve, reject) => {
                    this.api.user.editUser(options, this.#userData.username, this.#userData.email, this.#token).then((user) => {
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
            if(this.connected) resolve(this.#userData)

            let token = loginData.token
            if(!token) token = await this.api.user.getUserToken(loginData).catch(reject)
            if(!token) return;
            this.#token = token

            let user = await this.api.user.getUserData(this.#token).catch(reject)
            if(!user) return;

            this.#connected = true;
            this.#loginData = loginData
            this.#id = user.id
            this.#userData = user
            this.api.token = token

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