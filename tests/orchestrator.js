import { Client } from "../index.js"

const config = {
    tabnewsUrl: "",
    log: true,
    debug: false
}

const retryTime = 1000

const cache = {
    contents: []
}

const user = new Client(config) //Normal client
const admin = new Client(config) //Admin client

function waitForClientsToConnect(){
    return new Promise((resolve) => {
        if(validateUrl(config.tabnewsUrl)){
            user.login({email: "user@user.com", password: "password"})
            admin.login({email: "admin@admin.com", password: "password"})
            checkAndRetryClients(resolve)
        }
    })

    async function checkAndRetryClients(callback){
        if(user.connected && admin.connected){
            callback()
        } else {
            setTimeout(() => {
                checkAndRetryClients(callback)
            }, retryTime)
        }
    }
}

async function postContent(content){
    const content1 = await admin.contents.post(content).catch(() => {})
    const content2 = await user.contents.post(content).catch(() => {})

    cache.contents.push(content1, content2)
    return [content1, content2]
}

function deleteContent(content){
    return admin.contents.delete(content.owner.username, content.slug).catch(() => {})
}

async function clearContents(){
    if(!admin.connected || !user.connected) return;

    for(const content of cache.contents){
        if(!content || !content.id) return
        await deleteContent(content)
    }

    cache.contents = []
}

function getCache(){
    return cache;
}

function validateUrl(url){
    const blockedUrls = ["tabnews.com", "vercel.app"]
    let validUrl = true;

    for(const blockedUrl of blockedUrls){
        if(url.includes(blockedUrl)) validUrl = false
    }

    if(url.length < 1) validUrl = false;

    return validUrl
}

export {
    waitForClientsToConnect,
    admin,
    user,
    config,

    validateUrl,
    postContent,
    clearContents,
    deleteContent,
    getCache
}