import { execute_command } from '../helper.ctf.command.js';

export class CTFWebManager {
    constructor() {
        this.tools = {
            nmap: 'nmap',
            nikto: 'nikto',
            gobuster: 'gobuster',
            ffuf: 'ffuf',
            sqlmap: 'sqlmap',
            whatweb: 'whatweb',
            curl: 'curl'
        };
    }

    async scan(url, options = {}) {
        const results = {
            url,
            technology: null,
            directories: null,
            vulnerabilities: [],
            recommendations: []
        };

        // Technology detection
        const whatweb_result = await execute_command(`whatweb "${url}"`);
        if (whatweb_result.success) {
            results.technology = this._parse_whatweb(whatweb_result.stdout);
        }

        // Directory enumeration
        if (options.enumerate_dirs !== false) {
            results.directories = await this._enumerate_directories(url, options);
        }

        // Common vulnerability checks
        results.vulnerabilities = await this._check_vulnerabilities(url);

        // Generate recommendations
        results.recommendations = this._generate_recommendations(results);

        return results;
    }

    _parse_whatweb(output) {
        const tech = {
            server: null,
            framework: null,
            cms: null,
            languages: [],
            headers: []
        };

        // Parse whatweb output
        const matches = output.matchAll(/\[([^\]]+)\]/g);
        for (const match of matches) {
            const item = match[1];
            
            if (/nginx|apache|iis/i.test(item)) {
                tech.server = item;
            } else if (/wordpress|drupal|joomla/i.test(item)) {
                tech.cms = item;
            } else if (/php|python|ruby|node/i.test(item)) {
                tech.languages.push(item);
            }
        }

        return tech;
    }

    async _enumerate_directories(url, options) {
        const wordlist = options.wordlist || '/usr/share/wordlists/dirb/common.txt';
        
        // Try gobuster first
        const gobuster_result = await execute_command(
            `gobuster dir -u "${url}" -w "${wordlist}" -q -t 20 --timeout 30s 2>&1`,
            true,
            60000
        );

        if (gobuster_result.success) {
            return this._parse_gobuster(gobuster_result.stdout);
        }

        return null;
    }

    _parse_gobuster(output) {
        const directories = [];
        const lines = output.split('\n');

        for (const line of lines) {
            const match = line.match(/^(\/.+?)\s+\(Status: (\d+)\)/);
            if (match) {
                directories.push({
                    path: match[1],
                    status: parseInt(match[2])
                });
            }
        }

        return directories;
    }

    async _check_vulnerabilities(url) {
        const vulnerabilities = [];

        // Check robots.txt
        const robots_result = await execute_command(
            `curl -s "${url}/robots.txt" -m 5`
        );
        if (robots_result.success && robots_result.stdout.includes('Disallow')) {
            vulnerabilities.push({
                type: 'Information Disclosure',
                severity: 'LOW',
                finding: 'robots.txt found',
                details: robots_result.stdout.substring(0, 200)
            });
        }

        // Check common files
        const common_files = [
            '.git/config',
            '.env',
            'config.php',
            'phpinfo.php',
            'admin',
            'login'
        ];

        for (const file of common_files) {
            const check_result = await execute_command(
                `curl -s -o /dev/null -w "%{http_code}" "${url}/${file}" -m 5`
            );
            
            if (check_result.stdout === '200') {
                vulnerabilities.push({
                    type: 'Sensitive File Exposure',
                    severity: 'MEDIUM',
                    finding: `${file} is accessible`,
                    path: `${url}/${file}`
                });
            }
        }

        // Check for directory listing
        const index_result = await execute_command(
            `curl -s "${url}/" -m 5`
        );
        if (index_result.success && /Index of|Directory listing/i.test(index_result.stdout)) {
            vulnerabilities.push({
                type: 'Directory Listing',
                severity: 'LOW',
                finding: 'Directory listing enabled'
            });
        }

        return vulnerabilities;
    }

    _generate_recommendations(results) {
        const recommendations = [];

        if (results.technology?.cms) {
            recommendations.push({
                action: 'CMS detected - check for known vulnerabilities',
                cms: results.technology.cms,
                tools: ['wpscan', 'droopescan']
            });
        }

        if (results.directories && results.directories.length > 0) {
            const interesting = results.directories.filter(d => 
                /admin|login|upload|api|backup/.test(d.path)
            );
            
            if (interesting.length > 0) {
                recommendations.push({
                    action: 'Interesting directories found',
                    directories: interesting.map(d => d.path)
                });
            }
        }

        if (results.vulnerabilities.length > 0) {
            recommendations.push({
                action: 'Vulnerabilities detected - investigate further',
                count: results.vulnerabilities.length
            });
        }

        return recommendations;
    }
}
