import {mongoose , Schema} from "mongoose";

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({

    videoFile:{
        type: String , // cloudinary url
        required: true,
    },
    thumbnail:{
        type: String, // cloudinary url
        required: true,
    },
    title:{
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true,
    },
    duration:{
        type: Number, 
        required: true,
    },
    views:{
        type: Number,
        default: 0,
    },
    isPublished:{
        type: Boolean,
        default: true,
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User"
    }
        

}, {timestamps: true});

videoSchema.plugin(mongooseAggregatePaginate);
// This will allow us to use aggregate paginate on this model
// mongooseAggregatePaginate is a plugin that allows us to paginate the results of an aggregation query


export const Video = mongoose.model("Video", videoSchema);