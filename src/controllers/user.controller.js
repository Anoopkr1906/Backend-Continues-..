import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req , res) => {
    res.status(200).json({
        msg: "A hello from Anoop Burnwal"
    })
})






export { registerUser }