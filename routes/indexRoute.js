const router = require("express").Router();
const path = require("path");
const puppeteer = require("puppeteer");
require("dotenv").config();
const groupdocs_conversion_cloud = require("groupdocs-conversion-cloud");
const fs = require("fs");
const clientId = process.env.Client_ID;
const clientSecret = process.env.Client_Secret;
const myStorage = "";

const config = new groupdocs_conversion_cloud.Configuration(
  clientId,
  clientSecret
);
config.apiBaseUrl = process.env.base_url;

function genarateText(length = 6) {
  var a = "absass".split("");
  var b = [];
  for (var i = 0; i < length; i++) {
    var j = (Math.random() * (a.length - 1)).toFixed(0);
    b[i] = a[j];
  }
  return b.join("");
}

router.post("/", async (req, res) => {
  if (req.body.url) {
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      const website_url = req.body.url;
      await page.goto(website_url, { waitUntil: "networkidle0" });
      await page.emulateMediaType("screen");
      const text = genarateText();
      const pdf = await page.pdf({
        path: `upload/${text}.pdf`,
        margin: { top: "100px", right: "50px", bottom: "100px", left: "50px" },
        printBackground: true,
        format: "A4",
      });
      await browser.close();
      res.render("index", { link: `/${text}.pdf` });
    } catch (error) {
      console.log(error);
      res.render("index", { msg: `An error occurred` });
    }
  } else if (req.body.html) {
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      const file = fs.readFileSync(req.body.file, "utf-8");
      await page.setContent(file, { waitUntil: "domcontentloaded" });
      await page.emulateMediaType("screen");

      const text = genarateText();
      const pdf = await page.pdf({
        path: `upload/${text}.pdf`,
        margin: { top: "100px", right: "50px", bottom: "100px", left: "50px" },
        printBackground: true,
        format: "A4",
      });
      await browser.close();
      res.render("index", { link: `/${text}.pdf` });
    } catch (error) {
      console.log(error);
      res.render("index", { msg: `An error occurred` });
    }
  } else if (req.body.pdf) {
    try {
      const url_pdf = path.join(__dirname + `\\upload\\${req.body.path}`);
      fs.readFile(url_pdf, (err, fileStream) => {
        var fileApi = groupdocs_conversion_cloud.FileApi.fromConfig(config);
        var request = new groupdocs_conversion_cloud.UploadFileRequest(
          req.body.pdf,
          fileStream,
          myStorage
        );
        fileApi.uploadFile(request);
      });

      let convertApi = groupdocs_conversion_cloud.ConvertApi.fromKeys(
        clientId,
        clientSecret
      );
      let settings = new groupdocs_conversion_cloud.ConvertSettings();
      settings.filePath = req.body.pdf;
      settings.format = ".docx";
      function split(str) {
        const dotIndex = str.indexOf(".");
        if (dotIndex === -1) {
          return str;
        }
        return str.substring(0, dotIndex);
      }
      const newpath = split(req.body.pdf);
      settings.outputPath = `${newpath}.docx`;

      let request = new groupdocs_conversion_cloud.ConvertDocumentRequest(
        settings
      );

      let result = await convertApi.convertDocument(request);

      var fileApi = groupdocs_conversion_cloud.FileApi.fromConfig(config);
      let request2 = new groupdocs_conversion_cloud.DownloadFileRequest(
        settings.outputPath,
        myStorage
      );
      let response = await fileApi.downloadFile(request2);
      fs.writeFile(
        `upload/${settings.outputPath}`,
        response,
        "binary",
        function (err) {}
      );
      res.render("index", { link: `/${settings.outputPath}` });
    } catch (error) {
      console.log(error);
      res.render("index", { msg: `An error occurred` });
    }
  } else if (req.body.doc) {
    try {
      const url_pdf = path.join(__dirname + `\\upload\\${req.body.path}`);
      fs.readFile(url_pdf, (err, fileStream) => {
        var fileApi = groupdocs_conversion_cloud.FileApi.fromConfig(config);
        var request = new groupdocs_conversion_cloud.UploadFileRequest(
          req.body.doc,
          fileStream,
          myStorage
        );
        fileApi.uploadFile(request);
      });

      let convertApi = groupdocs_conversion_cloud.ConvertApi.fromKeys(
        clientId,
        clientSecret
      );
      let settings = new groupdocs_conversion_cloud.ConvertSettings();
      settings.filePath = req.body.doc;
      settings.format = ".pdf";
      function split(str) {
        const dotIndex = str.indexOf(".");
        if (dotIndex === -1) {
          return str;
        }
        return str.substring(0, dotIndex);
      }
      const newpath = split(req.body.doc);
      settings.outputPath = `${newpath}.pdf`;

      let request = new groupdocs_conversion_cloud.ConvertDocumentRequest(
        settings
      );

      let result = await convertApi.convertDocument(request);

      var fileApi = groupdocs_conversion_cloud.FileApi.fromConfig(config);
      let request2 = new groupdocs_conversion_cloud.DownloadFileRequest(
        settings.outputPath,
        myStorage
      );
      let response = await fileApi.downloadFile(request2);
      fs.writeFile(
        `upload/${settings.outputPath}`,
        response,
        "binary",
        function (err) {}
      );
      res.render("index", { link: `/${settings.outputPath}` });
    } catch (error) {
      console.log(error);
      res.render("index", { msg: `An error occurred` });
    }
  }
});

const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "routes/upload/");
  },
  filename: function (req, file, cb) {
    const name = file.originalname;
    cb(null, name);
  },
});
const upload = multer({ storage: storage });
router.post("/upload", upload.single("file"), (req, res) => {
  res.send({ path: `${req.file.filename}` });
});
router.get("/", (req, res) => {
  res.render("index");
});
module.exports = router;
