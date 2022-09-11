//import default_config from "./config.json" assert {type: "json"};
// no futuro quando o node não exibir mais a mensagem 
// (node:11380) ExperimentalWarning: Importing JSON modules is an experimental feature. This feature could change at any time
// eu vou descomentar a primeira linha e deletar a de baixo.
const default_config = {
    "tabnewsUrl": "https://www.tabnews.com.br/",
    "log": true
}
import validator from "./util/validator.js"
import API from "./api/index.js"
import logger from "./util/logger.js"
import {tabNewsError, tabNewsHttpError} from "./util/error.js"
import {ClientUserData, Content, Status, UserData} from "./util/types.js"

/**
 * @typedef loginData
 * @property {string} [email]
 * @property {string} [password]
 * @property {string} [token]
 */

/**
 * @typedef config
 * @property {string} tabnewsUrl
 * @property {boolean} log
 */

/**
 * @typedef tabcoins_result
 * @property {number} tabcoins
 */

export default class {
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
    #logger

    /**
     * cria o cliente.
     * @param {config} [customConfig]
     */
    constructor(customConfig={}){
        this.#config = validator.validateConfig(customConfig, default_config)
        this.api = new API(this.#config)
        this.#logger = new logger(this.#config)
        this.#logger.blank()
        this.#logger.log("TABNEWS.JS: A api do tabnews está mudando constantemente, então o codigo do tabnews.js pode facilmente quebrar.\nPor isso caso o tabnews.js pare de funcionar, verifique se há uma versão mais recente! ")
        this.#logger.blank()
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
             * @return {Promise<[Content]>}
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
            }
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
                return new Promise(async (resolve, reject) => {
                    let status = await this.api.request(this.api.endpoints.status.status).then(res => res.json()).catch((err) => {throw new tabNewsHttpError(err, this.api.getUrlOfEndpoint(this.api.endpoints.status.status))})
                    let users = await this.api.request(this.api.endpoints.status.usersCreated).then(res => res.json()).catch((err) => {throw new tabNewsHttpError(err, this.api.getUrlOfEndpoint(this.api.endpoints.status.usersCreated))})
                    let root = await this.api.request(this.api.endpoints.status.rootCreated).then(res => res.json()).catch((err) => {throw new tabNewsHttpError(err, this.api.getUrlOfEndpoint(this.api.endpoints.status.rootCreated))})
                    let child = await this.api.request(this.api.endpoints.status.childrenCreated).then(res => res.json()).catch((err) => {throw new tabNewsHttpError(err, this.api.getUrlOfEndpoint(this.api.endpoints.status.childrenCreated))})
                    resolve(new Status({status, users, root, child}))
                })
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
             */
            get: (username) => {
                return this.api.users.get(username)
            },
            /**
             * retorna todos os conteúdos de um usuario
             * @param {string} username
             * @param {"new" | "old" | "relevant"} [strategy] 
             * @param {number} [page]
             * @return {Promise<[Content]>}
             */
            getContentsOfUser: (username, strategy="new", page=1) => {
                return this.api.users.getContents(username, strategy, page)
            }
        }
    }
    get user(){
        if(!this.#connected) throw new tabNewsError("Você não pode acessar a propriedade user do Client enquanto o Client não está logado.")
        return {
            /**
             * @returns {UserData} 
             */
            get: () => {
                return this.#userData
            },
            /**
             * @returns {Promise<UserData>}
             */
            updateInfo: () => {
                return this.#getUserData()
            },
            /**
             * edita o usuario do client
             * @param {object} options 
             * @param {string} [options.username]
             */
            edit: (options={}) => {
                return new Promise((resolve, reject) => {
                    this.api.request(`${this.api.endpoints.users}/${this.#userData.username}`, {token: this.#token, method: "PATCH", body: options}).then(async (res) => {
                        let data = await res.json()
                        if(res.status == 200){
                            let user = new ClientUserData({...data, email: this.#userData.email}, this.#token)
                            this.#userData = user;
                            resolve(user)
                        } else reject(data)
                    }).catch((err) => {
                        throw new tabNewsHttpError(err, this.api.getUrlOfEndpoint(`${this.api.endpoints.users}/${this.#userData.username}`))
                    })
                })
            }
        }
    }

    #getToken(loginData){
        return new Promise((resolve, reject) => {
            this.api.request(this.api.endpoints.login, {method: "POST", body: loginData}).then(async (res) => {
                let data = await res.json()
                if(res.status === 201){
                    resolve(data.token)
                } else reject(data)
            }).catch((err) => {
                throw new tabNewsHttpError(err, this.api.getUrlOfEndpoint(this.api.endpoints.user))
            })
        })
    }
    /** @returns {Promise<ClientUserData>} */
    #getUserData(){
        return new Promise(async (resolve, reject) => {
            this.api.request(this.api.endpoints.user+"/", {token: this.#token}).then(async (res) => { 
                let data = await res.json()
                if(res.status === 200){
                    this.#userData = new ClientUserData(data, this.#token)
                    resolve(this.#userData)
                } else reject(data)
            }).catch((err) => {
                throw new tabNewsHttpError(err, this.api.getUrlOfEndpoint(this.api.endpoints.login))
            })
        })
    }

    /**
     * Conecte seu cliente a uma conta.
     * @param {loginData} loginData
     * @returns {Promise<ClientUserData>}
     */

    login(loginData){
        return new Promise(async (resolve, reject) => {
            let token = loginData.token
            if(!token) token = await this.#getToken(loginData).catch(reject)
            if(!token) return;
            this.#token = token

            let user = await this.#getUserData().catch(reject)
            if(!user) return;

            this.#connected = true;
            this.#loginData = loginData
            this.#id = user.id
            resolve(user)
        })
    }
    /**
     * destroi a conexão atual do client
     */
    destroy(){
        this.#token = undefined;
        this.#userData = undefined;
        this.#connected = false;
        this.#id = undefined;
    }
}