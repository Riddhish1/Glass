import { execute_command } from './helper.ctf.command.js';

export class CTFWorkflowManager {
    constructor() {
        this.tools = {
            web: [
                'nikto', 'dirb', 'gobuster', 'wfuzz', 'ffuf', 'sqlmap', 'xsstrike',
                'whatweb', 'wafw00f', 'nuclei', 'burpsuite', 'zaproxy', 'subfinder',
                'httpx', 'arjun', 'dalfox', 'dirsearch', 'feroxbuster'
            ],
            crypto: [
                'john', 'hashcat', 'rsactftool', 'featherduster', 'ciphey', 'cryptool',
                'xortool', 'hash-identifier', 'yafu', 'msieve', 'sage', 'openssl',
                'gmpy2', 'pycrypto', 'cryptography'
            ],
            pwn: [
                'pwntools', 'gdb', 'peda', 'gef', 'pwndbg', 'radare2', 'ghidra', 'ida',
                'checksec', 'ropper', 'rop-tool', 'one_gadget', 'libc-database',
                'seccomp-tools', 'ROPgadget', 'angr', 'z3'
            ],
            forensics: [
                'binwalk', 'foremost', 'scalpel', 'volatility', 'autopsy', 'sleuthkit',
                'exiftool', 'strings', 'file', 'xxd', 'hexdump', 'steghide', 'stegsolve',
                'zsteg', 'outguess', 'stegcracker', 'wireshark', 'tshark'
            ],
            reverse: [
                'ghidra', 'ida', 'radare2', 'cutter', 'hopper', 'binary ninja', 'gdb',
                'objdump', 'readelf', 'nm', 'ltrace', 'strace', 'angr', 'frida',
                'upx', 'uncompyle6', 'pyinstxtractor', 'dnspy', 'jadx'
            ],
            misc: [
                'python', 'bash', 'perl', 'ruby', 'nodejs', 'nc', 'ncat', 'socat',
                'curl', 'wget', 'git', 'grep', 'awk', 'sed', 'jq'
            ],
            osint: [
                'theHarvester', 'recon-ng', 'maltego', 'spiderfoot', 'sherlock',
                'maigret', 'phoneinfoga', 'holehe', 'socialscan', 'h8mail',
                'waybackurls', 'gau', 'subfinder', 'assetfinder', 'amass'
            ]
        };
    }

    create_workflow(category, difficulty = 'medium', description = '') {
        const steps = this._generate_workflow_steps(category, difficulty);
        const estimated_time = this._estimate_time(category, difficulty);
        const success_probability = this._calculate_success_probability(category, difficulty);

        return {
            category,
            difficulty,
            description,
            steps,
            estimated_time,
            success_probability,
            tools: this.tools[category] || [],
            created_at: new Date().toISOString()
        };
    }

    async execute_challenge(category, target, options = {}) {
        const workflow = this.create_workflow(category, options.difficulty || 'medium');
        const results = [];

        for (const step of workflow.steps) {
            try {
                const result = await this._execute_step(step, target, options);
                results.push(result);

                if (result.critical_finding) {
                    break;
                }
            } catch (error) {
                results.push({
                    step: step.name,
                    success: false,
                    error: error.message
                });
            }
        }

        return {
            workflow,
            results,
            completed_at: new Date().toISOString()
        };
    }

    _generate_workflow_steps(category, difficulty) {
        const workflows = {
            web: [
                { name: 'Reconnaissance', tools: ['whatweb', 'nmap'], priority: 1 },
                { name: 'Directory Enumeration', tools: ['gobuster', 'ffuf'], priority: 2 },
                { name: 'Vulnerability Scanning', tools: ['nikto', 'nuclei'], priority: 3 },
                { name: 'SQLi Testing', tools: ['sqlmap'], priority: 4 },
                { name: 'XSS Testing', tools: ['dalfox', 'xsstrike'], priority: 5 }
            ],
            crypto: [
                { name: 'Cipher Identification', tools: ['ciphey', 'hash-identifier'], priority: 1 },
                { name: 'Decryption Attempts', tools: ['john', 'hashcat'], priority: 2 },
                { name: 'RSA Analysis', tools: ['rsactftool', 'yafu'], priority: 3 },
                { name: 'Encoding Detection', tools: ['base64', 'xxd'], priority: 4 }
            ],
            pwn: [
                { name: 'Binary Analysis', tools: ['checksec', 'file'], priority: 1 },
                { name: 'Disassembly', tools: ['radare2', 'ghidra'], priority: 2 },
                { name: 'ROP Gadget Finding', tools: ['ROPgadget', 'ropper'], priority: 3 },
                { name: 'Exploit Development', tools: ['pwntools', 'gdb'], priority: 4 }
            ],
            forensics: [
                { name: 'File Analysis', tools: ['file', 'exiftool'], priority: 1 },
                { name: 'Data Carving', tools: ['binwalk', 'foremost'], priority: 2 },
                { name: 'Steganography Check', tools: ['steghide', 'zsteg'], priority: 3 },
                { name: 'String Extraction', tools: ['strings', 'grep'], priority: 4 }
            ],
            reverse: [
                { name: 'Binary Information', tools: ['file', 'readelf'], priority: 1 },
                { name: 'Static Analysis', tools: ['ghidra', 'radare2'], priority: 2 },
                { name: 'Dynamic Analysis', tools: ['gdb', 'ltrace', 'strace'], priority: 3 },
                { name: 'Decompilation', tools: ['ghidra', 'ida'], priority: 4 }
            ],
            osint: [
                { name: 'Email Enumeration', tools: ['theHarvester', 'h8mail'], priority: 1 },
                { name: 'Username Search', tools: ['sherlock', 'maigret'], priority: 2 },
                { name: 'Subdomain Discovery', tools: ['subfinder', 'amass'], priority: 3 },
                { name: 'Historical Data', tools: ['waybackurls'], priority: 4 }
            ],
            misc: [
                { name: 'Reconnaissance', tools: ['file', 'strings'], priority: 1 },
                { name: 'Custom Analysis', tools: ['python', 'bash'], priority: 2 },
                { name: 'Network Testing', tools: ['nc', 'curl'], priority: 3 }
            ]
        };

        return workflows[category] || workflows.misc;
    }

    _estimate_time(category, difficulty) {
        const base_times = {
            easy: 15,
            medium: 30,
            hard: 60,
            insane: 120
        };

        const category_multipliers = {
            web: 1.0,
            crypto: 1.5,
            pwn: 2.0,
            forensics: 1.2,
            reverse: 2.5,
            misc: 1.0,
            osint: 1.3
        };

        const base = base_times[difficulty] || 30;
        const multiplier = category_multipliers[category] || 1.0;

        return `${Math.round(base * multiplier)} minutes`;
    }

    _calculate_success_probability(category, difficulty) {
        const difficulty_factors = {
            easy: 0.9,
            medium: 0.7,
            hard: 0.5,
            insane: 0.3
        };

        const base_probability = difficulty_factors[difficulty] || 0.7;
        return `${Math.round(base_probability * 100)}%`;
    }

    async _execute_step(step, target, options) {
        const tool = step.tools[0];
        const command = this._build_command(tool, target, options);

        const result = await execute_command(command, true, 60000);

        return {
            step: step.name,
            tool,
            success: result.success,
            output: result.stdout,
            error: result.stderr,
            critical_finding: this._check_critical_finding(result.stdout)
        };
    }

    _build_command(tool, target, options) {
        const commands = {
            'nmap': `nmap -sV -sC ${target}`,
            'gobuster': `gobuster dir -u ${target} -w /usr/share/wordlists/dirb/common.txt`,
            'nikto': `nikto -h ${target}`,
            'sqlmap': `sqlmap -u ${target} --batch --level=1`,
            'checksec': `checksec --file=${target}`,
            'file': `file ${target}`,
            'strings': `strings ${target}`,
            'binwalk': `binwalk ${target}`,
            'exiftool': `exiftool ${target}`
        };

        return commands[tool] || `${tool} ${target}`;
    }

    _check_critical_finding(output) {
        const critical_keywords = [
            'VULNERABLE', 'SQL injection', 'Remote Code Execution',
            'buffer overflow', 'flag{', 'CTF{', 'password:', 'secret'
        ];

        return critical_keywords.some(keyword =>
            output.toLowerCase().includes(keyword.toLowerCase())
        );
    }
}
