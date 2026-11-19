import AgentProfile from '../models/AgentProfile.js';
import User from '../models/User.js';
import razorpay from '../../config/razorpay.js';

export const updateAgentPayoutSettings = async (userId, updateData) => {
    const user = await User.findById(userId).lean();
    if (!user || user.role !== 'AGENT') {
        throw new Error('Unauthorized or User not found');
    }

    let agentProfile = await AgentProfile.findOne({ userId });
    if (!agentProfile) {
        agentProfile = new AgentProfile({ userId });
    }

    // Handle Razorpay Bank/UPI Updates
    if (updateData.bankDetails || updateData.upiId !== undefined) {
        if (updateData.bankDetails) {
            agentProfile.bankDetails = { ...(agentProfile.bankDetails || {}), ...updateData.bankDetails };
        }
        if (updateData.upiId !== undefined) {
            agentProfile.upiId = updateData.upiId;
        }

        if (razorpay && razorpay.isEnabled && !razorpay.isMock) {
            try {
                let contactId = agentProfile.razorpayContactId;

                // 1. Create Razorpay Contact (if missing)
                if (!contactId) {
                    const contactName = agentProfile.bankDetails?.accountHolderName || `${user.firstName} ${user.lastName}`.trim() || 'Agent';
                    const contact = await razorpay.api.post({
                        url: '/contacts',
                        data: {
                            name: contactName,
                            email: user.email,
                            contact: user.phone || "9999999999",
                            type: "vendor",
                            reference_id: user._id.toString(),
                            notes: { role: "AGENT" }
                        }
                    });
                    contactId = contact.id;
                    agentProfile.razorpayContactId = contactId;
                }

                // 2. Create Razorpay Fund Account
                if (contactId) {
                    if (updateData.bankDetails && updateData.bankDetails.accountNumber && updateData.bankDetails.ifscCode) {
                        const fundAccount = await razorpay.fundAccount.create({
                            contact_id: contactId,
                            account_type: "bank_account",
                            bank_account: {
                                name: agentProfile.bankDetails.accountHolderName || `${user.firstName} ${user.lastName}`.trim(),
                                ifsc: agentProfile.bankDetails.ifscCode,
                                account_number: agentProfile.bankDetails.accountNumber
                            }
                        });
                        agentProfile.fundAccountId = fundAccount.id;
                    } else if (updateData.upiId) {
                        const fundAccount = await razorpay.fundAccount.create({
                            contact_id: contactId,
                            account_type: "vpa",
                            vpa: {
                                address: updateData.upiId
                            }
                        });
                        agentProfile.fundAccountId = fundAccount.id;
                    }
                }
            } catch (error) {
                console.error("[Razorpay API Sync Error]: Failed to create fund account.", error);
                throw new Error(`Razorpay Banking Error: ${error.error?.description || error.message}`);
            }
        }
    }

    await agentProfile.save();
    return agentProfile;
};
