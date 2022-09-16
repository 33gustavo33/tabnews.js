import {tabNewsHttpError, tabNewsError} from "../util/error.js"
import { ClientUserData } from "../util/types.js"

let api;

function setApiUser(toBeSetApi){
    api = toBeSetApi
}

function getUserToken(loginData){
    return new Promise((resolve, reject) => {
        api.request(api.endpoints.login, {method: "POST", body: loginData}).then(async (res) => {
            let data = await res.json()
            if(res.status === 201){
                resolve(data.token)
            } else reject(data)
        }).catch((err) => {
            throw new tabNewsHttpError(err, api.getUrlOfEndpoint(api.endpoints.login))
        })
    })
}

/** @returns {Promise<ClientUserData>} */
function getUserData(token){
    return new Promise(async (resolve, reject) => {
        api.request(api.endpoints.user, {token}).then(async (res) => { 
            let data = await res.json()
            if(res.status === 200){
                let userData = new ClientUserData(data, token)
                resolve(userData)
            } else reject(data)
        }).catch((err) => {
            throw new tabNewsHttpError(err, api.getUrlOfEndpoint(api.endpoints.user))
        })
    })
}

function editUser(options={}, username, email, token){
    return new Promise((resolve, reject) => {
        api.request(`${api.endpoints.users}/${username}`, {token: token, method: "PATCH", body: options}).then(async (res) => {
            let data = await res.json()
            if(res.status == 200){
                let user = new ClientUserData({...data, email}, token)
                resolve(user)
            } else reject(data)
        }).catch((err) => {
            throw new tabNewsHttpError(err, api.getUrlOfEndpoint(`${api.endpoints.users}/${username}`))
        })
    })
}

export {
    setApiUser,
    getUserToken,
    getUserData,
    editUser
}