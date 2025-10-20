import execute_command from "../Helpers/command.js"

const health_check = async (req, res) => {
    //just an normal health check with tool detection

    const essential_tools = [
        "nmap", "gobuster", "dirb", "nikto", "sqlmap", "hydra", "john", "hashcat"
    ]

    const network_tools = [
        "rustscan", "masscan", "autorecon", "nbtscan", "arp-scan", "responder",
        "nxc", "enum4linux-ng", "rpcclient", "enum4linux"
    ]

    const web_security_tools = [
        "ffuf", "feroxbuster", "dirsearch", "dotdotpwn", "xsser", "wfuzz",
        "gau", "waybackurls", "arjun", "paramspider", "x8", "jaeles", "dalfox",
        "httpx", "wafw00f", "burpsuite", "zaproxy", "katana", "hakrawler"
    ]

    const vuln_scanning_tools = [
        "nuclei", "wpscan", "graphql-scanner", "jwt-analyzer"
    ]

    const password_tools = [
        "medusa", "patator", "hash-identifier", "ophcrack", "hashcat-utils"
    ]

    const binary_tools = [
        "gdb", "radare2", "binwalk", "ropgadget", "checksec", "objdump",
        "ghidra", "pwntools", "one-gadget", "ropper", "angr", "libc-database",
        "pwninit"
    ]

    const forensics_tools = [
        "volatility3", "vol", "steghide", "hashpump", "foremost", "exiftool",
        "strings", "xxd", "file", "photorec", "testdisk", "scalpel", "bulk-extractor",
        "stegsolve", "zsteg", "outguess"
    ]

    const cloud_tools = [
        "prowler", "scout-suite", "trivy", "kube-hunter", "kube-bench",
        "docker-bench-security", "checkov", "terrascan", "falco", "clair"
    ]

    const osint_tools = [
        "amass", "subfinder", "fierce", "dnsenum", "theharvester", "sherlock",
        "social-analyzer", "recon-ng", "maltego", "spiderfoot", "shodan-cli",
        "censys-cli", "have-i-been-pwned"
    ]

    const exploitation_tools = [
        "metasploit", "exploit-db", "searchsploit"
    ]

    const api_tools = [
        "api-schema-analyzer", "postman", "insomnia", "curl", "httpie", "anew", "qsreplace", "uro"
    ]

    const wireless_tools = [
        "kismet", "wireshark", "tshark", "tcpdump"
    ]

    const additional_tools = [
        "smbmap", "volatility", "sleuthkit", "autopsy", "evil-winrm",
        "paramspider", "airmon-ng", "airodump-ng", "aireplay-ng", "aircrack-ng",
        "msfvenom", "msfconsole", "graphql-scanner", "jwt-analyzer"
    ]


    const all_tools = [
        ...essential_tools,
        ...network_tools,
        ...web_security_tools,
        ...vuln_scanning_tools,
        ...password_tools,
        ...binary_tools,
        ...forensics_tools,
        ...cloud_tools,
        ...osint_tools,
        ...exploitation_tools,
        ...api_tools,
        ...wireless_tools,
        ...additional_tools
    ];

    const tools_status = {};

    for (const tool of all_tools) {
        try {
            const result = await execute_command(`which ${tool}`, { use_cache:true });
            tools_status[tool] = result["success"]
        }
        catch (err) {
            tools_status[tool] = false
        }
    }

    // true only if every tool's status is truthy
    const all_essential_tools_available = essential_tools.every(
        tool => Boolean(tools_status[tool])
    );

    const categoryStats = {
        essential: {
            total: essential_tools.length,
            available: essential_tools.filter(tool => tools_status[tool]).length
        },
        network: {
            total: network_tools.length,
            available: network_tools.filter(tool => tools_status[tool]).length
        },
        web_security: {
            total: web_security_tools.length,
            available: web_security_tools.filter(tool => tools_status[tool]).length
        },
        vuln_scanning: {
            total: vuln_scanning_tools.length,
            available: vuln_scanning_tools.filter(tool => tools_status[tool]).length
        },
        password: {
            total: password_tools.length,
            available: password_tools.filter(tool => tools_status[tool]).length
        },
        binary: {
            total: binary_tools.length,
            available: binary_tools.filter(tool => tools_status[tool]).length
        },
        forensics: {
            total: forensics_tools.length,
            available: forensics_tools.filter(tool => tools_status[tool]).length
        },
        cloud: {
            total: cloud_tools.length,
            available: cloud_tools.filter(tool => tools_status[tool]).length
        },
        osint: {
            total: osint_tools.length,
            available: osint_tools.filter(tool => tools_status[tool]).length
        },
        exploitation: {
            total: exploitation_tools.length,
            available: exploitation_tools.filter(tool => tools_status[tool]).length
        },
        api: {
            total: api_tools.length,
            available: api_tools.filter(tool => tools_status[tool]).length
        },
        wireless: {
            total: wireless_tools.length,
            available: wireless_tools.filter(tool => tools_status[tool]).length
        },
        additional: {
            total: additional_tools.length,
            available: additional_tools.filter(tool => tools_status[tool]).length
        }
    }
     
    const totalToolsAvailable = Object.values(tools_status).filter(Boolean).length;
    return res.json({
        status: "healthy",
        tools_status: tools_status,
        all_essential_tools_available: all_essential_tools_available,
        total_tools_available: totalToolsAvailable,
        total_tools_count: all_tools.length,
        category_stats: categoryStats
    })
}


export default health_check;