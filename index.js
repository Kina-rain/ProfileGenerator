const inquirer = require("inquirer");
const fs = require("fs");
const axios = require("axios");
const pdf = require("phantom-html2pdf");

//questions for users to answer
const questions = [
    {
        type: "input",
        message: "What is your GitHub user name?",
        name: "username"
    },
    {
        type: "input",
        message: "What is your favorite color other than black?",
        name: "color"
    }
]

//fire up the console interface
inquirer
    .prompt(questions)
    .then(function (response) {

        //setup the file names
        let htmlFilename = `${response.username}_profile.html`;
        let pdfFilename = `${response.username}_profile.pdf`;

        //Perform the ajax calls and generate the html/pdf from the data
        axios.all([
            axios.get(`https://api.github.com/users/${response.username}`),
            axios.get(`https://api.github.com/users/${response.username}/watched`)
        ])
            .then(responseArr => {
                let gitHubMainResponse = responseArr[0].data;
                let starCount = getStarCount(responseArr[1].data);

                //write the html file from the response data
                fs.writeFile(htmlFilename, generateHTML(response, gitHubMainResponse, starCount), function (err) {
                    if (err) {
                        return console.log(err);
                    }
                });

                //These are the options that phantom-html2pdf needs to write the file
                let options = {
                    "html": `${htmlFilename}`,
                    "css": "",
                    "js": "",
                    "runnings": "",
                    "paperSize": { format: 'A4', orientation: 'portrait', border: '1cm' },
                    "deleteOnAction": "true",
                    "runningsArgs": ""
                }

                //run the convert method on the html file to make a pdf
                pdf.convert(options, function (err, result) {
                    result.toFile(pdfFilename, function () { });
                });
            });
    });

function getStarCount(gitData) {

    //counter for stars
    let sCount = 0;

    //using map to get the stargazers_count from the array
    const map1 = gitData.map(gitInfo => sCount += gitInfo.stargazers_count);

    //return the last element in the array since that is the max star count
    return map1[map1.length - 1];
}

function generateHTML(answers, githubResponse, starCount) {
    //Here I am generating and return formated HTML to produce a professional profile page.
    return `<!DOCTYPE html>
    <html lang='en'>
    
    <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content="width=device-width, initial-scale=1">
        <title>Profile</title>
        <style>
            .footer {
                height: 80px;
                background-color: ${answers.color};
                margin: 0 auto;
                border-radius: 25px;
                width: 700px;
            }
    
            .profileImg {
                border-radius: 75px;
                float: center;
                padding-top: 10px;
            }
    
            .backgroundCard {
                background-color: beige;
                width: 700px;
                height: 450px;
                position: relative;
                margin: 0 auto;
                border-radius: 25px;
            }
    
            .bigCard {
                background-color: ${answers.color};
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                margin: 10px auto;
                text-align: center;
                height: 400px;
                width: 390px;
                z-index: 1;
                border-radius: 25px;
            }
    
            .bio {
                width: 80%;
                margin: 0 auto;
                border: 2px solid ${answers.color};
                border-radius: 25px;
                text-align: center;
            }
    
            .wrapper {
                margin: 0 auto;
                width: 48%;
                text-align: center;
            }
    
            .topText {
                background-color: ${answers.color};
                border: 2px solid black;
                border-top-left-radius: 25px;
                border-top-right-radius: 25px;
                text-align: center;
                font-size: 26px;
                font-weight: bold;
                margin-bottom: 0;
                width: 250px;
            }
    
            .bottomText {
                border: 2px solid black;
                border-bottom-left-radius: 25px;
                border-bottom-right-radius: 25px;
                text-align: center;
                font-size: 20px;
                margin-top: 0;
            }
    
            .parent {
                margin-right: 10px;
                display: inline-block;
                width: 48%;
            }
    
            .child {
                display: inline-block;
                margin-right: 5px;
            }
    
            a {
                color: black;
            }
        </style>
        <script src="https://kit.fontawesome.com/78debb8d07.js" crossorigin="anonymous"></script>
    </head>
    
    <body>
    
        <body>
            <div class="backgroundCard">
                <div class="bigCard">
                    <img class="profileImg" src="${githubResponse.avatar_url}" alt="" height="190px" width="200px">
                    <h1>Hello, My Name is ${answers.username}</h1>
                    <h3>Current at: </h3>
                    <h4>
                        <a href="https://www.google.com/maps/search/?api=1&query=${githubResponse.location}"><i class="fas fa-globe-americas"></i>  Location   </a>
                        <a href="${githubResponse.html_url}"><i class="fab fa-github"></i>  GitHub   </a>
                        <a href="${githubResponse.blog}"><i class="fas fa-rss"></i>  Blog</a>
                    </h4>
                    <!-- Main header line -->
                </div>
            </div>
    
            <div class="bio">
                <h4>${githubResponse.bio}</h4>
            </div>
    
            <!-- 2 Boxes to put info in 1st Row -->
            <div class="wrapper">
                <div class="parent">
                    <div class="child">
                        <p class="topText">Public Repositories</p>
                        <p class="bottomText">${githubResponse.public_repos}</p>
                    </div>
                </div>
                <div class="parent">
                    <div class="child">
                        <p class="topText">Followers</p>
                        <p class="bottomText">${githubResponse.followers}</p>
                    </div>
                </div>
            </div>
            <div class="wrapper">
                <div class="parent">
                    <div class="child">
                        <p class="topText">Git Hub Stars</p>
                        <p class="bottomText">${starCount}</p>
                    </div>
                </div>
                <div class="parent">
                    <div class="child">
                        <p class="topText">Following</p>
                        <p class="bottomText">${githubResponse.following}</p>
                    </div>
                </div>
            </div>
        </body>
    </body>
    
    </html>`
}
