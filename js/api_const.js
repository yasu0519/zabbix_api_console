/* 



    ./js/api_const.js
    * zabbix api constants. *

    
 */
"use strict";

/*
    common
 */
const STATUS = ["Enabled", "Disabled"];

/* 
    group
 */
var GROUP_FLAGS = [
    "plain host group",
    "",
    "",
    "",
    "discovered host group"
];
var GROUP_INTERNAL = [
    "not internal",
    "internal"
];

/* 
    item
 */
var ITEM_TYPE = [
        "Zabbix agent",
        "SNMPv1 agent",
        "Zabbix trapper",
        "simple check",
        "SNMPv2 agent",
        "Zabbix internal",
        "SNMPv3 agent",
        "Zabbix agent (active)",
        "Zabbix aggregate",
        "web item",
        "external check",
        "database monitor",
        "IPMI agent",
        "SSH agent",
        "TELNET agent",
        "calculated",
        "JMX agent",
        "SNMP trap",
        "Dependent item"
];

/* 
    trigger
 */
var TRIGGER_SEVERITY = [    /* priority */
    "default",
    "information",
    "warning",
    "average",
    "high",
    "disaster"
];