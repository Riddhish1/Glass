import express from "express"
import health_check from "./API/health.js";
import generic_command from "./API/command.js";

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