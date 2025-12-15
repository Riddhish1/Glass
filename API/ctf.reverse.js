import { CTFReverseManager } from '../Helpers/CTF/helper.ctf.reverse.js';

const reverseManager = new CTFReverseManager();

export async function analyze_reverse_binary(req, res) {
    try {
        const { binary_path, options = {} } = req.body;

        if (!binary_path) {
            return res.status(400).json({
                success: false,
                error: 'binary_path is required'
            });
        }

        const analysis = await reverseManager.analyze(binary_path, options);

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
