import {tabNewsHttpError, tabNewsError} from "../util/error.js"
import { Content } from "../util/types.js"
let api;

function setApiContents(toBeSetApi){
    api = toBeSetApi
}

function getContent(author, slug){
    return new Promise((resolve, reject) => {
        api.request(`${api.endpoints.content}/${author}/${slug}`).then(async (res) => {
            let data = await res.json()
            if(res.status == 200){
                let content = new Content(data)
                resolve(content)
            } else reject(data)
        }).catch((err) => {
            throw new tabNewsHttpError(err, api.getUrlOfEndpoint(`${api.endpoints.content}/${author}/${slug}`))
        })
    })
}

function postContent(options, token){
    return new Promise((resolve, reject) => {
        let {parentId, customSlug, title, body, sourceUrl} = options;
        api.request(api.endpoints.content, {token, method: "POST", body: {parent_id: parentId, title, body, status: "published", source_url: sourceUrl, slug: customSlug}}).then(async (res) => {
            let data = await res.json()
            if(res.status == 201){
                let content = new Content(data)
                resolve(content)
            } else reject(data)
        }).catch((err) => {
            throw new tabNewsHttpError(err, api.getUrlOfEndpoint(api.endpoints.content))
        })
    })
}

function editContent(author, slug, options, token){
    return new Promise((resolve, reject) => {
        let {title, body, sourceUrl} = options;
        api.request(`${api.endpoints.content}/${author}/${slug}`, {token, method: "PATCH", body: {title, body, status: "published", source_url: sourceUrl}}).then(async (res) => {
            let data = await res.json()
            if(res.status == 201){
                let content = new Content(data)
                resolve(content)
            } else reject(data)
        }).catch((err) => {
            throw new tabNewsHttpError(err, api.getUrlOfEndpoint(`${api.endpoints.content}/${author}/${slug}`))
        })
    })
}

function deleteContent(author, slug, token){
    return new Promise((resolve, reject) => {
        api.request(`${api.endpoints.content}/${author}/${slug}`, {token, method: "PATCH", body: {status: "deleted"}}).then(async (res) => {
            let data = await res.json()
            if(res.status == 200){
                let content = new Content(data)
                resolve(content)
            } else reject(data)
        }).catch((err) => {
            throw new tabNewsHttpError(err, api.getUrlOfEndpoint(`${api.endpoints.content}/${author}/${slug}`))
        })
    })
}

function upvote(author, slug, token){
    return new Promise((resolve, reject) => {
        api.request(`${api.endpoints.content}/${author}/${slug}/tabcoins`, {token, method: "POST", body: {transaction_type: "credit"}}).then(async (res) => {
            let data = await res.json()
            if(res.status == 201){
                resolve(data)
            } else reject(data)
        }).catch((err) => {
            throw new tabNewsHttpError(err, api.getUrlOfEndpoint(`${api.endpoints.content}/${author}/${slug}/tabcoins`))
        })
    })
}

function downvote(author, slug, token){
    return new Promise((resolve, reject) => {
        api.request(`${api.endpoints.content}/${author}/${slug}/tabcoins`, {token, method: "POST", body: {transaction_type: "debit"}}).then(async (res) => {
            let data = await res.json()
            if(res.status == 201){
                resolve(data)
            } else reject(data)
        }).catch((err) => {
            throw new tabNewsHttpError(err, api.getUrlOfEndpoint(`${api.endpoints.content}/${author}/${slug}/tabcoins`))
        })
    })
}

function getContents(strategy="new", page=1){
    return new Promise((resolve, reject) => {
        api.request(`${api.endpoints.content}?strategy=${strategy}&page=${page}`).then(async (res) => {
            let data = await res.json()
            if(res.status == 200){
                let contents = []
                for(let content of data){
                    contents.push(new Content(content))
                }
                resolve(contents)
            } else reject(data)
        })//.catch((err) => {
            //throw new tabNewsHttpError(err, api.getUrlOfEndpoint(`${api.endpoints.content}?strategy=${strategy}&page=${page}`))
        //})
    })
}

export {
    setApiContents,
    getContent,
    getContents,
    postContent,
    editContent,
    deleteContent,
    upvote,
    downvote
}