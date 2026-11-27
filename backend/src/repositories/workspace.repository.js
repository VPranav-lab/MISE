
import { Workspace } from '../models/index.js';

const create = (data, transaction) => {
    return Workspace.create(data, {
        transaction
    });
};

const findById = (id, transaction) => {
    return Workspace.findByPk(id, {
        transaction
    });
};

const findPersonalByUserId = (userId, transaction) => {
    return Workspace.findOne({
        where: {
            createdByUserId: userId,
            workspaceType: 'PERSONAL'
        },
        transaction
    });
};

const findByIdForUpdate = (id, transaction) => {
    if (!transaction) {
        throw new Error('Transaction is required');
    }

    return Workspace.findByPk(id, {
        transaction,
        lock: transaction.LOCK.UPDATE
    });
};

const updateById = (id, data, transaction) => {
    return Workspace.update(data, {
        where: { id },
        transaction
    });
};

const deleteById = (id, transaction) => {
    return Workspace.destroy({
        where: { id },
        transaction
    });
};

export default {
    create,
    findById,
    findPersonalByUserId,
    findByIdForUpdate,
    updateById,
    deleteById
};
