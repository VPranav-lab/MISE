
import { UserPreference } from '../models/index.js';

const create = (data, transaction) => {
    return UserPreference.create(data, {
        transaction
    });
};

const findByUserId = (userId, transaction) => {
    return UserPreference.findByPk(userId, {
        transaction
    });
};

const updateByUserId = (userId, data, transaction) => {
    return UserPreference.update(data, {
        where: { userId },
        transaction
    });
};

const deleteByUserId = (userId, transaction) => {
    return UserPreference.destroy({
        where: { userId },
        transaction
    });
};

export default {
    create,
    findByUserId,
    updateByUserId,
    deleteByUserId
};
