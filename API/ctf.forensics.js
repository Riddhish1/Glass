import { CTFForensicsManager } from '../Helpers/CTF/helper.ctf.forensics.js';

const forensicsManager = new CTFForensicsManager();

export async function analyze_forensics_file(req, res) {
    try {
        const { file_path, options = {} } = req.body;

        if (!file_path) {
            return res.status(400).json({
                success: false,
                error: 'file_path is required'
            });
        }

        const analysis = await forensicsManager.analyze(file_path, options);

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
