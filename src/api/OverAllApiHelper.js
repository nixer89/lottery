'use strict';

var nodeFetch = require('node-fetch');
var LOTTOLAND_API_URL = "https://lottoland.com/api/drawings";

function OverAllApiHelper() {}

function invokeBackend(url) {
    return nodeFetch(url)
        .then(function(res) {
            return res.json();
        }).catch(function(err) {
        console.log(err);
    });
};

OverAllApiHelper.prototype.getAllDrawings() =function() {
    return invokeBackend(LOTTOLAND_API_URL).then(function(json){
        if(json) {
            return json;
        }
    }).catch(function(err) {
        console.log(err);
    });
};

module.exports = OverAllApiHelper;