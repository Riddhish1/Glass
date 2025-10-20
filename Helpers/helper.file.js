import { existsSync, mkdirSync, rmSync, statSync, readdirSync } from "fs";
import path from "path";
import fs from "fs/promises"

class FileOperationsManager {
    /**
     * 
     * @param {string} base_dir  
     */
    constructor(base_dir = "/tmp/glass_files") {
        this.base_dir = base_dir;
        this.maxFileSize = 100 * 1024 * 1024; //100MB
        if (!existsSync(this.base_dir)) mkdirSync(this.base_dir, { recursive: true })
    }

    async createFile(filename, content, binary = false) {
        try {
            const filePath = path.join(this.base_dir, filename);
            mkdirSync(path.dirname(filePath), { recursive: true })
            const contentBuffer = Buffer.isBuffer(content) ? content : Buffer.from(content, "utf-8");
            if (contentBuffer.length > this.maxFileSize) return { success: false, error: `File size exceeds ${this.maxFileSize} bytes` };
            await fs.writeFile(filePath, contentBuffer, binary ? null : "utf8");
            return { success: true, path: filePath, size: contentBuffer.length };
        }
        catch (err) {
            return { success: false, error: err.message };
        }
    }




    async modifyFile(filename, content, append = false) {
        try {
            const filePath = path.join(this.base_dir, filename);
            if (!existsSync(filePath)) return { success: false, error: "File does not exist" };
            const flag = append ? "a" : "w";
            await fs.writeFile(filePath, content, { flag });
            return { success: true, path: filePath };
        } catch (e) {
            return { success: false, error: err.message };
        }
    }

    async deleteFile(filename) {
        try {
            const filePath = path.join(this.base_dir, filename);
            if (!existsSync(filePath)) return { success: false, error: "File does not exist" };
            const stats = statSync(filePath);
            if (stats.isDirectory()) {
                rmSync(filePath, { recursive: true, force: true });
            } else {
                await fs.unlink(filePath);
            }
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }


    async listFiles(directory = ".") {
        try {
            const dirPath = path.join(this.base_dir, directory);
            if (!existsSync(dirPath)) return { success: false, error: "Directory does not exist" };

            const files = readdirSync(dirPath).map((name) => {
                const itemPath = path.join(dirPath, name);
                const stats = statSync(itemPath);
                return {
                    name,
                    type: stats.isDirectory() ? "directory" : "file",
                    size: stats.isFile() ? stats.size : 0,
                    modified: new Date(stats.mtime).toISOString(),
                };
            });

            return { success: true, files };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }




}


export default FileOperationsManager;
