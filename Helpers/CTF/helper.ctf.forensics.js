import { execute_command } from '../helper.ctf.command.js';

export class CTFForensicsManager {
    constructor() {
        this.tools = {
            file: 'file',
            strings: 'strings',
            binwalk: 'binwalk',
            foremost: 'foremost',
            exiftool: 'exiftool',
            steghide: 'steghide',
            zsteg: 'zsteg'
        };
    }

    async analyze(file_path, options = {}) {
        const results = {
            file: file_path,
            file_type: null,
            metadata: null,
            strings: null,
            steganography: null,
            carved_files: null,
            recommendations: []
        };

        // Basic file analysis
        const file_result = await execute_command(`file "${file_path}"`);
        if (file_result.success) {
            results.file_type = file_result.stdout;
        }

        // Extract metadata
        const exif_result = await execute_command(`exiftool "${file_path}"`);
        if (exif_result.success) {
            results.metadata = this._parse_exiftool(exif_result.stdout);
        }

        // String extraction
        if (options.extract_strings !== false) {
            const strings_result = await execute_command(
                `strings "${file_path}" | grep -E "flag|ctf|password|key" -i || strings "${file_path}" | head -50`
            );
            if (strings_result.success) {
                results.strings = strings_result.stdout.split('\n').filter(s => s.length > 3);
            }
        }

        // Steganography checks
        if (options.check_steg !== false) {
            results.steganography = await this._check_steganography(file_path);
        }

        // File carving
        if (options.carve_files) {
            results.carved_files = await this._carve_files(file_path);
        }

        // Generate recommendations
        results.recommendations = this._generate_recommendations(results);

        return results;
    }

    async _check_steganography(file_path) {
        const steg_results = {
            steghide: null,
            zsteg: null,
            binwalk: null
        };

        // Steghide (for JPEG/BMP)
        const steghide_result = await execute_command(
            `steghide info "${file_path}" 2>&1`
        );
        if (steghide_result.stdout.includes('embedded')) {
            steg_results.steghide = {
                detected: true,
                info: steghide_result.stdout
            };
        }

        // Zsteg (for PNG)
        if (file_path.toLowerCase().endsWith('.png')) {
            const zsteg_result = await execute_command(`zsteg "${file_path}"`);
            if (zsteg_result.success && zsteg_result.stdout.length > 0) {
                steg_results.zsteg = {
                    detected: true,
                    data: zsteg_result.stdout
                };
            }
        }

        // Binwalk for embedded files
        const binwalk_result = await execute_command(`binwalk "${file_path}"`);
        if (binwalk_result.success) {
            const files = this._parse_binwalk(binwalk_result.stdout);
            if (files.length > 1) {
                steg_results.binwalk = {
                    detected: true,
                    embedded_files: files
                };
            }
        }

        return steg_results;
    }

    async _carve_files(file_path) {
        const output_dir = `${file_path}_carved`;
        const foremost_result = await execute_command(
            `foremost -i "${file_path}" -o "${output_dir}"`
        );

        if (foremost_result.success) {
            return {
                output_directory: output_dir,
                success: true
            };
        }

        return null;
    }

    _parse_exiftool(output) {
        const metadata = {};
        const lines = output.split('\n');
        
        for (const line of lines) {
            const match = line.match(/^([^:]+):\s*(.+)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim();
                metadata[key] = value;
            }
        }

        return metadata;
    }

    _parse_binwalk(output) {
        const files = [];
        const lines = output.split('\n');
        
        for (const line of lines) {
            const match = line.match(/^\s*(\d+)\s+0x[0-9A-F]+\s+(.+)$/i);
            if (match) {
                files.push({
                    offset: parseInt(match[1]),
                    description: match[2].trim()
                });
            }
        }

        return files;
    }

    _generate_recommendations(results) {
        const recommendations = [];

        if (results.steganography?.steghide?.detected) {
            recommendations.push({
                tool: 'steghide',
                action: 'Extract embedded data',
                command: `steghide extract -sf "${results.file}"`
            });
        }

        if (results.steganography?.zsteg?.detected) {
            recommendations.push({
                tool: 'zsteg',
                action: 'Extract PNG steganography',
                command: `zsteg -a "${results.file}"`
            });
        }

        if (results.steganography?.binwalk?.detected) {
            recommendations.push({
                tool: 'binwalk',
                action: 'Extract embedded files',
                command: `binwalk -e "${results.file}"`
            });
        }

        return recommendations;
    }
}
