/* 



    zabbix api console
    index.js


 */
"use strict";



function authJSONRPC(user, password) {
    return {
        "jsonrpc": "2.0",
        "method": "user.login",
        "params": {
            "user": user,
            "password": password
        },
        "id": 1
    };
}



function requestZabbixAPI(url, user, password, method, params, successHandler, errorHandler) {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                var respons = JSON.parse(xhr.responseText);
                
                let request = {
                    "jsonrpc": "2.0",
                    "method": method,
                    "params": params,
                    "id": respons.id + 1,
                    "auth": respons.result
                };

                var x = new XMLHttpRequest();

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

                x.open("POST", url, true);
                x.setRequestHeader('Content-Type', "application/json-rpc");
                x.send(JSON.stringify(request));

            } else {
                errorHandler({ "error": xhr.status });
            }
            xhr = null;
        }
    };

    xhr.open("POST", url, true);
    xhr.setRequestHeader('Content-Type', "application/json-rpc");
    xhr.send(JSON.stringify(authJSONRPC(user, password)));
}



/*


    main


*/


//  default input
document.getElementById('url').value = "http://0.0.0.0/api_jsonrpc.php";
document.getElementById('user').value = "Admin";
document.getElementById('password').value = "zabbix";
document.getElementById('method').value = "template.get";
document.getElementById('params').value = JSON.stringify({
    "output": "extend",
    "filter": {
        "host": [
            "Template OS Linux",
            "Template OS Windows"
        ]
    }
});


document.getElementById('get').addEventListener("click", function(){
    requestZabbixAPI(
        document.getElementById('url').value,
        document.getElementById('user').value,
        document.getElementById('password').value,
        document.getElementById('method').value,
        JSON.parse(document.getElementById('params').value),
        /* successHandler */
        function (response) {
            document.getElementById('response-json').value = JSON.stringify(response);
            console.log(response);
        },
        /* errorHandler */
        function (response) {
            //JSON.stringify(document.getElementById('response-table'));
            document.getElementById('response-json').value = JSON.stringify(response);
            console.log(response);
        }
    );
}, false);
