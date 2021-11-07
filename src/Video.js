import React from "react";
import FlexView from "react-flexview";
import axios from "axios";
import { connect, createLocalVideoTrack } from "twilio-video";
import {
    Button,
    HTMLSelect,
    InputGroup,
    Intent,
    Toaster,
} from "@blueprintjs/core";

class Video extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            identity: null,
            roomName: "",
            roomNameErr: false,
            previewTracks: null,
            localMediaAvailable: false,
            hasJoinedRoom: false,
            activeRoom: null,
            roomList: [],
        };
        this.getLocal();
        this.localMediaRef = React.createRef();
        this.remoteMediaRef = React.createRef();
    }

    async getLocal() {}
    componentDidMount() {
        createLocalVideoTrack().then((track) => {
            this.localMediaRef.current.appendChild(track.attach());
        });
        axios
            .get(`${process.env.REACT_APP_API_SERVER}/token`)
            .then((results) => {
                console.log("Identity retrieved");
                const { identity, token } = results.data;
                this.setState({ identity, token });
            });
        axios
            .get(
                `${
                    process.env.REACT_APP_API_SERVER
                }/hospitals/?name=${encodeURIComponent(this.props.hName)}`
            )
            .then((results) => {
                console.log("Room list retrieved");
                const { roomList } = results.data;
                this.setState({
                    roomList: roomList.map((x) => ({
                        label: x.name,
                        value: x.id,
                    })),
                });
            });
    }

    async connect() {
        await connect(this.state.token, {
            name: this.state.roomName,
            video: { width: 640 },
            audio: true,
        }).then(
            (room) => {
                console.log(`Successfully joined a Room: ${room}`);
                this.toaster.show({
                    intent: Intent.SUCCESS,
                    message: "Successfully joined Room",
                });

                room.on("participantConnected", (participant) => {
                    console.log(
                        `Participant "${participant.identity}" connected`
                    );
                    this.toaster.show({
                        intent: Intent.PRIMARY,
                        message: `${this.state.roomName} connected`,
                    });

                    participant.tracks.forEach((publication) => {
                        if (publication.isSubscribed) {
                            const track = publication.track;
                            this.remoteMediaRef.current.appendChild(
                                track.attach()
                            );
                        }
                    });

                    participant.on("trackSubscribed", (track) => {
                        this.remoteMediaRef.current.appendChild(track.attach());
                    });
                });
                room.participants.forEach((participant) => {
                    participant.tracks.forEach((publication) => {
                        if (publication.track) {
                            this.remoteMediaRef.current.appendChild(
                                publication.track.attach()
                            );
                        }
                    });

                    participant.on("trackSubscribed", (track) => {
                        this.remoteMediaRef.current.appendChild(track.attach());
                    });
                });
                room.on("participantDisconnected", (participant) => {
                    console.log(
                        `Participant disconnected: ${participant.identity}`
                    );
                });
                room.on("disconnected", (room) => {
                    // Detach the local media elements
                    room.localParticipant.tracks.forEach((publication) => {
                        const attachedElements = publication.track.detach();
                        attachedElements.forEach((element) => element.remove());
                    });
                });

                this.setState({
                    activeRoom: room,
                    localMediaAvailable: true,
                    hasJoinedRoom: true,
                });
            },
            (error) => {
                this.toaster.show({
                    intent: Intent.SUCCESS,
                    message: `Unable to connect to Room ${this.state.roomName}`,
                });
                console.error(`Unable to connect to Room: ${error.message}`);
            }
        );
        this.setState({
            connect: true,
            isConnecting: false,
        });
    }

    render() {
        let joinOrLeaveRoomButton = this.state.hasJoinedRoom ? (
            <Button
                text="Leave Room"
                onClick={() => {
                    this.state.activeRoom.disconnect();
                    this.setState({
                        hasJoinedRoom: false,
                        localMediaAvailable: false,
                    });
                }}
            />
        ) : (
            <Button
                text="Join Room"
                onClick={(e) => {
                    e.preventDefault();
                    this.connect();
                }}
            />
        );
        return (
            <div>
                <Toaster ref={(ref) => (this.toaster = ref)} />
                <HTMLSelect
                    options={this.state.roomList}
                    onChange={(e) => {
                        /* Fetch room name from text field and update state */
                        let roomName = e.target.value;
                        if (roomName in this.state.roomList.map((x) => x.value))
                            this.setState({ roomName });
                    }}
                />
                {joinOrLeaveRoomButton}
                <FlexView hAlignContent="center" vAlignContent="center">
                    <FlexView>
                        <div ref={this.localMediaRef}></div>
                    </FlexView>
                    <FlexView>
                        <div ref={this.remoteMediaRef}></div>
                    </FlexView>
                </FlexView>
            </div>
        );
    }
}

export default Video;
