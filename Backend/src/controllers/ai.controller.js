import aiService from "../services/ai.service.js"

const getReview=async(req,res)=>{
    const code = req.body.code;
    // console.log(code)
    if(!code){
        return res.status(400).send("Prompt is required")
    }
    const response = await aiService(code);

    res.send(response)
}
export default getReview