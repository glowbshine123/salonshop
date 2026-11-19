import CommissionSlab from '../models/CommissionSlab.js';

export const getCommissionRate = async (amount) => {
    // Find a slab that matches the amount
    // Case 1: amount is between min and max
    // Case 2: min is null (means up to max)
    // Case 3: max is null (means min and above)
    const slab = await CommissionSlab.findOne({
        isActive: true,
        $and: [
            {
                $or: [
                    { minAmount: { $lte: amount } },
                    { minAmount: { $exists: false } },
                    { minAmount: null }
                ]
            },
            {
                $or: [
                    { maxAmount: { $gte: amount } },
                    { maxAmount: { $exists: false } },
                    { maxAmount: null }
                ]
            }
        ]
    }).sort({ minAmount: -1 }); // Sort by minAmount desc to get the most specific slab if there's overlap

    return slab ? slab.commissionPercentage : 5; // Default 5% if no slab found
};

export const createSlab = async (slabData) => {
    return await CommissionSlab.create(slabData);
};

export const getAllSlabs = async () => {
    return await CommissionSlab.find().sort({ minAmount: 1 });
};

export const updateSlab = async (id, updateData) => {
    return await CommissionSlab.findByIdAndUpdate(id, updateData, { new: true });
};
