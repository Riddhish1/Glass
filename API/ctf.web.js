import { CTFWebManager } from '../Helpers/CTF/helper.ctf.web.js';

const webManager = new CTFWebManager();

export async function scan_ctf_web(req, res) {
    try {
        const { url, options = {} } = req.body;

        if (!url) {
            return res.status(400).json({
                success: false,
                error: 'url is required'
            });
        }

        const scan_results = await webManager.scan(url, options);

        res.json({
            success: true,
            scan_results
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
