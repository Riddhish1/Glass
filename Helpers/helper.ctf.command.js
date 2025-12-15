import shell from 'shelljs';

// Command execution cache with TTL
const command_cache = new Map();
const CACHE_TTL = 300000; // 5 minutes in milliseconds

export async function execute_command(command, use_cache = true, timeout = 30000) {
    if (use_cache && command_cache.has(command)) {
        const cached = command_cache.get(command);
        if (Date.now() - cached.timestamp < CACHE_TTL) {
            return cached.result;
        }
        command_cache.delete(command);
    }

    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error(`Command timeout after ${timeout}ms`));
        }, timeout);

        shell.exec(command, { async: true, silent: true }, (code, stdout, stderr) => {
            clearTimeout(timeoutId);

            const result = {
                success: code === 0,
                exit_code: code,
                stdout: stdout.trim(),
                stderr: stderr.trim(),
                command
            };

            if (use_cache && code === 0) {
                command_cache.set(command, {
                    result,
                    timestamp: Date.now()
                });
            }

            resolve(result);
        });
    });
}

export function clear_cache() {
    command_cache.clear();
}

export function get_cache_stats() {
    return {
        size: command_cache.size,
        ttl: CACHE_TTL
    };
}
