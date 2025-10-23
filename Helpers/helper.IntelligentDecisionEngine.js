import TargetType from "./helper.TargetType.js";
import TechnologyStack from "./helper.TechnologyStack.js"

class IntelligentDecisionEngine {
    constructor() {
        this.toolEffectiveness = this.initializeToolEffectiveness();
        this.technologySignatures = this.initializeTechnologySignatures();
        this.attackPatterns = this.initializeAttackPatterns();
        this.useAdvancedOptimizer = true; // Enable advanced optimization by default
    }
    initializeToolEffectiveness() {
        //Initialize tool effectiveness ratings for different target types

        return {
            //When you add square brackets:
            // const obj = {
            //   [TargetType.WEB_APPLICATION]: { nmap: 0.8 }
            // };
            // JavaScript first evaluates what’s inside the brackets:
            // TargetType.WEB_APPLICATION → "web_application"
            // Then it creates:
            // const obj = {
            //   "web_application": { nmap: 0.8 }
            // };

            [TargetType.WEB_APPLICATION]: {
                nmap: 0.8,
                gobuster: 0.9,
                nuclei: 0.95,
                nikto: 0.85,
                sqlmap: 0.9,
                ffuf: 0.9,
                feroxbuster: 0.85,
                katana: 0.88,
                httpx: 0.85,
                wpscan: 0.95, // High for WordPress sites
                burpsuite: 0.9,
                dirsearch: 0.87,
                gau: 0.82,
                waybackurls: 0.8,
                arjun: 0.9,
                paramspider: 0.85,
                x8: 0.88,
                jaeles: 0.92,
                dalfox: 0.93, //High for XSS detection
                anew: 0.7, //Utility tool
                qsreplace: 0.75, //Utility tool
                uro: 0.7, //Utility tool
            },
            [TargetType.NETWORK_HOST]: {
                nmap: 0.95,
                "nmap-advanced": 0.97, //Enhanced Nmap with NSE scripts
                masscan: 0.92, //Enhanced with intelligent rate limiting
                rustscan: 0.9, //Ultra-fast scanning
                autorecon: 0.95, //Comprehensive automated recon
                enum4linux: 0.8,
                "enum4linux-ng": 0.88, //Enhanced version
                smbmap: 0.85,
                rpcclient: 0.82,
                nbtscan: 0.75,
                "arp-scan": 0.85, //Great for network discovery
                responder: 0.88, //Excellent for credential harvesting
                hydra: 0.8,
                netexec: 0.85,
                amass: 0.7,
            },
            [TargetType.API_ENDPOINT]: {
                nuclei: 0.9,
                ffuf: 0.85,
                arjun: 0.95, //Excellent for API parameter discovery
                paramspider: 0.88,
                httpx: 0.9, //Great for API probing
                x8: 0.92, //Excellent for hidden parameters
                katana: 0.85, //Good for API endpoint discovery
                jaeles: 0.88,
                postman: 0.8,
            },
            [TargetType.CLOUD_SERVICE]: {
                prowler: 0.95, // Excellent for AWS security assessment
                "scout-suite": 0.92, //Great for multi-cloud assessment
                cloudmapper: 0.88, //Good for AWS network visualization
                pacu: 0.85, //AWS exploitation framework
                trivy: 0.9, //Excellent for container scanning
                clair: 0.85, //Good for container vulnerability analysis
                "kube-hunter": 0.9, //Excellent for Kubernetes penetration testing
                "kube-bench": 0.88, //Great for CIS benchmarks
                "docker-bench-security": 0.85, //Good for Docker security
                falco: 0.87, //Great for runtime monitoring
                checkov: 0.9, //Excellent for IaC scanning
                terrascan: 0.88, //Great for IaC security
            },
            [TargetType.BINARY_FILE]: {
                ghidra: 0.95, //Excellent for comprehensive analysis
                radare2: 0.9, //Great for reverse engineering
                gdb: 0.85,
                "gdb-peda": 0.92, //Enhanced debugging
                angr: 0.88, //Excellent for symbolic execution
                pwntools: 0.9, //Great for exploit development
                ropgadget: 0.85,
                ropper: 0.88, //Enhanced gadget searching
                "one-gadget": 0.82, //Specific to libc
                "libc-database": 0.8, //Specific to libc identification
                checksec: 0.75,
                strings: 0.7,
                objdump: 0.75,
                binwalk: 0.8,
                pwninit: 0.85, //Great for CTF setup
            },
        };
    }


    initializeTechnologySignatures() {
        //Initialize technology detection signatures
        return {
            //headers → patterns to check in HTTP headers (from web servers).
            headers: {
                [TechnologyStack.APACHE]: ["Apache", "apache"],
                [TechnologyStack.NGINX]: ["nginx", "Nginx"],
                [TechnologyStack.IIS]: ["Microsoft-IIS", "IIS"],
                [TechnologyStack.PHP]: ["PHP", "X-Powered-By: PHP"],
                [TechnologyStack.NODEJS]: ["Express", "X-Powered-By: Express"],
                [TechnologyStack.PYTHON]: ["Django", "Flask", "Werkzeug"],
                [TechnologyStack.JAVA]: ["Tomcat", "JBoss", "WebLogic"],
                [TechnologyStack.DOTNET]: ["ASP.NET", "X-AspNet-Version"],
            },
            //content → patterns to search in webpage content or source code if it contains __REACT_DEVTOOLS frontend is liekly in react
            content: {
                [TechnologyStack.WORDPRESS]: ["wp-content", "wp-includes", "WordPress"],
                [TechnologyStack.DRUPAL]: ["Drupal", "drupal", "/sites/default"],
                [TechnologyStack.JOOMLA]: ["Joomla", "joomla", "/administrator"],
                [TechnologyStack.REACT]: ["React", "react", "__REACT_DEVTOOLS"],
                [TechnologyStack.ANGULAR]: ["Angular", "angular", "ng-version"],
                [TechnologyStack.VUE]: ["Vue", "vue", "__VUE__"],
            },
            ports: {
                [TechnologyStack.APACHE]: [80, 443, 8080, 8443],
                [TechnologyStack.NGINX]: [80, 443, 8080],
                [TechnologyStack.IIS]: [80, 443, 8080],
                [TechnologyStack.NODEJS]: [3000, 8000, 8080, 9000],
            },
        };
    }

    initializeAttackPatterns() {
        return {
            web_reconnaissance: [
                { tool: "nmap", priority: 1, params: { scan_type: "-sV -sC", ports: "80,443,8080,8443" } },
                { tool: "httpx", priority: 2, params: { probe: true, tech_detect: true } },
                { tool: "katana", priority: 3, params: { depth: 3, js_crawl: true } },
                { tool: "gau", priority: 4, params: { include_subs: true } },
                { tool: "waybackurls", priority: 5, params: { get_versions: false } },
                { tool: "nuclei", priority: 6, params: { severity: "critical,high", tags: "tech" } },
                { tool: "dirsearch", priority: 7, params: { extensions: "php,html,js,txt", threads: 30 } },
                { tool: "gobuster", priority: 8, params: { mode: "dir", extensions: "php,html,js,txt" } },
            ],
            api_testing: [
                { tool: "httpx", priority: 1, params: { probe: true, tech_detect: true } },
                { tool: "arjun", priority: 2, params: { method: "GET,POST", stable: true } },
                { tool: "x8", priority: 3, params: { method: "GET", wordlist: "/usr/share/wordlists/x8/params.txt" } },
                { tool: "paramspider", priority: 4, params: { level: 2 } },
                { tool: "nuclei", priority: 5, params: { tags: "api,graphql,jwt", severity: "high,critical" } },
                { tool: "ffuf", priority: 6, params: { mode: "parameter", method: "POST" } },
            ],
            network_discovery: [
                { tool: "arp-scan", priority: 1, params: { local_network: true } },
                { tool: "rustscan", priority: 2, params: { ulimit: 5000, scripts: true } },
                { tool: "nmap-advanced", priority: 3, params: { scan_type: "-sS", os_detection: true, version_detection: true } },
                { tool: "masscan", priority: 4, params: { rate: 1000, ports: "1-65535", banners: true } },
                { tool: "enum4linux-ng", priority: 5, params: { shares: true, users: true, groups: true } },
                { tool: "nbtscan", priority: 6, params: { verbose: true } },
                { tool: "smbmap", priority: 7, params: { recursive: true } },
                { tool: "rpcclient", priority: 8, params: { commands: "enumdomusers;enumdomgroups;querydominfo" } },
            ],
            vulnerability_assessment: [
                { tool: "nuclei", priority: 1, params: { severity: "critical,high,medium", update: true } },
                { tool: "jaeles", priority: 2, params: { threads: 20, timeout: 20 } },
                { tool: "dalfox", priority: 3, params: { mining_dom: true, mining_dict: true } },
                { tool: "nikto", priority: 4, params: { comprehensive: true } },
                { tool: "sqlmap", priority: 5, params: { crawl: 2, batch: true } },
            ],
            comprehensive_network_pentest: [
                { tool: "autorecon", priority: 1, params: { port_scans: "top-1000-ports", service_scans: "default" } },
                { tool: "rustscan", priority: 2, params: { ulimit: 5000, scripts: true } },
                { tool: "nmap-advanced", priority: 3, params: { aggressive: true, nse_scripts: "vuln,exploit" } },
                { tool: "enum4linux-ng", priority: 4, params: { shares: true, users: true, groups: true, policy: true } },
                { tool: "responder", priority: 5, params: { wpad: true, duration: 180 } },
            ],
            binary_exploitation: [
                { tool: "checksec", priority: 1, params: {} },
                { tool: "ghidra", priority: 2, params: { analysis_timeout: 300, output_format: "xml" } },
                { tool: "ropper", priority: 3, params: { gadget_type: "rop", quality: 2 } },
                { tool: "one-gadget", priority: 4, params: { level: 1 } },
                { tool: "pwntools", priority: 5, params: { exploit_type: "local" } },
                { tool: "gdb-peda", priority: 6, params: { commands: "checksec\ninfo functions\nquit" } },
            ],
            ctf_pwn_challenge: [
                { tool: "pwninit", priority: 1, params: { template_type: "python" } },
                { tool: "checksec", priority: 2, params: {} },
                { tool: "ghidra", priority: 3, params: { analysis_timeout: 180 } },
                { tool: "ropper", priority: 4, params: { gadget_type: "all", quality: 3 } },
                { tool: "angr", priority: 5, params: { analysis_type: "symbolic" } },
                { tool: "one-gadget", priority: 6, params: { level: 2 } },
            ],
            aws_security_assessment: [
                { tool: "prowler", priority: 1, params: { provider: "aws", output_format: "json" } },
                { tool: "scout-suite", priority: 2, params: { provider: "aws" } },
                { tool: "cloudmapper", priority: 3, params: { action: "collect" } },
                { tool: "pacu", priority: 4, params: { modules: "iam__enum_users_roles_policies_groups" } },
            ],
            kubernetes_security_assessment: [
                { tool: "kube-bench", priority: 1, params: { output_format: "json" } },
                { tool: "kube-hunter", priority: 2, params: { report: "json" } },
                { tool: "falco", priority: 3, params: { duration: 120, output_format: "json" } },
            ],
            container_security_assessment: [
                { tool: "trivy", priority: 1, params: { scan_type: "image", severity: "HIGH,CRITICAL" } },
                { tool: "clair", priority: 2, params: { output_format: "json" } },
                { tool: "docker-bench-security", priority: 3, params: {} },
            ],
            iac_security_assessment: [
                { tool: "checkov", priority: 1, params: { output_format: "json" } },
                { tool: "terrascan", priority: 2, params: { scan_type: "all", output_format: "json" } },
                { tool: "trivy", priority: 3, params: { scan_type: "config", severity: "HIGH,CRITICAL" } },
            ],
            multi_cloud_assessment: [
                { tool: "scout-suite", priority: 1, params: { provider: "aws" } },
                { tool: "prowler", priority: 2, params: { provider: "aws" } },
                { tool: "checkov", priority: 3, params: { framework: "terraform" } },
                { tool: "terrascan", priority: 4, params: { scan_type: "all" } },
            ],
            bug_bounty_reconnaissance: [
                { tool: "amass", priority: 1, params: { mode: "enum", passive: false } },
                { tool: "subfinder", priority: 2, params: { silent: true, all_sources: true } },
                { tool: "httpx", priority: 3, params: { probe: true, tech_detect: true, status_code: true } },
                { tool: "katana", priority: 4, params: { depth: 3, js_crawl: true, form_extraction: true } },
                { tool: "gau", priority: 5, params: { include_subs: true } },
                { tool: "waybackurls", priority: 6, params: { get_versions: false } },
                { tool: "paramspider", priority: 7, params: { level: 2 } },
                { tool: "arjun", priority: 8, params: { method: "GET,POST", stable: true } },
            ],
            bug_bounty_vulnerability_hunting: [
                { tool: "nuclei", priority: 1, params: { severity: "critical,high", tags: "rce,sqli,xss,ssrf" } },
                { tool: "dalfox", priority: 2, params: { mining_dom: true, mining_dict: true } },
                { tool: "sqlmap", priority: 3, params: { batch: true, level: 2, risk: 2 } },
                { tool: "jaeles", priority: 4, params: { threads: 20, timeout: 20 } },
                { tool: "ffuf", priority: 5, params: { match_codes: "200,204,301,302,307,401,403", threads: 40 } },
            ],
            bug_bounty_high_impact: [
                { tool: "nuclei", priority: 1, params: { severity: "critical", tags: "rce,sqli,ssrf,lfi,xxe" } },
                { tool: "sqlmap", priority: 2, params: { batch: true, level: 3, risk: 3, tamper: "space2comment" } },
                { tool: "jaeles", priority: 3, params: { signatures: "rce,sqli,ssrf", threads: 30 } },
                { tool: "dalfox", priority: 4, params: { blind: true, mining_dom: true, custom_payload: "alert(document.domain)" } },
            ],
        };
    }
    analyzeTarget(target){
        
    }
}