import shell from "shelljs";

const cache = new Map();

const execute_command = async (command, { use_cache = true } = {}) => {
    if (use_cache && cache.has(command)) return { ...cache.get(command), cached: true };

    try {
        const result = shell.exec(command, { silent: true });
        const output = {
            stdout: result.stdout.trim(),
            stderr: result.stderr.trim(),
            code: result.code,
            success: result.code === 0,
            cached: false,
            timestamp: Date.now()
        }

        if (use_cache && output.success) cache.set(command, output);

        return output;
    }
    catch (err) {
        return {
            stdout: "",
            stderr: err.message || "Command execution failed",
            code: 1,
            success: false,
            cached: false,
            timestamp: Date.now(),
        }
    }
}

export default execute_command;
