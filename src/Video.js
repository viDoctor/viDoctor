import React from "react";
import Peer from "./Peer";

class Video extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: 0xcafe,
            connectionReady: false,
            localReady: false,
            localVideoIsOn: false,
            videoIsOn: false,
            media: null,
        };
        this.localVideoRef = React.createRef();

        this.requestMedia().then((media) => {
            this.peer = new Peer();

            this.setState({
                localReady: true,
                media: media,
            });
        });
    }

    async requestMedia() {
        try {
            return await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: { facingMode: "user" },
            });
        } catch (err) {
            console.log("ERROR With Media request");
        }
    }

    render() {
        return (
            <div className="Video">
                <form
                    onSubmit={(ev) => {
                        ev.preventDefault();

                        this.peer.get_raw().signal(this.state.data);
                        this.peer.addStream(this.state.media);
                        this.setState({
                            connectionReady: true,
                        });
                    }}
                >
                    <textarea
                        id="incoming"
                        onChange={(ev) => {
                            this.setState({ data: ev.target.value });
                        }}
                    ></textarea>
                    <button type="submit">submit</button>
                </form>
                <pre id="outgoing"></pre>
                <video
                    ref={(video) => {
                        if (
                            video &&
                            this.state.localReady &&
                            !this.state.localVideoIsOn
                        ) {
                            video.srcObject = this.state.media;
                            this.setState({
                                localVideoIsOn: true,
                            });
                        }
                    }}
                    autoPlay
                ></video>

                <video
                    ref={(video) => {
                        if (
                            video &&
                            this.state.connectionReady &&
                            !this.state.videoIsOn
                        ) {
                            video.srcObject = this.peer.video;
                            this.setState({
                                videoIsOn: true,
                            });
                        }
                    }}
                    autoPlay
                ></video>
            </div>
        );
    }
}

export default Video;
