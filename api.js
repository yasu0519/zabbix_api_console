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
    };
    if (auth) {
        request['auth'] = auth;
        request.id = 2;
    }

    //  reject error JSON
    var errJSON = {
        "jsonrpc": "2.0",
        "error": {
            "code": "",
            "message": "",
            "data": "XMLHttpRequest error."
        },
        "id": request.id
    };

    //  Wrap XMLHttpRequest with 'Promise'
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.setRequestHeader('Content-Type', "application/json-rpc");
        xhr.onload = function () {
            if (xhr.status === 200) {
                let json = JSON.parse(xhr.responseText);
                // api error
                if (json.hasOwnProperty('error')) {
                    reject(json);
                } else {
                    resolve(json.result);
                }
            } else {
                errJSON.error.code = xhr.status;
                errJSON.error.message = xhr.statusText;
                reject(errJSON);
            }
        };
        xhr.onerror = function () {
            errJSON.error.code = xhr.status;
            errJSON.error.message = "An error occurred during the transaction";
            reject(errJSON);
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
        });
}