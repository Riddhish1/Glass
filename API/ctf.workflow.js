import { CTFWorkflowManager } from '../Helpers/helper.ctf.workflow.js';

const workflowManager = new CTFWorkflowManager();

export async function create_ctf_workflow(req, res) {
    try {
        const { category, difficulty, description } = req.body;

        if (!category) {
            return res.status(400).json({
                success: false,
                error: 'Category is required (web, crypto, pwn, forensics, reverse, misc, osint)'
            });
        }

        const workflow = workflowManager.create_workflow(
            category,
            difficulty || 'medium',
            description
        );

        res.json({
            success: true,
            workflow
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

export async function execute_ctf_challenge(req, res) {
    try {
        const { category, target, options = {} } = req.body;

        if (!category || !target) {
            return res.status(400).json({
                success: false,
                error: 'Category and target are required'
            });
        }

        const result = await workflowManager.execute_challenge(
            category,
            target,
            options
        );

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
