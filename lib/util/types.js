import { tabNewsError, tabNewsHttpError } from './error.js'

/** @type {import("../api/index.js").default} */
let api;

function setApiTypes(apiToBeSet){
    api = apiToBeSet
}

function isArray(array){
    if(typeof array == "object" && !(array == null)) return (array).forEach ? true : false
    return false
}

function getAverage(numbers){
    let result = 0;
    numbers.forEach((number) => {
        result += (parseFloat(number) || 0)
    })
    return result > 0 ? result / numbers.length : result
}

class Structure {
    constructor(data) {
        if(!data || typeof data !== 'object') throw new tabNewsError('Data needs to be an object')
    }
}

class UserData extends Structure {
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

class ClientUserData extends UserData {
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

class Content extends Structure {
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
    /** @type {number} */
    children_deep_count = 0;
    /** @type {Date} */
    created_at;
    /** @type {Date} */
    published_at;
    /** @type {Date} */
    updated_at;
    /** @type {Date} */
    deleted_at;
    /** @type {boolean} */
    is_children = false;
    /** @type {boolean} */
    is_root = true;
    /** @type {boolean} */
    has_children = false;
    /** @type {string} */
    thumbnail;
    /** @type {boolean} */
    #ownerFetched;
    /** @type {UserData} */
    #ownerData;

    /**
     * @returns {Promise<UserData>}
     */
    fetchOwner(){
        return new Promise((resolve, reject) => {
            if(this.#ownerFetched) return resolve(this.#ownerData)
            api.request(`${api.endpoints.users}/${this.owner.username}`).then(async (res) => {
                let data = await res.json()
                if(res.status == 200){
                    let userData = new UserData(data)
                    this.#ownerFetched = true
                    this.#ownerData= userData
                    resolve(userData)
                } else reject(data)
            }).catch(err => {
                throw new tabNewsHttpError(err, api.getUrlOfEndpoint(`${api.endpoints.users}/${this.owner.username}`))
            })
        })
    }

    /**
     * @returns {Promise<Content>}
     */
    fetchParent(){
        return new Promise((resolve, reject) => {
            if(this.is_root) return resolve(this)
            api.request(`${api.endpoints.content}/${this.owner.username}/${this.id}/parent/`).then(res => {
                let data = res.json()
                if(res.status == 200){
                    let parentData = new Content(data, api)
                    resolve(parentData)
                } else reject(data)
            }).catch(err => {
                throw new tabNewsHttpError(err, api.getUrlOfEndpoint(`${api.endpoints.content}/${this.owner.username}/${this.id}/parent/`))
            })
        })
    }

    /**
     * @returns {Promise<[Content]>}
     */
    fetchChildren(){
        return new Promise((resolve, reject) => {
            if(this.has_children){
                api.request(`${api.endpoints.content}/${this.owner.username}/${this.slug}/children`).then(async (res) => {
                    let data = await res.json()
                    if(res.status == 200 && isArray(data)){
                        let children = []
                        for(let child of data){
                            children.push(new Content(child))
                        }
                        resolve(children)
                    } else reject(data)
                }).catch(err => {
                    throw new tabNewsHttpError(err, api.getUrlOfEndpoint(`${api.endpoints.content}/${this.owner.username}/${this.slug}/children`))
                })
            } else resolve([])
        })
    }

    constructor(data){
        super(data)
        const { id, owner_id, parent_id, title, body, status, owner_username,source_url, slug, created_at, published_at, updated_at, deleted_at, tabcoins, children_deep_count } = data
        if(typeof id == "string") this.id = id;
        if(typeof owner_id == "string" && typeof owner_username == "string") this.owner = {id:owner_id, username:owner_username}
        if(typeof parent_id == "string") { 
            this.parent_id = parent_id 
            this.is_children = true
            this.is_root = false
        }
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
        if(typeof children_deep_count == "number") {
            this.children_deep_count = children_deep_count;
            if(children_deep_count > 0) this.has_children = true
        }
        if(this.slug && this.owner.username) this.thumbnail = api.getUrlOfEndpoint(`${api.endpoints.content}/${this.owner.username}/${this.slug}/thumbnail`)
    }
}

class DatabaseStatus extends Structure {
    /** @type {Array<number>} */
    latency = []
    /** @type {number} */
    maxConnections = 0
    /** @type {number} */
    openedConnections = 0
    /** @type {number} */
    averageLatency = 0
    /** @type {("healthy" | "unhealthy")}  */
    status = ""
    /** @type {string} */
    postgreVersion = ""

    constructor(data){
        super(data)
        let {latency, max_connections, opened_connections, status, version} = data
        if(typeof latency == "object"){
            for(let [key, ms] of Object.entries(latency)){
                this.latency.push(ms)
            }
            this.averageLatency = getAverage(this.latency)
        }
        if(typeof max_connections == "number") this.maxConnections = max_connections
        if(typeof opened_connections == "number") this.openedConnections = opened_connections 
        if(typeof status == "string") this.status = status
        if(typeof version == "string") this.postgreVersion = version
    }
}

class WebServerStatus extends Structure {
    /** @type {string} */
    awsRegion;
    /** @type {("local" | "preview" | "production")}  */
    environment;
    /** @type {string} */
    lastCommitAuthor;
    /** @type {string} */
    lastCommitMessage;
    /** @type {string} */
    lastCommitMessageSha;
    /** @type {("vercel" | "local")}  */
    provider;
    /** @type {("healthy" | "unhealthy")}  */
    status;
    /** @type {string} */
    timezone;
    /** @type {string} */
    vercelRegion;
    /** @type {string} */
    nodejsVersion;

    constructor(data){
        super(data)
        let {status, version, provider, environment, aws_region, vercel_region, timezone, last_commit_author, last_commit_message, last_commit_message_sha} = data
        if(typeof status == "string") this.status = status
        if(typeof version == "string") this.nodejsVersion = version
        if(typeof provider == "string") this.provider = provider
        if(typeof environment == "string") this.environment = environment
        if(typeof aws_region == "string") this.awsRegion = aws_region
        if(typeof vercel_region == "string") this.vercelRegion = vercel_region
        if(typeof timezone == "string") this.timezone = timezone
        if(typeof last_commit_author == "string") this.lastCommitAuthor = last_commit_author
        if(typeof last_commit_message == "string") this.lastCommitMessage = last_commit_message
        if(typeof last_commit_message_sha == "string") this.lastCommitMessageSha = last_commit_message_sha
    }
}

class Analytics extends Structure {
    /**
     * @typedef {object} AnalyticsDay
     * @property {string} date
     * @property {number} created
     */

    /** @type {Array<AnalyticsDay>} */
    usersCreated = []
    /** @type {Array<AnalyticsDay>} */
    rootContentCreated = []
    /** @type {Array<AnalyticsDay>} */
    childContentCreated = []

    constructor(data){
        super(data)
        let {users, root, child} = data;
        if(isArray(users)){
            users.forEach(({date, cadastros}) => {
                if(typeof date == "string" && typeof cadastros == "number") this.usersCreated.push({date, created: cadastros})
            })
        }
        if(isArray(root)){
            root.forEach(({date, conteudos}) => {
                if(typeof date == "string" && typeof conteudos == "number") this.rootContentCreated.push({date, created: conteudos})
            })
        }
        if(isArray(child)){
            child.forEach(({date, respostas}) => {
                if(typeof date == "string" && typeof respostas == "number") this.childContentCreated.push({date, created: respostas})
            })
        }
    }
}

class Status extends Structure {
    /** @type {DatabaseStatus} */
    database;
    /** @type {WebServerStatus}} */
    webserver;
    /** @type {Analytics} */
    analytics;

    constructor(data){
        super(data)
        let {status, users, root, child} = data
        if(typeof status == "object") {
            if(typeof status.dependencies == "object"){
                if(status.dependencies.database) this.database = new DatabaseStatus(status.dependencies.database)
                if(status.dependencies.webserver) this.webserver = new WebServerStatus(status.dependencies.webserver)
            }
        }
        if(users || root || child) this.analytics = new Analytics({users, root, child})
    }
}

export {
    UserData,
    ClientUserData,
    Content,
    DatabaseStatus,
    WebServerStatus,
    Analytics,
    Status,
    setApiTypes
}