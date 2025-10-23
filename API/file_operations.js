import FileOperationsManager from "../Helpers/helper.file.js";

const fileManager = new FileOperationsManager();

const create_file = async (req, res) => {
    //to create a new file
    try {
        const payload = req.body;
        const filename = payload?.filename;
        const content = payload?.content;
        const binary = payload?.binary || false;

    if (!filename) return res.status(400).json({ error: "Please mention file name" });

    const result = await fileManager.createFile(filename, content, binary);
    return res.status(result.success ? 200 : 500).json(result);
    }
    catch (err) {
    return res.status(500).json({ error: "File creation failed", details: err?.message || String(err) });
    }
}




const modify_file = async (req, res) => {
    //to mpdify a file
    try {
        const payload = req.body;
        const filename = payload?.filename;
        const content = payload?.content;
    const append = payload?.append || false;

    if (!filename) return res.status(400).json({ error: "Please mention file name" });

    const result = await fileManager.modifyFile(filename, content, append);
    return res.status(result.success ? 200 : 500).json(result);
    }
    catch (err) {
    return res.status(500).json({ error: "File modification failed", details: err?.message || String(err) });
    }
}

const delete_file = async (req, res) => {
    try {
        const payload = req.body;
        const filename = payload?.filename;
    if (!filename) return res.status(400).json({ error: "Please enter filename" });

    const result = await fileManager.deleteFile(filename);

    return res.status(result.success ? 200 : 500).json(result);
    }
    catch (err) {
    return res.status(500).json({ error: "File deletion failed", details: err?.message || String(err) });
    }
}

const list_files = async (req, res) => {
    try {
        const payload = req.body;
        const directory = payload?.directory;
        if (!directory) return res.status(400).json({ error: "Please give directory" });

        const result = await fileManager.listFiles(directory);
        return res.status(result.success ? 200 : 500).json(result);
    }
    catch (err) {
        return res.status(500).json({ error: "Error listing files", details: err?.message || String(err) });
    }
}

export { create_file, modify_file, delete_file, list_files };


