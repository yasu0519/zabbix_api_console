/* 



    api.js
    * request zabbix api *

    
 */
"use strict";

/*

    request ZabbixAPI

*/
var zabbixAPI = {

    request: function (url, method, params, auth) {

        //  Wrap XMLHttpRequest with 'Promise'
        return new Promise(function (resolve, reject) {
    
            //  make request body
            var request = {
                "jsonrpc": "2.0",
                "method": method,
                "params": params,
                "id": 1
            };
            if (auth) {
                request['auth'] = auth;
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

            //  request
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
                        resolve({ "result": json.result, "auth": ( (method == 'user.login')? json.result : auth ) });
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
    },


    login: function (url, user, password) {
        return zabbixAPI.request(url, "user.login", { "user": user, "password": password }, false);
    },


    logout: function (url, auth) {
        return zabbixAPI.request(url, "user.logout", {}, auth);
    }

};
