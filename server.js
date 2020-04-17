const express = require("express");
const app = express();

app.use('/', express.static("server"));
app.post()

app.listen(80, () => {
    console.log("server is running on port 80");
});