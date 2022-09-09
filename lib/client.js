import default_config from "./config.js"
import validator from "./validator/index.js"
import API from "./api/index.js"
import {tabNewsError, tabNewsHttpError} from "./error/index.js"
import {clientUserData} from "./types/index.js"

export default class {
    /** @type {import("./type.js").config} */
    #config = default_config;
    /** @type {string} */
    #token;
    /** @type {string} */
    #id;
    /** @type {clientUserData} */
    #userData;
    /** @type {boolean} */
    #connected;
    /** @type {import("./type.js").loginData} */
    #loginData;
    /** @type {API} */
    api;
    /**
     * cria o cliente.
     * @param {import("./type.js").config} [customConfig]
     */

    constructor(customConfig={}){
        if(customConfig){
            let validConfig = validator.validateConfig(customConfig, this.#config)
            if(validConfig.valid) this.#config = validConfig.result
        }
        this.api = new API(this.#config)
    }

    get connected(){return this.#connected}
    get config(){return this.#config}

    /**
     * Conecte seu cliente a uma conta.
     * @param {import("./type.js").loginData} loginData
     * @returns {Promise<clientUserData>}
     */

    login(loginData){
        return new Promise((resolve, reject) => {
            this.api.request(this.api.endpoints.login, {method: "POST", body: loginData}).then(async (res) => {
                let data = await res.json()
                if(res.status === 201){
                    this.#token = data.token
                    this.#connected = true;
                    this.#loginData = loginData

                    this.api.request(this.api.endpoints.user+"/", {token: this.#token}).then(async (res) => {
                        let data = await res.json()
                        if(res.status === 200){
                            this.#id = data.id
                            this.#userData = new clientUserData(data, this.#token)
                            resolve(this.#userData)
                        } else reject(data)
                    }).catch((err) => {
                        throw new tabNewsHttpError(err, this.api.getUrlOfEndpoint(this.api.endpoints.login))
                    })

                } else reject(data)
            }).catch((err) => {
                throw new tabNewsHttpError(err, this.api.getUrlOfEndpoint(this.api.endpoints.user))
            })
        })
    }
}