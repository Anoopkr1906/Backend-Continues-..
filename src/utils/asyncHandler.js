// a utility function to pass functions to it and it will return a function that handles errors


//! NOTE
// There are two ways in which we have written asyncHandler, one is on top and one is at bottom

const asyncHandler = (requestHandler) => {
    return (req , res , next) => {
        Promise.resolve(requestHandler(req , res , next)).catch((err) => next(err))
    } 
}

export {asyncHandler}




//Taking function as an argument (callback) and returning an async function

//asyncHandler is simply a wrapper function, which will used at many places to handle such asyn task

const asyncHandlers = (fn) => async(req, res, next) => {
    try{
        await fn(req , res , next);
    }catch(error){
        res.status(err.code || 500).json({
            success: false,
            message: err.message,
        })
    }
}