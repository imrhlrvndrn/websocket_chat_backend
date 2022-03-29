class RoomDto {
    _id;
    user;
    participants;
    speakers;
    topic;
    type;
    createdAt;

    constructor(room) {
        this._id = room._id;
        this.user = room.user;
        this.participants = room.participants;
        this.speakers = room.speakers;
        this.topic = room.topic;
        this.type = room.type;
        this.createdAt = room.createdAt;
    }
}

module.exports = RoomDto;
