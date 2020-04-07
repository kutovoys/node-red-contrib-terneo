module.exports = function (RED) {
    const fetch = require('node-fetch');

    function TerneoOutNode(config) {
        RED.nodes.createNode(this, config);
        this.server = RED.nodes.getNode(config.server);
        if (this.server) {
            var ip = this.server.host;
            var sn = this.server.sn;
            var auth = this.server.auth;
            var node = this;
            node.on('input', function (msg) {
                if (msg.payload.TargetHeatingCoolingState !== undefined) {
                    var state = msg.payload.TargetHeatingCoolingState;
                    if (state == 1) {
                        state = "0";
                    } else if (state === 0) {
                        state = "1";
                    }
                    var data1 = {
                        "sn": sn,
                        "auth": auth,
                        "par": [
                            [125, 7, state]
                        ]
                    };
                    var url1 = 'http://' + ip + '/api.cgi';
                    fetch(url1, {
                        method: 'post',
                        body: JSON.stringify(data1),
                        headers: {
                            'Content-Type': 'application/json'
                        },
                    });
                }
                if (msg.payload.TargetTemperature !== undefined) {
                    var temp = String(msg.payload.TargetTemperature);
                    var data = {
                        "sn": sn,
                        "auth": auth,
                        "par": [
                            [5, 1, temp]
                        ]
                    };
                    var url = 'http://' + ip + '/api.cgi';
                    fetch(url, {
                        method: 'post',
                        body: JSON.stringify(data),
                        headers: {
                            'Content-Type': 'application/json'
                        },
                    });
                    node.status({
                        fill: 'yellow',
                        shape: 'dot',
                        text: 'Target Temp : ' + temp
                    });
                }
            });
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
    RED.nodes.registerType("terneo-out", TerneoOutNode);
}