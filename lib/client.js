import default_config from "./config.js"
import validator from "./validator/index.js"
import API from "./api/index.js"

/**
 * @typedef userData
 * @property {string} id
 * @property {string} username
 * @property {string} email
 * @property {Array<string>} features
 * @property {number} tabcoins
 * @property {number} tabcash
 * @property {string} created_at
 * @property {string} updated_at
 * @property {string} token
 */

export default class {
    #config = default_config
    #token;
    #id;
    #userData;
    #connected;
    api;

    /**
     * cria o cliente.
     * @param {object} customConfig 
     * @param {string} customConfig.tabnewsUrl
     * @param {string} customConfig.tabnewsApiUrl
     */

    constructor(customConfig={}){
        let validConfig = validator.validateConfig(customConfig, this.#config)
        if(validConfig.valid) this.#config = validConfig.result
        this.api = new API(this.#config)
    }

    get connected(){return this.#connected}
    get config(){return this.#config}

    /**
     * Conecte seu cliente a uma conta.
     * @param {object} loginData
     * @param {string} loginData.email
     * @param {string} loginData.password
     * @returns {Promise<userData>}
     */

    login(loginData){
        return new Promise((resolve, reject) => {
            this.api.request("/sessions", {method: "POST", body: loginData}).then(async (res) => {
                let data = await res.json()
                if(res.status === 201){
                    this.#token = data.token
                    this.#id = data.id
                    this.#connected = true;
                    this.api.request("/user", {token: this.#token}).then(async (res) => {
                        let data = await res.json()
                        if(res.status === 200){
                            this.#userData = {...data, token: this.#token, id: this.#id}
                            resolve(this.#userData)
                        } else reject(data)
                    }).catch((err) => {
                        throw new Error(err)
                    })
                } else reject(data)
            }).catch((err) => {
                throw new Error(err)
            })
        })
    }
}