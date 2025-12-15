import { execute_command } from '../helper.ctf.command.js';

export class CTFPwnManager {
    constructor() {
        this.tools = {
            checksec: 'checksec',
            file: 'file',
            strings: 'strings',
            radare2: 'r2',
            gdb: 'gdb',
            ropper: 'ropper',
            ropgadget: 'ROPgadget'
        };
    }

    async analyze(binary_path, options = {}) {
        const results = {
            binary: binary_path,
            file_info: null,
            checksec: null,
            strings: null,
            interesting_functions: [],
            recommendations: []
        };

        // File analysis
        const file_result = await execute_command(`file "${binary_path}"`);
        if (file_result.success) {
            results.file_info = this._parse_file_info(file_result.stdout);
        }

        // Security checks
        const checksec_result = await execute_command(`checksec --file="${binary_path}"`);
        if (checksec_result.success) {
            results.checksec = this._parse_checksec(checksec_result.stdout);
        }

        // Extract interesting strings
        if (options.extract_strings !== false) {
            const strings_result = await execute_command(`strings "${binary_path}" | head -100`);
            if (strings_result.success) {
                results.strings = strings_result.stdout.split('\n').filter(s => s.length > 3);
            }
        }

        // Generate recommendations
        results.recommendations = this._suggest_exploits(results);

        return results;
    }

    async create_exploit(binary_path, host = null, port = null, options = {}) {
        const analysis = await this.analyze(binary_path, { extract_strings: false });
        
        const exploit_template = this._generate_pwntools_template(
            binary_path,
            host,
            port,
            analysis
        );

        return {
            binary: binary_path,
            exploit_script: exploit_template,
            analysis: analysis.checksec,
            recommendations: analysis.recommendations
        };
    }

    _parse_file_info(output) {
        const info = {
            architecture: null,
            bits: null,
            endian: null,
            stripped: null
        };

        if (output.includes('ELF 64-bit')) {
            info.architecture = 'x86_64';
            info.bits = 64;
        } else if (output.includes('ELF 32-bit')) {
            info.architecture = 'x86';
            info.bits = 32;
        }

        info.endian = output.includes('LSB') ? 'little' : 'big';
        info.stripped = output.includes('stripped') ? true : false;

        return info;
    }

    _parse_checksec(output) {
        const protections = {
            relro: 'No',
            canary: false,
            nx: false,
            pie: false,
            rpath: false,
            runpath: false,
            symbols: 0
        };

        if (output.includes('Full RELRO')) protections.relro = 'Full';
        else if (output.includes('Partial RELRO')) protections.relro = 'Partial';
        
        protections.canary = output.includes('Canary found');
        protections.nx = output.includes('NX enabled');
        protections.pie = output.includes('PIE enabled');

        return protections;
    }

    _suggest_exploits(analysis) {
        const suggestions = [];

        if (!analysis.checksec) return suggestions;

        const { checksec } = analysis;

        if (!checksec.canary) {
            suggestions.push({
                type: 'Buffer Overflow',
                severity: 'HIGH',
                description: 'No stack canary detected. Buffer overflows may be exploitable.',
                tools: ['pwntools', 'gdb', 'pattern_create']
            });
        }

        if (!checksec.nx) {
            suggestions.push({
                type: 'Shellcode Injection',
                severity: 'CRITICAL',
                description: 'NX disabled. Stack is executable - shellcode injection possible.',
                tools: ['pwntools', 'msfvenom']
            });
        }

        if (!checksec.pie) {
            suggestions.push({
                type: 'ROP Chain',
                severity: 'MEDIUM',
                description: 'PIE disabled. Fixed addresses make ROP chains easier.',
                tools: ['ROPgadget', 'ropper', 'pwntools']
            });
        }

        if (checksec.relro === 'No' || checksec.relro === 'Partial') {
            suggestions.push({
                type: 'GOT Overwrite',
                severity: 'HIGH',
                description: 'Partial/No RELRO. GOT table may be writable.',
                tools: ['pwntools', 'gdb']
            });
        }

        return suggestions;
    }

    _generate_pwntools_template(binary_path, host, port, analysis) {
        const is_remote = host && port;
        
        return `#!/usr/bin/env python3
from pwn import *

# Binary and context
exe = ELF('${binary_path}')
context.binary = exe
context.log_level = 'debug'

# Connection
${is_remote ? 
`def conn():
    if args.REMOTE:
        return remote('${host}', ${port})
    else:
        return process([exe.path])
` :
`def conn():
    return process([exe.path])
`}

def main():
    r = conn()
    
    # ========== EXPLOIT HERE ==========
    
    # Example: Send payload
    # payload = b'A' * offset
    # payload += p64(target_address)
    # r.sendline(payload)
    
    # ==================================
    
    r.interactive()

if __name__ == '__main__':
    main()

# Binary Analysis:
# Architecture: ${analysis.file_info?.architecture || 'unknown'}
# Bits: ${analysis.file_info?.bits || 'unknown'}
# RELRO: ${analysis.checksec?.relro || 'unknown'}
# Canary: ${analysis.checksec?.canary ? 'Yes' : 'No'}
# NX: ${analysis.checksec?.nx ? 'Yes' : 'No'}
# PIE: ${analysis.checksec?.pie ? 'Yes' : 'No'}
`;
    }
}
