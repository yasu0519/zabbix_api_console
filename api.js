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
        "id": 1
        //"auth": null
    };
    if (auth) {
        request['auth'] = auth;
        request.id = 2;
    }
    //  Wrap XMLHttpRequest with 'Promise'
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.setRequestHeader('Content-Type', "application/json-rpc");
        xhr.onload = function () {
            if (xhr.status === 200) {
                resolve(JSON.parse(xhr.responseText).result);
            } else {
                reject({
                    "jsonrpc": "2.0",
                    "error": {
                        "code": xhr.status,
                        "message": xhr.statusText,
                        "data": "XMLHttpRequest error."
                    },
                    "id": request.id
                });
            }
        };
        xhr.onerror = function () {
            reject({
                "jsonrpc": "2.0",
                "error": {
                    "code": xhr.status,
                    "message": "An error occurred during the transaction",
                    "data": "XMLHttpRequest error."
                },
                "id": request.id
            });
        };
        xhr.send(JSON.stringify(request));
    });
}

/*

    get ZabbixAPI

*/
function getZabbixAPI(url, user, password, method, params) {
    return requestZabbixAPI(url, "user.login", { "user": user, "password": password }, false)
        .then(function (auth) {
            return requestZabbixAPI(url, method, params, auth);
        })
        .then(function(result){
            console.log(result);
            return result;
        })
        .catch(function (err) {
            console.log(err);
            return err;
        });
}