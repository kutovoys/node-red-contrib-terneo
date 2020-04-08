module.exports = function (RED) {
    const fetch = require('node-fetch');
    function TerneoInNode(config) {
        RED.nodes.createNode(this, config);
        this.server = RED.nodes.getNode(config.server);
        if (this.server) {
            var ip = this.server.host;
            var sn = this.server.sn;
            var auth = this.server.auth;
            var poll = this.server.poll;
            var node = this;
            //функция получения телеметрии - на выходе полный json
            async function requestTelemetry() {
                try {
                    let data = {
                        "cmd": 4
                    };
                    let url = 'http://' + ip + '/api.cgi';
                    let response = await fetch(url, {
                        method: 'post',
                        body: JSON.stringify(data),
                        headers: {
                            'Content-Type': 'application/json'
                        },
                    });
                    var telemetry = await response.json();
                    return telemetry;
                } catch (err) {
                    node.error('Error request telemetry')
                }
            }
            //функция получения параметров - на выходе полный json
            async function requestParams() {
                try {
                    await new Promise(r => setTimeout(r, 3000));
                    let data1 = {
                        "cmd": 1
                    };
                    let url = 'http://' + ip + '/api.cgi';
                    let response = await fetch(url, {
                        method: 'post',
                        body: JSON.stringify(data1),
                        headers: {
                            'Content-Type': 'application/json'
                        },
                    });
                    var params = await response.json();
                    return params;
                } catch (err) {
                    node.error('Error request pamametrs')
                }
            }
            //Функция преобразования и формирования json для HomeKit
            async function transform() {
                try {
                    tel = await requestTelemetry();
                    console.log(tel);
                    parrams = await requestParams();
                    console.log(parrams);
                    if (tel && parrams !== undefined) {
                        var heat = Number(await tel["f.0"]);
                        if (heat == 1) {
                            node.status({
                                fill: 'yellow',
                                shape: 'dot',
                                text: 'HEAT'
                            });
                        } else if (heat === 0) {
                            node.status({
                                fill: 'yellow',
                                shape: 'dot',
                                text: 'IDLE'
                            });
                        }
                        var current = Number(await tel["t.1"]) / 16;
                        var target = Number(await tel["t.5"]) / 16;
                        var state = Number(await parrams.par[26][2]);
                        if (state == 1) {
                            state = 0;
                        } else if (state === 0) {
                            state = 1;
                        }
                        var homekit = {
                            "CurrentTemperature": current,
                            "TargetTemperature": target,
                            "CurrentHeatingCoolingState": heat,
                            "TargetHeatingCoolingState": state
                        };
                        node.send({
                            payload: homekit
                        })
                    }
                } catch (err) {
                    node.error('Error prepare data for HomeKit')
                }
            }
            try {
                setInterval(transform, poll*1000, )
            } catch (err) {
                node.error(err)
            }
        } else {
            console.log('Host not set');
            var node = this;
            node.status({
                fill: 'red',
                shape: 'ring',
                text: 'Host not set'
            });
        }
    }
    RED.nodes.registerType("terneo-in", TerneoInNode);
}