import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) =>{
    try{
        res.render("index.ejs");
    }
    catch(err){
        console.log(err);
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });