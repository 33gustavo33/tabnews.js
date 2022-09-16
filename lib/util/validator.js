import { tabNewsTypeError } from "./error.js"

function removeLastCharIfLastCharIs(string, char){
    let lastChar = string[string.length-1]
    if(char == lastChar) return string.substring(0, string.length-1)
    return string
}

function validateConfig(config, currentConfig){
    if(!(typeof config == "object")) throw new tabNewsTypeError("Invalid config for client")
    let result = {...currentConfig}
    if(typeof config.tabnewsUrl == "string") result.tabnewsUrl = removeLastCharIfLastCharIs(config.tabnewsUrl, "/")
    if(typeof config.log == "boolean") result.log = config.log
    if(typeof config.customAgentUser == "string") result.customAgentUser = config.customAgentUser
    if(typeof config.debug) result.debug = config.debug
    return result;
}

export default {
    validateConfig
}