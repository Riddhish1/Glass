import FileOperationsManager from "../Helpers/helper.file.js";

const fileManager = new FileOperationsManager();

const create_file = async(req,res) =>{
    //to create a new file
    try{
        const payload = req.body;
        const filename = payload?.filename;
        const content = payload?.content;
        const binary = payload ? payload.binary : false;

        if(!filename) return res.status(500).json({error:"Please Mention File Name"});

        const result = await fileManager.createFile(filename,content,binary);
        return res.json(result);
    }
    catch(err){
        return res.status(500).json({error:"File Creation Failed : ",err});
    }
}




const modify_file = async(req,res) =>{
    //to mpdify a file
    try{
        const payload = req.body;
        const filename = payload?.filename;
        const content = payload?.content;
        const append = append ? payload.append : false;

        if(!filename) return res.status(500).json({error:"Please Mention File Name"});

        const result = await fileManager.createFile(filename,content,append);
        return res.json(result);
    }
    catch(err){
        return res.status(500).json({error:"File modification Failed : ",err});
    }
}




