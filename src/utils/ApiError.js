class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ){
        //To overwrite
        super(message)

        // check if it would be statusCode or status only 
        this.statusCode = statusCode
        // Todo : learn more about this.data field in Node.JS , API Error docs
        this.data = null
        this.message = message
        this.success = false;
        this.errors = errors 

        if(stack) {
            this.stack = stack 
        }else{
            Error.captureStackTrace(this , this.constructor);
        }

    }
}


export {ApiError}