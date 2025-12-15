import { execute_command } from '../helper.ctf.command.js';

export class CTFCryptoManager {
    constructor() {
        this.encodings = ['base64', 'hex', 'rot13', 'base32', 'url', 'morse'];
    }

    async solve(ciphertext, method = 'auto', options = {}) {
        if (method === 'auto') {
            return await this._auto_solve(ciphertext, options);
        }

        const solver = this[`_solve_${method}`];
        if (solver) {
            return await solver.call(this, ciphertext, options);
        }

        throw new Error(`Unknown solving method: ${method}`);
    }

    async _auto_solve(ciphertext, options) {
        const results = [];
        
        // Try common encodings
        for (const encoding of this.encodings) {
            try {
                const decoded = await this._try_decode(ciphertext, encoding);
                if (decoded && this._looks_like_plaintext(decoded)) {
                    results.push({
                        method: encoding,
                        result: decoded,
                        confidence: this._calculate_confidence(decoded)
                    });
                }
            } catch (e) {
                // Continue to next encoding
            }
        }

        // Try hash identification
        const hash_type = this._identify_hash(ciphertext);
        if (hash_type) {
            results.push({
                method: 'hash_identification',
                result: hash_type,
                confidence: 0.8
            });
        }

        // Sort by confidence
        results.sort((a, b) => b.confidence - a.confidence);

        return {
            ciphertext,
            possible_solutions: results,
            best_match: results[0] || null
        };
    }

    async _try_decode(text, encoding) {
        switch (encoding) {
            case 'base64':
                return Buffer.from(text, 'base64').toString('utf8');
            
            case 'hex':
                return Buffer.from(text, 'hex').toString('utf8');
            
            case 'rot13':
                return text.replace(/[a-zA-Z]/g, c => 
                    String.fromCharCode(
                        c.charCodeAt(0) + (c.toLowerCase() < 'n' ? 13 : -13)
                    )
                );
            
            case 'base32':
                // Would need a library for proper base32
                return null;
            
            case 'url':
                return decodeURIComponent(text);
            
            default:
                return null;
        }
    }

    _looks_like_plaintext(text) {
        if (!text || text.length === 0) return false;
        
        // Check for printable ASCII
        const printable = /^[\x20-\x7E\s]+$/;
        if (!printable.test(text)) return false;

        // Check for common English words
        const common_words = ['the', 'and', 'for', 'are', 'flag', 'ctf', 'you'];
        const lower = text.toLowerCase();
        return common_words.some(word => lower.includes(word));
    }

    _calculate_confidence(text) {
        let confidence = 0.5;

        // Contains flag format
        if (/flag\{.*\}|ctf\{.*\}/i.test(text)) {
            confidence += 0.4;
        }

        // Contains common words
        const common_words = ['the', 'and', 'flag', 'ctf'];
        const matches = common_words.filter(word => 
            text.toLowerCase().includes(word)
        ).length;
        confidence += matches * 0.1;

        return Math.min(confidence, 1.0);
    }

    _identify_hash(text) {
        const hash_patterns = {
            'MD5': /^[a-f0-9]{32}$/i,
            'SHA1': /^[a-f0-9]{40}$/i,
            'SHA256': /^[a-f0-9]{64}$/i,
            'SHA512': /^[a-f0-9]{128}$/i,
            'bcrypt': /^\$2[aby]\$\d+\$/,
            'NTLM': /^[a-f0-9]{32}$/i
        };

        for (const [name, pattern] of Object.entries(hash_patterns)) {
            if (pattern.test(text.trim())) {
                return name;
            }
        }

        return null;
    }

    async _solve_caesar(ciphertext, options) {
        const results = [];
        
        for (let shift = 1; shift <= 25; shift++) {
            const decoded = this._caesar_shift(ciphertext, shift);
            if (this._looks_like_plaintext(decoded)) {
                results.push({
                    shift,
                    result: decoded,
                    confidence: this._calculate_confidence(decoded)
                });
            }
        }

        return {
            method: 'caesar',
            ciphertext,
            results: results.sort((a, b) => b.confidence - a.confidence)
        };
    }

    _caesar_shift(text, shift) {
        return text.replace(/[a-zA-Z]/g, c => {
            const base = c.charCodeAt(0) < 97 ? 65 : 97;
            return String.fromCharCode(
                ((c.charCodeAt(0) - base + shift) % 26) + base
            );
        });
    }

    async _solve_xor(ciphertext, options) {
        const key = options.key;
        if (!key) {
            throw new Error('XOR solving requires a key');
        }

        const cipher_bytes = Buffer.from(ciphertext, 'hex');
        const key_bytes = Buffer.from(key);
        
        const result = Buffer.alloc(cipher_bytes.length);
        for (let i = 0; i < cipher_bytes.length; i++) {
            result[i] = cipher_bytes[i] ^ key_bytes[i % key_bytes.length];
        }

        return {
            method: 'xor',
            key,
            result: result.toString('utf8')
        };
    }
}
