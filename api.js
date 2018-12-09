/* 



    api.js
    * request zabbix api *

    
 */
"use strict";


/*

    request ZabbixAPI

*/
function requestZabbixAPI(url, method, params, auth) {
    //  make request body
    var request = {
        "jsonrpc": "2.0",
        "method": method,
        "params": params,
        "id": 1,
        "auth": null
    };
    if (auth) {
        request.auth = auth;
        request.id = 2;
    }
    //  Wrap XMLHttpRequest with 'Promise'
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.setRequestHeader('Content-Type', "application/json-rpc");
        xhr.onload = function () {
            if (request.status === 200) {
                resolve(JSON.parse(xhr.responseText).result);
            } else {
                reject(Error('error code: ' + xhr.statusText));
            }
        };
        xhr.onerror = function () {
           reject(Error('network error'));
        };
        xhr.send(JSON.stringify(request));
    });
}

/*

    get ZabbixAPI

*/
function getZabbixAPI(url, user, password, method, params) {
    return new Promise(function (resolve, reject) {
        requestZabbixAPI(url, "user.login", { "user": user, "password": password }, false)
            .then(function (result) {
                resolve(requestZabbixAPI(url, method, params, result));
            })
            .catch(function (error) {
                reject(error);
            });
    });
}