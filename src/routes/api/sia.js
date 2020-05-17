const FormData = require("form-data")
const fs = require("fs")
const axios = require("axios")
const siaUrl = "https://siasky.net/skynet/skyfile"

const getSkylink = async (str) => {
    var skylink = str;

    const formData = new FormData();

    // the following line should be replaced with a stream from the 
    // coverImage or icon 
    formData.append("file", fs.createReadStream('./people.png') );
    
    await new Promise((resolve, reject) => {
      axios
        .post(siaUrl, formData, { headers: formData.getHeaders() })
        .then((resp) => {
          resolve(`sia://${resp.data.skylink}`);
          skylink = resp.data.skylink;
          console.log('BPS: Value of skylink: ' + skylink );
        })
        .catch((error) => {
          console.log('error in saving file in sia ');
          reject(error);
        });
    });
  
    return skylink;
  }

  module.exports = { getSkylink };