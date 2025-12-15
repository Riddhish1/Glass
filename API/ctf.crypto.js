import { CTFCryptoManager } from '../Helpers/CTF/helper.ctf.crypto.js';

const cryptoManager = new CTFCryptoManager();

export async function solve_crypto_challenge(req, res) {
    try {
        const { ciphertext, method, options = {} } = req.body;

        if (!ciphertext) {
            return res.status(400).json({
                success: false,
                error: 'ciphertext is required'
            });
        }

        const result = await cryptoManager.solve(ciphertext, method, options);

        res.json({
            success: true,
            result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
