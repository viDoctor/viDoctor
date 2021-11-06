import SimplePeer from "simple-peer";

class Peer {
    p = new SimplePeer({
        initiator: window.location.hash === "#doctor",
        trickle: false,
    });
    constructor() {
        this.p.on("error", (err) => console.log("error", err));

        this.p.on("signal", (data) => {
            console.log("SIGNAL", JSON.stringify(data));
            document.querySelector("#outgoing").textContent =
                JSON.stringify(data);
            if (this.p.connected) this.p.send(JSON.stringify(data));
        });

        this.p.on("connect", () => {
            console.log("CONNECT");
            this.p.send("whatever" + Math.random());
        });

        this.p.on("data", (data) => {
            console.log("data: " + data);
        });
        this.p.on("stream", (stream) => {
            // This currently does not work
            console.log("Got remote video Stream");
            this.video = stream;
        });
    }
    get_raw() {
        return this.p;
    }
    addStream(stream) {
        this.p.addStream(stream);
    }
}

export default Peer;
