/* 



    api.js


    
 */
"use strict";


function requestZabbixAPIsync(url, method, params, auth) {  /* sync function */
    let request = {
        "jsonrpc": "2.0",
        "method": method,
        "params": params,
        "id": 1
    };
    if (auth) {
        request["auth"] = auth;
    } else {
        request.id = 2;
    }

    var result = false;
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, false); // sync
    xhr.setRequestHeader('Content-Type', "application/json-rpc");

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                result = JSON.parse(xhr.responseText).result;
            }
            xhr = null;
        }
    };

    xhr.send(JSON.stringify(request));
    return result;
}


function requestZabbixUserLogin(url, user, password) {
    return requestZabbixAPIsync(url, "user.login", { "user": user, "password": password }, false);
}


function requestZabbixAPI(url, user, password, method, params) {
    let auth = requestZabbixUserLogin(url, user, password);
    return requestZabbixAPIsync(url, method, params, auth);
}
