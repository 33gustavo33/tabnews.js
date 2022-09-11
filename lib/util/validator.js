import { tabNewsError } from "./error.js"

function removeLastCharIfLastCharIs(string, char){
    let lastChar = string[string.length-1]
    if(char == lastChar) return string.substring(0, string.length-1)
    return string
}

function validateConfig(config, currentConfig){
    if(!(typeof config == "object")) throw new tabNewsError("Invalid config")
    let result = {...currentConfig}
    if(typeof config.tabnewsUrl == "string") result.tabnewsUrl = removeLastCharIfLastCharIs(config.tabnewsUrl, "/")
    if(typeof config.log == "boolean") result.log = config.log
    return result;
}

export default {
    validateConfig
}