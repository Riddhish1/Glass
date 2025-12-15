import express from "express"
import health_check from "./API/health.js";
import generic_command from "./API/command.js";
import { delete_file,modify_file,create_file,list_files } from "./API/file_operations.js";
import { create_ctf_workflow, execute_ctf_challenge } from "./API/ctf.workflow.js";
import { analyze_ctf_binary, exploit_pwn_challenge } from "./API/ctf.pwn.js";
import { solve_crypto_challenge } from "./API/ctf.crypto.js";
import { analyze_forensics_file } from "./API/ctf.forensics.js";
import { analyze_reverse_binary } from "./API/ctf.reverse.js";
import { scan_ctf_web } from "./API/ctf.web.js"; 

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

// ===== CTF Endpoints =====

// CTF Workflow
app.post("/api/ctf/workflow/create", async(req,res)=>{
    await create_ctf_workflow(req,res);
})

app.post("/api/ctf/workflow/execute", async(req,res)=>{
    await execute_ctf_challenge(req,res);
})

// CTF PWN
app.post("/api/ctf/pwn/analyze", async(req,res)=>{
    await analyze_ctf_binary(req,res);
})

app.post("/api/ctf/pwn/exploit", async(req,res)=>{
    await exploit_pwn_challenge(req,res);
})

// CTF Crypto
app.post("/api/ctf/crypto/solve", async(req,res)=>{
    await solve_crypto_challenge(req,res);
})

// CTF Forensics
app.post("/api/ctf/forensics/analyze", async(req,res)=>{
    await analyze_forensics_file(req,res);
})

// CTF Reverse Engineering
app.post("/api/ctf/reverse/analyze", async(req,res)=>{
    await analyze_reverse_binary(req,res);
})

// CTF Web
app.post("/api/ctf/web/scan", async(req,res)=>{
    await scan_ctf_web(req,res);
})