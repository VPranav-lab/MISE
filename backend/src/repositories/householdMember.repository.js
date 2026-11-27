
import {
    HouseholdMember,
    Household
} from '../models/index.js';

const findByUserId = (userId, transaction) => {
    return HouseholdMember.findOne({
        where: { userId },
        include: [
            {
                model: Household,
                as: 'household',
                required: true
            }
        ],
        transaction
    });
};

export default {
    findByUserId
};
