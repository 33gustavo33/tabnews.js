import { tabNewsTypeError } from "../util/error.js"
import { Content } from "../util/types.js"
import { API } from "./index.js"
import { Watcher } from "./watcher.js"

/**
 * @typedef {Object} watcher_updateContent
 * @property {string} children_deep_count
 * @property {string} children_deep_count_before
 * @property {Date} updated_at
 * @property {Date} updated_at_before
 * @property {string} owner_username
 * @property {string} owner_username_before
 * @property {number} tabcoins
 * @property {number} tabcoins_before
 * @property {string} body
 * @property {string} body_before
 * @property {string} title
 * @property {string} title_before
 * @property {string} source_url
 * @property {string} source_url_before
 * @property {number} itemsChanged
 */
function createWatcher(api){
    /** @extends {Watcher} */
    class ContentWatcher extends Watcher {
        #contentConfig = {}
        #interval;
        #refreshAtMs;
        constructor(author, slug, observeWhat, refreshAtMs){
            super(["children_deep_count", "updated_at", "owner_username", "tabcoins", "body", "title", "source_url"], observeWhat, (data) => {
                let result = {...data}
                for(let [key, value] of Object.entries(result)){
                    if((key.endsWith("_at") || key.endsWith("_at_before")) && value) result[key] = new Date(value)
                }
                return result
            })
            this.#contentConfig.author = author
            this.#contentConfig.slug = slug
            this.#refreshAtMs = parseInt(refreshAtMs) ? parseInt(refreshAtMs) : 125000 // 120000 = 2 minutes and 5 seconds
        }
        /**
         * Começa a ouvir um evento
         * @param {"watcherUpdate"} event
         * @param {function(watcher_updateContent, eventManager):void} callback
         */
        on = (event, callback) => this.eventManager.on(event, callback) //is like this because other way JSDoc does not work

        async #fetchAndUpdateAndEmit(){
            let content = await api.contents.getContent(this.#contentConfig.author, this.#contentConfig.slug).catch((err) => this.emit("error", err))
            if(!content) return;
            this.updateAndEmit(content)
        }

        start(){
            this.fetch()
            setInterval(() => {
                this.fetch()
            }, this.#refreshAtMs)
        }
        fetch(){
            this.#fetchAndUpdateAndEmit()
        }
        stop(){
            clearInterval(this.#interval)
        }
    }

    return ContentWatcher
}

class ContentManager {
    /** @type {API} @private*/
    api
    watcher

    constructor(api){
        if(api instanceof API){
            this.api = api
            this.watcher = createWatcher(api)
        } else {
            throw new tabNewsTypeError("API needs to be a instance of API")
        }
    }

    /** @private */
    async _get(author, slug, customQuery){
        let url = this.api.endpoints.content
        if(author) url += `/${author}`
        if(slug) url += `/${slug}`
        if(customQuery) url += `?${customQuery}`

        const content = await this.api.request(url)
        const contentData = await content.json()

        if(content.status === 200){
            return contentData
        } else {
            throw contentData
        }
    }

    /** @private */
    async _patch(author, slug, options, token){
        let url = this.api.endpoints.content
        if(author) url += `/${author}`
        if(slug) url += `/${slug}`

        const content = await this.api.request(url, {
            method: "PATCH",
            token: token,
            body: options
        })
        const contentData = await content.json()

        if(content.status === 200){
            return contentData
        } else {
            throw contentData
        }
    }

    /** @private */
    async _post(author, slug, options, token){
        let url = this.api.endpoints.content
        if(author) url += `/${author}`
        if(slug) url += `/${slug}`

        const content = await this.api.request(url, {
            method: "POST",
            token: token,
            body: options
        })
        const contentData = await content.json()

        if(content.status === 201){
            return contentData
        } else {
            throw contentData
        }
    }

    upvote(author, slug, token){
        return this._post(author, slug, {transaction_type: "credit"}, token)
    }

    downvote(author, slug){
        return this._post(author, slug, {transaction_type: "debit"}, token)
    }

    async postContent(options, token){
        const {parentId, customSlug, title, body, sourceUrl} = options;
        const contentPosted = await this._post(null, null, {parent_id: parentId, title, body, status: "published", source_url: sourceUrl, slug: customSlug}, token)
        return new Content(contentPosted, this.api)
    }

    async editContent(author, slug, options, token){
        let {title, body, sourceUrl} = options;
        const contentEdited = await this._patch(author, slug, {title, body, status: "published", source_url: sourceUrl}, token)
        return new Content(contentEdited, this.api)
    }

    async deleteContent(author, slug, token){
        const contentDeleted = await this._patch(author, slug, {status: "deleted"}, token)
        return new Content(contentDeleted, this.api)
    }

    async getContent(author, slug){
        const contentFetched = await this._get(author, slug)
        return new Content(contentFetched, this.api)
    }

    async getContents(username, strategy="new", page=1){
        const contentsFetched = await this._get(username, null, `strategy=${strategy}&page=${page}`)
        const contents = []
        for(const contentFetched of contentsFetched){
            contents.push(new Content(contentFetched, this.api))
        }
        return contents
    }

    async getUserContents(username, strategy="new", page=1){
        const contentsFetched = await this._get(username, null, `strategy=${strategy}&page=${page}`)
        const contents = []
        for(const contentFetched of contentsFetched){
            contents.push(new Content(contentFetched, this.api))
        }
        return contents
    }
}

export default ContentManager