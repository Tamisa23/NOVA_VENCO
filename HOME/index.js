const express = require("express");
const path = require("path");

const app = express();

// ให้ Express เสิร์ฟไฟล์ Static (CSS, JS, Images)
app.use(express.static(__dirname));

// เสิร์ฟ index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
