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

app.listen(port, '0.0.0.0',() => {
    console.log(`Server running on LAN at http://192.168.0.73:${port}`);
    console.log(`Server running public at http://188.241.10.200:${port}`);
  });