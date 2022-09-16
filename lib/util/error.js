class tabNewsError extends Error {
    constructor(message){
        super(message)
        this.name = "Tabnews.js Error"
    }
}

class tabNewsTypeError extends TypeError {
    constructor(message){
        super(message)
        this.name = "Tabnews.js TypeError"
    }
}

class tabNewsHttpError extends Error {
    constructor(message, url){
        super(message)
        this.name = "Tabnews.js HTTP Error"
        this.url = url
    }
}


export {
    tabNewsHttpError,
    tabNewsTypeError,
    tabNewsError
}