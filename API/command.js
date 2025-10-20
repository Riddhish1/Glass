import execute_command from "../Helpers/helper.command.js";

const generic_command = async (req, res) => {
    try {
        const payload = req.body;
        const command = payload && payload.command !== undefined ? payload.command : payload;

        if (!command) {
            return res.status(400).json({ error: "no command provided" });
        }

        const result = await execute_command(command, { use_cache: true });
        return res.json(result);
    } catch (err) {
        console.error("Error in command.js func generric command", err);
        return res.status(500).json({ error: err?.message || String(err) });
    }
};

export default generic_command;
