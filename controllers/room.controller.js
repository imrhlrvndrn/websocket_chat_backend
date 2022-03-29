const { RoomDto } = require('../dtos');
const {
    CustomError: { badRequest, notFound },
    Room: { newRoom, getAllRooms },
} = require('../services');
const { successResponse } = require('../utils');

module.exports = {
    createRoom: async (req, res, next) => {
        const { user } = req;
        const { topic, type, password } = req.body;

        if (!topic || !type) return next(badRequest(`Please send topic and/or room type`));
        if (type === 'Private')
            if (!password) return next(badRequest(`Please set a password for private room`));

        try {
            const savedRoom = await newRoom({ owner: user._id, topic, type, password });

            return successResponse(res, { data: { room: new RoomDto(savedRoom) } });
        } catch (error) {
            console.error(error);
            return next(error);
        }
    },
    getAllRooms: async (req, res, next) => {
        try {
            const allRooms = await getAllRooms(['Public']);
            if (!allRooms || !allRooms.length) return next(notFound(`No rooms were found!`));

            return successResponse(res, {
                data: {
                    rooms: allRooms.map((room) => new RoomDto(room)),
                },
            });
        } catch (error) {
            console.error(error);
            return next(error);
        }
    },
};
