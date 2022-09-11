import {tabNewsHttpError, tabNewsError} from "../util/error.js"
import { UserData, Content } from "../util/types.js"

let api;

function setApiUsers(toBeSetApi){
    api = toBeSetApi
}

function getUser(username){
    return new Promise((resolve, reject) => {
        api.request(`${api.endpoints.users}/${username}`).then(async (res) => {
            let data = await res.json()
            if(res.status == 200){
                let user = new UserData(data)
                resolve(user)
            } else reject(data)
        }).catch((err) => {
            throw new tabNewsHttpError(err, api.getUrlOfEndpoint(`${api.endpoints.users}/${username}`))
        })
    })
}

function getUserContents(username, strategy="new", page=1){
    return new Promise((resolve, reject) => {
        api.request(`${api.endpoints.content}/${username}?strategy=${strategy}&page=${page}`).then(async (res) => {
            let data = await res.json()
            if(res.status == 200){
                let contents = []
                for(let content of data){
                    contents.push(new Content(content))
                }
                resolve(contents)
            } else reject(data)
        }).catch((err) => {
            throw new tabNewsHttpError(err, api.getUrlOfEndpoint(`${api.endpoints.users}/${username}?strategy=${strategy}&page=${page}`))
        })
    })
}

export {
    setApiUsers,
    getUser,
    getUserContents
}