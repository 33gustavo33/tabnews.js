const validConfigExample = {
    tabnewsUrl: "string",
    tabnewsApiUrl: "string"
}

function validateConfig(config, currentConfig){
    if(!(typeof config == "object")) throw new Error("Invalid config")
    let result = {...currentConfig}
    let valid = false;
    for(const [key, type] of Object.entries(validConfigExample)){
        valid = true
        if(typeof config[key] == type) result[key] = config[key]
    }
    return {valid, result};
}

export default {
    validateConfig
}