/* 



    api.js


    
 */
"use strict";


function requestZabbixAPI(url, user, password, method, params, successHandler, errorHandler) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader('Content-Type', "application/json-rpc");

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                var x = new XMLHttpRequest();
                x.open("POST", url, true);
                x.setRequestHeader('Content-Type', "application/json-rpc");

                x.onreadystatechange = function() {
                    if (x.readyState == 4) {
                        if (x.status == 200) {
                            successHandler(JSON.parse(x.responseText));
                        } else {
                            errorHandler({ "error": x.status });
                        }
                        x = null;
                    }
                };

                var respons = JSON.parse(xhr.responseText);
                let request = {
                    "jsonrpc": "2.0",
                    "method": method,
                    "params": params,
                    "id": respons.id + 1,
                    "auth": respons.result
                };
                x.send(JSON.stringify(request));

            } else {
                errorHandler({ "error": xhr.status });
            }
            xhr = null;
        }
    };

    let request = {
        "jsonrpc": "2.0",
        "method": "user.login",
        "params": {
            "user": user,
            "password": password
        },
        "id": 1
    };
    xhr.send(JSON.stringify(request));
}
