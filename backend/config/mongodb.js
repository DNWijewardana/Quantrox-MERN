import mongoose from "mongoose";

// Connect MongoDB Database

const connectDB = async () => {
    try {
        mongoose.connection.on("connected", () => {console.log("Database Connected!")})
        
        let mongodbURI = process.env.MONGODB_URI;
        const projectName = "Quantrox";

        if(!mongodbURI){
            throw new Error("MONGODB_URI environment variable not set")
        }

        if(mongodbURI.endsWith('/')){
            mongodbURI = mongodbURI.slice(0, -1)
        }

        await mongoose.connect(`${mongodbURI}/${projectName}`)
    } catch (error) {
        console.error("Error connectiong to MongoDB: ", error)
    }
};

export default connectDB;