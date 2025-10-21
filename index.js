import express from "express"
import health_check from "./API/health.js";
import generic_command from "./API/command.js";
import { delete_file,modify_file,create_file,list_files } from "./API/file_operations.js"; 

const API_PORT = process.env.PORT || 8888;
const API_HOST = process.env.HOST || "127.0.0.1";

const app = express();

// parse JSON bodies middleware
app.use(express.json());


app.listen(API_PORT,API_HOST,()=>{
    console.log(`Server Started at http://${API_HOST}:${API_PORT}`);
})

app.get("/health",
    async (req, res) => {
        await health_check(req, res);
    }
)

app.post("/api/command",
    async(req,res)=>{
        await generic_command(req,res);
    }
)

app.post("/api/files/create", async(req,res)=>{
    await create_file(req,res);
})

app.post("/api/files/modify",async(req,res)=>{
    await modify_file(req,res);
})

app.delete("/api/files/delete",
    async(req,res)=>{
        await delete_file(req,res);
    }
)

app.get("/api/files/list",async(req,res)=>{
    await list_files(req,res);
})