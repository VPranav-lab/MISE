
import { User } from '../models/index.js';

const create = (data, transaction) => {
    return User.create(data, { transaction });
};

const findById = (id, transaction) => {
    return User.findByPk(id, { transaction });
};

const findByUsername = (username, transaction) => {
    return User.findOne({
        where: { username },
        transaction
    });
};

const findByEmail = (email, transaction) => {
    return User.findOne({
        where: { email },
        transaction
    });
};

const findByUsernameWithPassword = (username, transaction) => {
    return User.scope('withPassword').findOne({
        where: { username },
        transaction
    });
};

const findByEmailWithPassword = (email, transaction) => {
    return User.scope('withPassword').findOne({
        where: { email },
        transaction
    });
};

const findByIdWithPassword = (id, transaction) => {
    return User.scope('withPassword').findByPk(id, {
        transaction
    });
};

const findByIdForUpdate = (id, transaction) => {
    if (!transaction) {
        throw new Error('Transaction is required');
    }

    return User.findByPk(id, {
        transaction,
        lock: transaction.LOCK.UPDATE
    });
};

const updateById = (id, data, transaction) => {
    return User.update(data, {
        where: { id },
        transaction
    });
};

const deleteById = (id, transaction) => {
    return User.destroy({
        where: { id },
        transaction
    });
};

const findByIdWithPasswordForUpdate = (id, transaction) => {
    if (!transaction) {
        throw new Error('Transaction is required');
    }

    return User.scope('withPassword').findByPk(id, {
        transaction,
        lock: transaction.LOCK.UPDATE
    });
};


export default {
    create,
    findById,
    findByUsername,
    findByEmail,
    findByUsernameWithPassword,
    findByEmailWithPassword,
    findByIdWithPassword,
    findByIdForUpdate,
    updateById,
    deleteById,
    findByIdWithPasswordForUpdate
};
