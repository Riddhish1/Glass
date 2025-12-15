import { CTFPwnManager } from '../Helpers/CTF/helper.ctf.pwn.js';

const pwnManager = new CTFPwnManager();

export async function analyze_ctf_binary(req, res) {
    try {
        const { binary_path, options = {} } = req.body;

        if (!binary_path) {
            return res.status(400).json({
                success: false,
                error: 'binary_path is required'
            });
        }

        const analysis = await pwnManager.analyze(binary_path, options);

        res.json({
            success: true,
            analysis
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

export async function exploit_pwn_challenge(req, res) {
    try {
        const { binary_path, host, port, options = {} } = req.body;

        if (!binary_path) {
            return res.status(400).json({
                success: false,
                error: 'binary_path is required'
            });
        }

        const exploit = await pwnManager.create_exploit(
            binary_path,
            host,
            port,
            options
        );

        res.json({
            success: true,
            exploit
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
