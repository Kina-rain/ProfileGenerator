const inquirer = require("inquirer");
const fs = require("fs");
const axios = require("axios");
const pdf = require("html-pdf");
const options = { format: "Letter" };


const questions = [
    {
        type: "input",
        message: "What is your GitHub user name?",
        name: "username"
    },
    {
        type: "input",
        message: "What is your favorite color?",
        name: "color"
    }
]

inquirer
    .prompt(questions)
    .then(function (response) {
        //  console.log(response.username)
        //  console.log(response.color)
        //   console.log(JSON.stringify(response))
        //   console.log(generateHTML(response))

        axios.get(`https://api.github.com/users/${response.username}/repos?per_page=100`).then(res => {

            axios.get(`https://api.github.com/users/${response.username}/watched`).then(result => {
                let starCount = result.stargazers_count;
            });

            //Call Generate HTML
            let filename = `${response.username}_profile.html`

            fs.writeFile(filename, generateHTML(response, res, starCount), function (err) {
                if (err) {
                    return console.log(err);
                }
                console.log("Wrote " + filename)
            });

            let html = fs.readFileSync(filename, "utf8");
            pdf.create(html, options).toFile(`./${response.username}_profile.pdf`, function(err, res) {
                if (err) return console.log(err);
            });
        });
    });



function generateHTML(answers, githubResponse, starCount) {
    return `<!DOCTYPE html>
    <html lang='en'>
    <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content="width=device-width, initial-scale=1">
        <link href="assets/css/style.css" rel="stylesheet">
        <style>
            body {
                background-color: ${answers.color}
            }
        </style>
        <title>${answers.username} Resume Profile</title>
    </head>
    <body>
        <h1>${answers.username}</h1>
    </body>
    </html>`
}
