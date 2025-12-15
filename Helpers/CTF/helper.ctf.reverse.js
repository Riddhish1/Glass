import { execute_command } from '../helper.ctf.command.js';

export class CTFReverseManager {
    constructor() {
        this.tools = {
            file: 'file',
            strings: 'strings',
            objdump: 'objdump',
            readelf: 'readelf',
            nm: 'nm',
            ltrace: 'ltrace',
            strace: 'strace',
            radare2: 'r2'
        };
    }

    async analyze(binary_path, options = {}) {
        const results = {
            binary: binary_path,
            file_info: null,
            strings: null,
            functions: null,
            imports: null,
            exports: null,
            recommendations: []
        };

        // File analysis
        const file_result = await execute_command(`file "${binary_path}"`);
        if (file_result.success) {
            results.file_info = this._parse_file_info(file_result.stdout);
        }

        // Extract strings
        if (options.extract_strings !== false) {
            const strings_result = await execute_command(
                `strings "${binary_path}" | grep -E "flag|password|key|secret" -i || strings "${binary_path}" | head -100`
            );
            if (strings_result.success) {
                results.strings = this._extract_interesting_strings(strings_result.stdout);
            }
        }

        // Function analysis with radare2
        if (options.analyze_functions !== false) {
            results.functions = await this._analyze_functions(binary_path);
        }

        // Import/Export analysis
        const nm_result = await execute_command(`nm -D "${binary_path}" 2>&1 || nm "${binary_path}" 2>&1`);
        if (nm_result.success) {
            results.imports = this._parse_symbols(nm_result.stdout, 'U');
            results.exports = this._parse_symbols(nm_result.stdout, 'T');
        }

        // Generate recommendations
        results.recommendations = this._generate_recommendations(results);

        return results;
    }

    _parse_file_info(output) {
        const info = {
            type: null,
            architecture: null,
            bits: null,
            stripped: false,
            dynamically_linked: false
        };

        if (output.includes('ELF')) {
            info.type = 'ELF';
            info.bits = output.includes('64-bit') ? 64 : 32;
            info.architecture = output.includes('x86-64') ? 'x86_64' : 
                              output.includes('ARM') ? 'ARM' : 'x86';
        } else if (output.includes('PE32')) {
            info.type = 'PE';
            info.bits = output.includes('PE32+') ? 64 : 32;
            info.architecture = 'x86';
        }

        info.stripped = output.includes('stripped');
        info.dynamically_linked = output.includes('dynamically linked');

        return info;
    }

    _extract_interesting_strings(output) {
        const lines = output.split('\n');
        const interesting = {
            flags: [],
            paths: [],
            urls: [],
            crypto: [],
            other: []
        };

        for (const line of lines) {
            if (!line || line.length < 4) continue;

            if (/flag\{|ctf\{/i.test(line)) {
                interesting.flags.push(line);
            } else if (line.startsWith('/') || line.includes(':\\')) {
                interesting.paths.push(line);
            } else if (/https?:\/\//.test(line)) {
                interesting.urls.push(line);
            } else if (/key|password|secret|crypto/i.test(line)) {
                interesting.crypto.push(line);
            } else if (line.length > 10) {
                interesting.other.push(line);
            }
        }

        return interesting;
    }

    async _analyze_functions(binary_path) {
        const r2_result = await execute_command(
            `r2 -q -c "aaa; afl" "${binary_path}" 2>/dev/null`
        );

        if (r2_result.success) {
            return this._parse_r2_functions(r2_result.stdout);
        }

        return null;
    }

    _parse_r2_functions(output) {
        const functions = [];
        const lines = output.split('\n');

        for (const line of lines) {
            const match = line.match(/0x([0-9a-f]+)\s+\d+\s+\d+\s+(.+)/);
            if (match) {
                functions.push({
                    address: match[1],
                    name: match[2].trim()
                });
            }
        }

        return functions;
    }

    _parse_symbols(output, symbol_type) {
        const symbols = [];
        const lines = output.split('\n');

        for (const line of lines) {
            if (line.includes(` ${symbol_type} `)) {
                const parts = line.trim().split(/\s+/);
                if (parts.length >= 3) {
                    symbols.push(parts[parts.length - 1]);
                }
            }
        }

        return symbols;
    }

    _generate_recommendations(results) {
        const recommendations = [];

        if (results.strings?.flags && results.strings.flags.length > 0) {
            recommendations.push({
                priority: 'HIGH',
                action: 'Check extracted flags',
                details: results.strings.flags
            });
        }

        if (results.file_info?.stripped) {
            recommendations.push({
                priority: 'MEDIUM',
                action: 'Binary is stripped - use dynamic analysis',
                tools: ['ltrace', 'strace', 'gdb']
            });
        } else {
            recommendations.push({
                priority: 'LOW',
                action: 'Binary has symbols - static analysis recommended',
                tools: ['ghidra', 'radare2', 'ida']
            });
        }

        if (results.imports && results.imports.length > 0) {
            const dangerous = results.imports.filter(imp => 
                /system|exec|strcpy|gets|scanf/.test(imp)
            );
            
            if (dangerous.length > 0) {
                recommendations.push({
                    priority: 'HIGH',
                    action: 'Dangerous functions found',
                    functions: dangerous
                });
            }
        }

        return recommendations;
    }
}
