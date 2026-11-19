// src/v1/controllers/commission.controller.js
import * as commissionService from '../services/commission.service.js';

export const getCommissions = async (req, res) => {
    try {
        const result = await commissionService.listCommissions(req.user.id, req.user.role, req.query);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
