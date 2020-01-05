/* 



    ./js/table.js
    * view table of zabbix element. *

    
 */
"use strict";

/*

    utilities

 */
/*
    unique Array
 */
function uniq(arr) {
    var o = {};
    var a = [];
    for (var i = 0; i < arr.length; i++) {
        if (!(arr[i] in o)) {
            o[arr[i]] = true;
            a[a.length] = arr[i];
        }
    }
    return a;
}
/*
    array Sort Unique
 */
function sortUniq(arr) {
    var a = arr.concat();
    if (arguments.length > 1) {
        a.sort(arguments[1]);    // sort function
    } else {
        a.sort();
    }
    return uniq(a);
}
/*
    join array
 */
function joinArray(arr, key) {
    return arr.map(function (a) { return a[key]; }).join(', ');
}
/*
    timestamp to string
 */
function timestampToString(timestamp) {
    //  zero padding
    let pad = function(num){
        return ('0' + num).slice(-2);
    };
    var t = parseInt(timestamp, 10);
    // NaN or 0以下なら空文字を返却
    if ( Number.isNaN(t) || (t <= 0) ) {
        return "";
    }
    //  timestamp は unixtime、Dateはミリ秒なので1000倍が必要
    var d = new Date(t * 1000);
    var yyyy = d.getFullYear();
    var mm = pad(d.getMonth()+1);
    var dd = pad(d.getDate());
    var hh = pad(d.getHours());
    var min = pad(d.getMinutes());
    var ss = pad(d.getSeconds());
    return [yyyy,mm,dd].join('/') + ' ' + [hh,min,ss].join(':');
}

/*
    Deep Clone Object
 */
function deepClone(obj) {
    return JSON.parse( JSON.stringify(obj) );
}

/*
    markup table
*/
function markupTable(arr) {
    //  markup
    var $ = function (tag, value) {
        let $tag = document.createElement(tag);
        if (arguments.length >= 2) {
            $tag.innerHTML = value;
        }
        return $tag;
    };
    var $table = $('table');
    let $caption = $('caption', arr.length + " items, " + (new Date()).toString());
    let $thead = $('thead');
    var $tr = $('tr');
    Object.keys(arr[0]).forEach(function (v) {
        if (v == "matrix_items") {
            Object.keys(arr[0].matrix_items).forEach(function (m) {
                $tr.appendChild($('th', '<div>' + m + '</div>'));
            });
        }
        else {
            $tr.appendChild($('th', v));
        }
    });
    $thead.appendChild($tr);

    //  markup tbody
    var $tbody = $('tbody');
    arr.forEach(function (r) {
        var $tr = $('tr');
        Object.keys(r).forEach(function (v) {
            if (v == "matrix_items") {
                Object.keys(r.matrix_items).forEach(function (m) {
                    if (typeof r.matrix_items[m] === 'boolean') {
                        $tr.appendChild($('td', (r.matrix_items[m]) ? "●" : ""));
                    } else {
                        $tr.appendChild($('td', r.matrix_items[m]));
                    }
                });
            }
            else {
                $tr.appendChild($('td', r[v]));
            }
        });
        $tbody.appendChild($tr);
    });
    $table.appendChild($caption);
    $table.appendChild($thead);
    $table.appendChild($tbody);
    return $table;
}

/*
    view lists
*/
function viewLists(name, method, params, toTable) {
    document.getElementById(name).addEventListener("click", function () {
        $table_result.innerHTML = "<h3>" + ".........." + "</h3>";

        // get ZabbixAPI result JSON
        zabbixAPI.login($url.value, $user.value, $password.value)
        .then(function (response) {
            return zabbixAPI.request($url.value, method, params, response.auth);
        })
        .then(function (response) {
            $table_result.innerHTML = "<h3>" + name + "</h3>";
            $table_result.appendChild( markupTable( toTable(response.result) ) );
            return zabbixAPI.logout($url.value, response.auth);
        })
        .catch(function (err) {
            $table_result.innerHTML = JSON.stringify(err, null, '\t') + $table_result.innerHTML;
        });

    }, false);
}

/*

    host groups

 */
viewLists(
    "hostgroups",
    "hostgroup.get",
    {
        "output": ["groupid", "name", "flags", "internal"],
        "selectHosts": ["hostid", "host"],
        "selectTemplates": ["templateid", "host"]
    },
    function (groups) {
        return groups.map(function (g) {
            return {
                'groupid': g.groupid,
                'name': g.name,
                'flags': GROUP_FLAGS[Number(g.flags)],
                'internal': GROUP_INTERNAL[Number(g.internal)],
                'hosts': joinArray(g.hosts, "host"),
                'templates': joinArray(g.templates, "host")
            };
        });
    }
);

/* 

    hosts

 */
viewLists(
    "hosts",
    "host.get",
    {
        "output": ["hostid", "host", "description", "status"],
        "selectInterfaces": ["interfaceid", "ip"],
        "selectMacros": ["hostmacroid", "macro", "value"],
        "selectGroups": ["groupid", "name"],
        "selectParentTemplates": ["templateid", "host"],
        "selectItems": ["itemid"],
        "selectTriggers": ["triggerid"]
    },
    function (hosts) {
        return hosts.map(function (h) {
            return {
                'hostid': h.hostid,
                'host': h.host,
                'interfaces': joinArray(h.interfaces, "ip"),
                'macros': h.macros.map(function (a) { return a.macro + "=" + a.value; }).join(', '),
                'description': h.description,
                'groups': joinArray(h.groups, "name"),
                'templates': joinArray(h.parentTemplates, "host"),
                'items': joinArray(h.items, "itemid"),
                'triggers': joinArray(h.triggers, "triggerid"),
                'status': STATUS[Number(h.status)]
            };
        });
    }
);

/*

    templates

 */
viewLists(
    "templates",
    "template.get",
    {
        "output": ["templateid", "host", "name", "description"],
        "selectGroups": ["groupid", "name"],
        "selectHosts": ["hostid", "host"],
        "selectTemplates": ["templateid", "host"],
        "selectParentTemplates": ["templateid", "host"],
        "selectItems": ["itemid"],
        "selectTriggers": ["triggerid"]
    },
    function (templates) {
        return templates.map(function (t) {
            return {
                'templateid': t.templateid,
                'template name': t.host,
                'visible name': t.name,
                'description': t.description,
                'groups': joinArray(t.groups, "name"),
                'hosts': joinArray(t.hosts, "host"),
                'templates': joinArray(t.templates, "host"),
                'parentTemplates': joinArray(t.parentTemplates, "host"),
                'items': joinArray(t.items, "itemid"),
                'triggers': joinArray(t.triggers, "triggerid")
            };
        });
    }
);

/*

    items

 */
viewLists(
    "items",
    "item.get",
    {
        "output": [ "itemid", "name", "type", "key_", "delay", "history", "trends", "hostid", "templateid", "status", "state", "lastclock", "lastvalue" ],
        "selectApplications": ["applicationid", "name"]
    },
    function (items) {
        return items.map(function (i) {
            return {
                'itemid': i.itemid,
                'item name': i.name,
                'type': ITEM_TYPE[Number(i.type)],
                'key': i.key_,
                'interval': i.delay,
                'history': i.history,
                'trends': i.trends,
                'application': joinArray(i.applications, "name"),
                'hostid': i.hostid,
                'templateid': i.templateid,
                'status': STATUS[Number(i.status)],
                'state': ITEM_STATE[Number(i.state)],
                'lastclock': timestampToString(i.lastclock),
                'lastvalue': i.lastvalue
            };
        });
    }
);

/*

    triggers

 */
viewLists(
    "triggers",
    "trigger.get",
    {
        "output": ["triggerid", "description", "priority", "expression", "recovery_expression", "templateid", "state", "status"],
        "expandExpression": true,
        "selectHosts": ["hostid"]
    },
    function (triggers) {
        return triggers.map(function (t) {
            return {
                'triggerid': t.triggerid,
                'name': t.description,
                'severity': TRIGGER_SEVERITY[Number(t.priority)],
                //'problem expression': t.expression.replace(/\{.*?\:/g, '{'),
                //'recovery expression': t.recovery_expression.replace(/\{.*?\:/g, '{'),
                'problem expression': t.expression,
                'recovery expression': t.recovery_expression,
                'hostid': joinArray(t.hosts, "hostid"),
                'templateid': t.templateid,
                'state': TRIGGER_STATE[Number(t.state)],
                'status': STATUS[Number(t.status)]
            };
        });
    }
);

/*

    macros

 */
viewLists(
    "macros",
    "usermacro.get",
    {
        "output": ["hostmacroid", "macro", "value"],
        "selectHosts":["hostid"],
        "selectTemplates":["templateid"]
    },
    function (macros) {
        return macros.map(function (m) {
            return {
                'hostmacroid': m.hostmacroid,
                'macro': m.macro,
                'value': m.value,
                'hostid': joinArray(m.hosts, "hostid"),
                'templateid': joinArray(m.templates, "templateid")
            };
        });
    }
);

/*

    items of template

 */
viewLists(
    "items_of_template",
    "template.get",
    {
        "output": ["templateid", "host"],
        "with_items": true,
        "selectItems": ["itemid", "name", "type", "key_", "delay", "history", "trends", "status"]
    },
    function (templates) {
        var arr = [];
        templates.forEach(function (template) {
            let a = template.items.map(function (i) {
                return {
                    'template': template.host,
                    'itemid': i.itemid,
                    'item name': i.name,
                    'type': ITEM_TYPE[Number(i.type)],
                    'key': i.key_,
                    'interval': i.delay,
                    'history': i.history,
                    'trends': i.trends,
                    'status': STATUS[Number(i.status)]
                };
            });
            arr = arr.concat(a);
        });
        return arr;
    }
);

/* 

    items of host

 */
viewLists(
    "items_of_host",
    "host.get",
    {
        "output": ["hostid", "host"],
        "with_items": true,
        "selectItems": ["itemid", "name", "type", "key_", "delay", "history", "trends", "status", "state", "lastclock", "lastvalue"]
    },
    function (hosts) {
        var arr = [];
        hosts.forEach(function (host) {
            let a = host.items.map(function (i) {
                return {
                    'host': host.host,
                    'itemid': i.itemid,
                    'item name': i.name,
                    'type': ITEM_TYPE[Number(i.type)],
                    'key': i.key_,
                    'interval': i.delay,
                    'history': i.history,
                    'trends': i.trends,
                    'status': STATUS[Number(i.status)],
                    'state': ITEM_STATE[Number(i.state)],
                    'lastclock': timestampToString(i.lastclock),
                    'lastvalue': i.lastvalue
                };
            });
            arr = arr.concat(a);
        });
        return arr;
    }
);

/*

    triggers of template

 */
viewLists(
    "triggers_of_template",
    "template.get",
    {
        "output": ["templateid", "host"],
        "with_triggers": true,
        "selectTriggers": ["triggerid", "description", "priority", "expression", "recovery_expression", "status"]
    },
    function (templates) {
        var arr = [];
        templates.forEach(function (template) {
            let a = template.triggers.map(function (t) {
                return {
                    'template': template.host,
                    'triggerid': t.triggerid,
                    'name': t.description,
                    'severity': TRIGGER_SEVERITY[Number(t.priority)],
                    'problem expression': t.expression,
                    'recovery expression': t.recovery_expression,
                    'status': STATUS[Number(t.status)]
                };
            });
            arr = arr.concat(a);
        });
        return arr;
    }
);

/*

    triggers of host

 */
viewLists(
    "triggers_of_host",
    "host.get",
    {
        "output": ["hostid", "host"],
        "with_triggers": true,
        "selectTriggers": ["triggerid", "description", "priority", "expression", "recovery_expression", "state", "status"]
    },
    function (hosts) {
        var arr = [];
        hosts.forEach(function (host) {
            let a = host.triggers.map(function (t) {
                return {
                    'host': host.host,
                    'triggerid': t.triggerid,
                    'name': t.description,
                    'severity': TRIGGER_SEVERITY[Number(t.priority)],
                    'problem expression': t.expression,
                    'recovery expression': t.recovery_expression,
                    'state': TRIGGER_STATE[Number(t.state)],
                    'status': STATUS[Number(t.status)]
                };
            });
            arr = arr.concat(a);
        });
        return arr;
    }
);

/*

   view hosts Of templates matrix

*/
var hostsOfTemplatesMatrix = {
    requestAPI: function(url, user, password, $output) {
        var method = "template.get";
        var params = { 
            "output": ["templateid", "host", "name", "description"],
            "selectHosts": ["hostid", "host"],
            "selectParentTemplates": ["templateid"]
        };
        var arr = [];

        $output.innerHTML = "<h3>" + ".........." + "</h3>";

        // get ZabbixAPI result JSON
        zabbixAPI.login(url, user, password)
        .then(function (response) {
            return zabbixAPI.request(url, method, params, response.auth);
        })
        .then(function (response) {
            hostsOfTemplatesMatrix.viewTable("hosts Of templates matrix", hostsOfTemplatesMatrix.makeTable(response.result), $output);    
            return zabbixAPI.logout($url.value, response.auth);
        })
        .catch(function (err) {
            $output = $output + "\n" + JSON.stringify(err, null, '\t');
        });
    },
    
    makeTable: function(templates) {
        var hosts = [];
        var templateids = [];
        var template_host = [];
    
        //  set array
        templates.forEach(function(t){
            t.hosts.forEach(function(h){
                //  add hosts
                hosts[hosts.length] = h.host;
                //  add templateids
                templateids[templateids.length] = t.templateid;
                //  add template_host
                template_host[template_host.length] = {"templateid": t.templateid, "host": h.host };
    
                t.parentTemplates.forEach(function(p){
                    //  add templateids
                    templateids[templateids.length] = p.templateid;
                    //  add template_host
                    template_host[template_host.length] = {"templateid": p.templateid, "host": h.host };
                });
            });
        });

        //  sort uniq
        hosts = sortUniq(hosts);
        templateids = sortUniq(templateids);

        //  make matrix
        var matrix_items = {}; 
        hosts.forEach(function(host){
            matrix_items[host] = false;
        });

        var arr = [];
        templateids.forEach(function(id, i){
            var o = templates.find(function(t){
                return (t.templateid == id);
            });
            arr[i] = { "templateid": id, "template name": o.host, "visible name": o.name, "matrix_items": deepClone(matrix_items) };
            template_host.filter(function(t){ return (t.templateid == id); }).forEach(function(t){
                arr[i].matrix_items[t.host] = true;
            });
        });

        return arr;
    },

    viewTable:  function(tableName, table, $output) {
        $output.innerHTML = "<h3>" + tableName + "</h3>";
        $output.appendChild(markupTable(table));
    }
};

/*

   view monitoring matrix

*/
var monitoringMatrix = {
    requestAPI: function(url, user, password, $output) {
        //  API
        var templates = {
            method: "template.get",
            params: { 
                "output": ["templateid", "host", "name", "description"],
                "selectHosts": ["hostid", "host", "status"],
                "selectItems":["itemid", "name", "status"],
                "selectTriggers":["triggerid", "description", "status"],
                "selectParentTemplates": ["templateid"]
            },
            response: {}
        };
        var items = {
            method: "item.get",
            params: { 
                "output": ["itemid", "name", "status"],
                "selectTriggers": ["triggerid", "description", "status"]
            },
            response: {}
        };

        // clear
        $output.innerHTML = "<h3>" + ".........." + "</h3>";

        // get ZabbixAPI result JSON
        zabbixAPI.login(url, user, password)
        .then(function (response) {
            return zabbixAPI.request(url, templates.method, templates.params, response.auth);
        })
        .then(function (response) {
            templates.response = response;

            //  make items from templates
            var arr = [];
            response.result.forEach(function(t){
                t.items.forEach(function(i){
                    arr[arr.length] = i.itemid;
                });
            });
            items.params["itemids"] = arr;

            //  request items
            return zabbixAPI.request(url, items.method, items.params, response.auth);
        })
        .then(function (response) {
            items.response = response;
            monitoringMatrix.viewTable("monitoring matrix", monitoringMatrix.makeTable(templates.response.result, items.response.result), $output);    
            return zabbixAPI.logout($url.value, response.auth);
        })
        .catch(function (err) {
            $output = $output + "\n" + JSON.stringify(err, null, '\t');
        });
    },
    
    makeTable: function(templates, items) {
        var hosts = [];
        var templateids = [];
        var template_host = [];

        //  do items link to triggers?
        function linkTrigger(itemid) {
            var o = items.find(function(i){
                return (i.itemid == itemid);
            });

            if ( o === undefined ) {
                return false;
            } else {
                //  exists enable trigger
                return ( o.triggers.filter(function(t){ return (t.status == "0"); }).length > 0 );
            }
        }

        //  set array
        templates.forEach(function(t){
            t.hosts.forEach(function(h){
                //  add hosts
                hosts[hosts.length] = h.host;
                //  add templateids
                templateids[templateids.length] = t.templateid;
                //  add template_host
                template_host[template_host.length] = {"templateid": t.templateid, "host": h.host };

                t.parentTemplates.forEach(function(p){
                    //  add templateids
                    templateids[templateids.length] = p.templateid;
                    //  add template_host
                    template_host[template_host.length] = {"templateid": p.templateid, "host": h.host };
                });
            });
        });

        //  sort uniq
        hosts = sortUniq(hosts);
        templateids = sortUniq(templateids);

        //  make matrix
        var matrix_items = {}; 
        hosts.forEach(function(host){
            matrix_items[host] = false;
        });

        var arr = [];
        templateids.forEach(function(id){
            var o = templates.find(function(t){
                return (t.templateid == id);
            });
            
            var matrix = { "templateid": id, "template name": o.host, "visible name": o.name, "matrix_items": deepClone(matrix_items) };
            template_host.filter(function(t){ return (t.templateid == id); }).forEach(function(t){
                matrix.matrix_items[t.host] = true;
            });
            
            if ( o.items.length > 0 ) {
                //  item onlys
                o.items.filter(function(i){
                    return ( linkTrigger(i.itemid) == false );
                }).forEach(function(i){
                    arr[arr.length] = Object.assign( { "item only": "item only", "itemid/triggerid": i.itemid, "name": i.name, "status": STATUS[i.status] }, deepClone(matrix) );
                });
                //  enable triggers
                o.triggers.filter(function(t){
                    
                    return ( t.status == "0" );
                }).forEach(function(t){
                    arr[arr.length] = Object.assign( { "item only": "", "itemid/triggerid": t.triggerid, "name": t.description, "status": STATUS[t.status] }, deepClone(matrix) );
                });
            } else {
                arr[arr.length] = Object.assign( { "item only": "", "itemid/triggerid": "", "name": "", "status": STATUS[0] }, deepClone(matrix) );
            }
        });

        //  sort template name > itemid/trigger name
        arr.sort(function(a,b){
            if (a["template name"] < b["template name"]) { return -1; }
            if (a["template name"] > b["template name"]) { return 1; }
            if (a.name < b.name) { return -1; }
            if (a.name > b.name) { return 1; }
            return 0;
        });

        return arr;
    },

    viewTable:  function (tableName, table, $output) {
        $output.innerHTML = "<h3>" + tableName + "</h3>";
        $output.appendChild(markupTable(table));
    }
};

/*

   view hosts of groups matrix

*/
var hostsOfGroupsMatrix = {
    requestAPI: function(url, user, password, $output) {
        //  API
        var hostgroups = {
            method: "hostgroup.get",
            params:     {
                "output": ["groupid", "name", "flags", "internal"],
                "selectHosts": ["hostid", "host", "description", "status"]
                // "selectTemplates": ["templateid", "host", "name"]
            }
        };

        // clear
        $output.innerHTML = "<h3>" + ".........." + "</h3>";

        // get ZabbixAPI result JSON
        zabbixAPI.login(url, user, password)
        .then(function (response) {
            return zabbixAPI.request(url, hostgroups.method, hostgroups.params, response.auth);
        })
        .then(function (response) {
            hostsOfGroupsMatrix.viewTable("hosts of groups matrix", hostsOfGroupsMatrix.makeTable(response.result), $output);    
            return zabbixAPI.logout($url.value, response.auth);
        })
        .catch(function (err) {
            $output = $output + "\n" + JSON.stringify(err, null, '\t');
        });
    },
    
    makeTable: function(hostgroups) {
        var hosts = [];
        var groupids = [];
        var group_host = [];

        //  set array
        hostgroups.forEach(function(g){
            //  add groupids
            groupids[groupids.length] = g.groupid;
            //  no hosts
            if ( g.hosts.length == 0 ) {
                group_host[group_host.length] = { "groupid": g.groupid, "name": g.name, "host": "" };
            }
            //  include hosts
            g.hosts.forEach(function(h){
                let hostname = h.host + ( (h.status == "0")? "" : "(disable)" );
                //  add hosts
                hosts[hosts.length] = hostname;
                //  add group_host
                group_host[group_host.length] = { "groupid": g.groupid, "name": g.name, "host": hostname };
            });
        });

        //  sort uniq
        hosts = sortUniq(hosts);
        groupids = sortUniq(groupids);

        //  make matrix
        var matrix_items = {}; 
        hosts.forEach(function(host){
            matrix_items[host] = false;
        });

        var arr = [];
        groupids.forEach(function(id){
            var o = hostgroups.find(function(g){
                return (g.groupid == id);
            });
            
            var matrix = { "groupid": id, "name": o.name, "matrix_items": deepClone(matrix_items) };
            group_host.filter(function(g){ return (g.groupid == id); }).forEach(function(g){
                if ( g.host !== "" ) {
                    matrix.matrix_items[g.host] = true;
                }
            });
            arr[arr.length] = deepClone(matrix);
        });

        //  sort group name
        arr.sort(function(a,b){
            if (a.name < b.name) {
                return -1;
            }
            if (a.name > b.name) {
                return 1;
            }
            return 0;
        });

        return arr;
    },

    viewTable:  function (tableName, table, $output) {
        $output.innerHTML = "<h3>" + tableName + "</h3>";
        $output.appendChild(markupTable(table));
    }
};

/*

   view templates of groups matrix

*/
var templatesOfGroupsMatrix = {
    requestAPI: function(url, user, password, $output) {
        //  API
        var hostgroups = {
            method: "hostgroup.get",
            params:     {
                "output": ["groupid", "name", "flags", "internal"],
                "selectTemplates": ["templateid", "host", "name"]
            }
        };

        // clear
        $output.innerHTML = "<h3>" + ".........." + "</h3>";

        // get ZabbixAPI result JSON
        zabbixAPI.login(url, user, password)
        .then(function (response) {
            return zabbixAPI.request(url, hostgroups.method, hostgroups.params, response.auth);
        })
        .then(function (response) {
            templatesOfGroupsMatrix.viewTable("templates of groups matrix", templatesOfGroupsMatrix.makeTable(response.result), $output);    
            return zabbixAPI.logout($url.value, response.auth);
        })
        .catch(function (err) {
            $output = $output + "\n" + JSON.stringify(err, null, '\t');
        });
    },
    
    makeTable: function(hostgroups) {
        var templates = [];
        var groupids = [];
        var group_template = [];

        //  set array
        hostgroups.forEach(function(g){
            //  add groupids
            groupids[groupids.length] = g.groupid;
            //  no templates
            if ( g.templates.length == 0 ) {
                group_template[group_template.length] = { "groupid": g.groupid, "name": g.name, "template": "" };
            }
            //  include templates
            g.templates.forEach(function(t){
                //  add templates
                templates[templates.length] = t.host;
                //  add group_host
                group_template[group_template.length] = { "groupid": g.groupid, "name": g.name, "template": t.host };
            });
        });

        //  sort uniq
        templates = sortUniq(templates);
        groupids = sortUniq(groupids);

        //  make matrix
        var matrix_items = {}; 
        templates.forEach(function(t){
            matrix_items[t] = false;
        });

        var arr = [];
        groupids.forEach(function(id){
            var o = hostgroups.find(function(g){
                return (g.groupid == id);
            });
            
            var matrix = { "groupid": id, "name": o.name, "matrix_items": deepClone(matrix_items) };
            group_template.filter(function(g){ return (g.groupid == id); }).forEach(function(g){
                if ( g.template !== "" ) {
                    matrix.matrix_items[g.template] = true;
                }
            });
            arr[arr.length] = deepClone(matrix);
        });

        //  sort group name
        arr.sort(function(a,b){
            if (a.name < b.name) {
                return -1;
            }
            if (a.name > b.name) {
                return 1;
            }
            return 0;
        });

        return arr;
    },

    viewTable:  function (tableName, table, $output) {
        $output.innerHTML = "<h3>" + tableName + "</h3>";
        $output.appendChild(markupTable(table));
    }
};

/*

   view hosts of macros matrix

*/
var hostsOfMacrosMatrix = {
    requestAPI: function(url, user, password, $output) {
        //  API
        var macros = {
            method: "usermacro.get",
            params:     {
                "output": ["hostmacroid", "macro", "value"],
                "selectHosts": ["hostid", "host", "description", "status"]
            }
        };

        // clear
        $output.innerHTML = "<h3>" + ".........." + "</h3>";

        // get ZabbixAPI result JSON
        zabbixAPI.login(url, user, password)
        .then(function (response) {
            return zabbixAPI.request(url, macros.method, macros.params, response.auth);
        })
        .then(function (response) {
            hostsOfMacrosMatrix.viewTable("hosts of macros matrix", hostsOfMacrosMatrix.makeTable(response.result), $output);    
            return zabbixAPI.logout($url.value, response.auth);
        })
        .catch(function (err) {
            $output = $output + "\n" + JSON.stringify(err, null, '\t');
        });
    },

    makeTable: function(macros) {
        var hosts = [];
        var macroids = [];
        var macro_host = [];

        //  set array
        macros.forEach(function(m){
            //  include hosts
            m.hosts.forEach(function(h){
                //  add hosts
                hosts[hosts.length] = h.host;
                //  add macroids
                macroids[macroids.length] = m.hostmacroid;
                //  add macro_host
                macro_host[macro_host.length] = { "macroid": m.hostmacroid, "host": h.host };
            });
        });

        //  sort uniq
        hosts = sortUniq(hosts);
        macroids = sortUniq(macroids);

        //  make matrix
        var matrix_items = {}; 
        hosts.forEach(function(h){
            matrix_items[h] = "";
        });

        var arr = [];
        macroids.forEach(function(id){
            var o = macros.find(function(m){
                return (m.hostmacroid == id);
            });
            
            var matrix = { "macroid": id, "macro": o.macro, "matrix_items": deepClone(matrix_items) };
            macro_host.filter(function(m){ return (m.macroid == id); }).forEach(function(m){
                matrix.matrix_items[m.host] = o.value;
            });
            arr[arr.length] = deepClone(matrix);
        });

        //  sort macro name
        arr.sort(function(a,b){
            if (a.macro < b.macro) {
                return -1;
            }
            if (a.macro > b.macro) {
                return 1;
            }
            return 0;
        });

        return arr;
    },

    viewTable:  function (tableName, table, $output) {
        $output.innerHTML = "<h3>" + tableName + "</h3>";
        $output.appendChild(markupTable(table));
    }
};

/*

   view templates of macros matrix

*/
var templatesOfMacrosMatrix = {
    requestAPI: function(url, user, password, $output) {
        //  API
        var macros = {
            method: "usermacro.get",
            params:     {
                "output": ["hostmacroid", "macro", "value"],
                "selectTemplates":["templateid", "host", "name"]
            }
        };

        // clear
        $output.innerHTML = "<h3>" + ".........." + "</h3>";

        // get ZabbixAPI result JSON
        zabbixAPI.login(url, user, password)
        .then(function (response) {
            return zabbixAPI.request(url, macros.method, macros.params, response.auth);
        })
        .then(function (response) {
            templatesOfMacrosMatrix.viewTable("templates of macros matrix", templatesOfMacrosMatrix.makeTable(response.result), $output);    
            return zabbixAPI.logout($url.value, response.auth);
        })
        .catch(function (err) {
            $output = $output + "\n" + JSON.stringify(err, null, '\t');
        });
    },

    makeTable: function(macros) {
        var templates = [];
        var macroids = [];
        var macro_template = [];

        //  set array
        macros.forEach(function(m){
            //  include templates
            m.templates.forEach(function(t){
                //  add templates
                templates[templates.length] = t.host;
                //  add macroids
                macroids[macroids.length] = m.hostmacroid;
                //  add macro_template
                macro_template[macro_template.length] = { "macroid": m.hostmacroid, "template": t.host };
            });
        });

        //  sort uniq
        templates = sortUniq(templates);
        macroids = sortUniq(macroids);

        //  make matrix
        var matrix_items = {}; 
        templates.forEach(function(t){
            matrix_items[t] = "";
        });

        var arr = [];
        macroids.forEach(function(id){
            var o = macros.find(function(m){
                return (m.hostmacroid == id);
            });
            
            var matrix = { "macroid": id, "macro": o.macro, "matrix_items": deepClone(matrix_items) };
            macro_template.filter(function(m){ return (m.macroid == id); }).forEach(function(m){
                matrix.matrix_items[m.template] = o.value;
            });
            arr[arr.length] = deepClone(matrix);
        });

        //  sort macro name
        arr.sort(function(a,b){
            if (a.macro < b.macro) {
                return -1;
            }
            if (a.macro > b.macro) {
                return 1;
            }
            return 0;
        });

        return arr;
    },

    viewTable:  function (tableName, table, $output) {
        $output.innerHTML = "<h3>" + tableName + "</h3>";
        $output.appendChild(markupTable(table));
    }
};
