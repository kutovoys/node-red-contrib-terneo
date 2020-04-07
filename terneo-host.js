module.exports = function (RED) {
    function TerneoHostNode(n) {
        RED.nodes.createNode(this, n);
        this.name = n.name;
        this.host = n.host;
        this.sn = n.sn;
        this.auth = n.auth;
    }
    RED.nodes.registerType("terneo-host", TerneoHostNode);
}