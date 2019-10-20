/* 



    ./js/exec.js
    * exec zabbix api *

    
 */
"use strict";

/*

    exec zabbix api

*/
var exec = {
    requestAPI: function (url, user, password, method, params, $request, $response) {
        //  init
        $request.value = "..............";
        $response.value = "..............";

        //  view request
        $request.value = JSON.stringify({
            "jsonrpc": "2.0",
            "method": method,
            "params": params,
            "id": "*",
            "auth": "********"
        });

        // get ZabbixAPI result JSON
        zabbixAPI.login(url, user, password)
        .then(function (response) {
            return zabbixAPI.request(url, method, params, response.auth);
        })
        .then(function (response) {
            $response.value = JSON.stringify(response.result, null, '\t');
            return zabbixAPI.logout(url, response.auth);
        })
        .catch(function (err) {
            $response.value = $response.value + "\n" + JSON.stringify(err, null, '\t');
        });
    }
};