import { tabNewsError, tabNewsHttpError } from '../error/index.js'
import API from "../api/index.js"

function isArray(a){
    if(typeof a == "object") return (a).forEach ? true : false
    return false
}

class Data {
    constructor(data, api={}) {
        if(!data || typeof data !== 'object') throw new tabNewsError('Data needs to be an object')
        if(!api || typeof api !== "object") throw new tabNewsError('API needs to be an object')
    }
}

class UserData extends Data {
    /** @type {string} */
    id;
    /** @type {string} */
    username;
    /** @type {Array<string>} */
    features = [];
    /** @type {number} */
    tabcoins;
    /** @type {number} */
    tabcash;
    /** @type {Date} */
    created_at;
    /** @type {Date} */
    updated_at;

    constructor(data) {
        super(data)
        const {username, features, tabcoins, tabcash, created_at, updated_at, id} = data
        if(typeof id == "string") this.id = id;
        if(typeof username == "string") this.username = username
        if(isArray(features)) this.features = features
        if(typeof tabcoins == "number") this.tabcoins = tabcoins
        if(typeof tabcash == "number") this.tabcash = tabcash
        if(typeof created_at == "string") this.created_at = new Date(created_at)
        if(typeof updated_at == "string") this.updated_at = new Date(updated_at)
    }
}

class ClientUserData extends userData {
    /** @type {string} */
    email;
    /** @type {string} */
    token;

    constructor(data, token) {
        super({...data})
        if(typeof data.email == "string") this.email = data.email
        if(typeof token == "string") this.token = token
    }
}

class Content extends Data {
    /** @type {string} */
    id;
    /** @type {string} */
    parent_id;
    /** @type {string} */
    slug;
    /** @type {string} */
    title;
    /** @type {string} */
    body;
    /** @type {string} */
    status;
    /** @type {string} */
    source_url;

    /**
     * @typedef owner;
     * @property {string} id 
     * @property {string} username
     */
    /** @type {owner} */
    owner;
    /** @type {number} */
    tabcoins;
    /** @type {Date} */
    created_at;
    /** @type {Date} */
    published_at;
    /** @type {Date} */
    updated_at;
    /** @type {Date} */
    deleted_at;
    /** @type {API} */
    #api;
    /** @type {boolean} */
    #fetched;
    /** @type {UserData} */
    #ownerData;

    /**
     * @returns {Promise<UserData>}
     */
    fetchOwner(){
        return new Promise((resolve, reject) => {
            if(this.#fetched) return resolve(this.#ownerData)
            this.#api.request(`${this.#api.endpoints.user}/${this.owner.username}`).then(async (res) => {
                let data = await res.json()
                if(res.status == 200){
                    let userData = new UserData(data)
                    this.#fetched = true
                    this.#ownerData= userData
                    resolve(userData)
                } else reject(data)
            }).catch(err => {
                throw new tabNewsHttpError(err, `${this.#api.endpoints.user}/${this.owner.username}`)
            })
        })
    }

    /**
     * @returns {Promise<Content>}
     */
    fetchParent(){
        return new Promise((resolve, reject) => {
            if(!this.parent_id) return resolve(this)
            this.#api.request(`${this.#api.endpoints.content}/${this.owner.username}/${this.id}/parent/`).then(res => {
                let data = res.json()
                if(res.status == 200){
                    let parentData = new Content(data, this.#api)
                    resolve(parentData)
                } else reject(data)
            }).catch(err => {
                throw new tabNewsHttpError(err, `${this.#api.endpoints.content}/${this.owner.username}/${this.id}/parent/`)
            })
        })
    }

    //TO-DO add children method.

    constructor(data, api){
        super(data, api)
        const { id, owner_id, parent_id, title, body, status, owner_username,source_url, slug, created_at, published_at, updated_at, deleted_at, tabcoins, children_deep_count } = data
        if(typeof id == "string") this.id = id;
        if(typeof owner_id == "string" && typeof owner_username == "string") this.owner = {id:owner_id, username:owner_username}
        if(typeof parent_id == "string") this.parent_id = parent_id;
        if(typeof title == "string") this.title = title;
        if(typeof body == "string") this.body = body;
        if(typeof status == "string") this.status = status;
        if(typeof source_url == "string") this.source_url = source_url;
        if(typeof slug == "string") this.slug = slug;
        if(typeof created_at == "string") this.created_at = new Date(created_at);
        if(typeof published_at == "string") this.published_at = new Date(published_at);
        if(typeof updated_at == "string") this.updated_at = new Date(updated_at);
        if(typeof deleted_at == "string") this.deleted_at = new Date(deleted_at);
        if(typeof tabcoins == "number") this.tabcoins = tabcoins;
        if(typeof children_deep_count == "number") this.children_deep_count = children_deep_count;
        this.#api = api;
    }
}

class Status extends Data {
    database = {
        latency: [1,2,3],
        max_connections: 78,
        opened_connections: 5,
        status: "healthy",
        version: "14.1",
    }
    webserver = {
        aws_region: "sa-east-1",
        environment: "production",
        last_commit_author: "filipedeschamps",
        last_commit_message: "Merge pull request #718 from filipedeschamps/user-profile\n\nAdiciona página `/perfil` e habilita fluxo de atualização de email",
        last_commit_message_sha: "8a8b349c7d92ae34dbaabccf153444a3c6439b96",
        provider: "vercel",
        status: "healthy",
        timezone: ":UTC",
        vercel_region: "gru1",
        version: "v16.16.0"
    }
    created_status = {
        users_created: [{date: "09/07", cadastros: 10}],
        root_content_created: [{date: "09/07", conteudos: 10}],
        child_content_created: [{date: "09/07", respostas: 10}]
    }
}

export {
    UserData,
    ClientUserData,
    Content,
    Status
}