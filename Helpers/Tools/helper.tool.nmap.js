import { execa } from "execa";

/**
 * @param {string} target
 * @param {object} params 
 * @returns {Promise<object>} 
 */
export const execute_nmap_scan = async(target,params = {}) => {
    try{
        if(!target || typeof target !== "string"){
            return { success: false, error: "Invalid target", code: 1 };
        }

        const scanType = params.scan_type || "-sV";
        const port = params.ports || "";
        const additionalArgs = params.additional_args || "";

        const args = [scanType];

        if(port) args.push("-p",`${port}`);

        if(additionalArgs) args.push(...additionalArgs.split(/\s+/).filter(Boolean));

        args.push(target);

        const proc = await execa("nmap",args,{reject:false,timeout:120_000});
        const code = typeof proc.exitCode === "number" ? proc.exitCode : (proc.code ?? 0);
        return{
            stdout: (proc.stdout || "").trim(),
            stderr: (proc.stderr || "").trim(),
            code,
            success: code === 0,
            cmd: `nmap ${args.join(" ")}`
        }
    }
    catch(err){
        return { success: false, error: err.message || String(err), code: 1 };
    }
}