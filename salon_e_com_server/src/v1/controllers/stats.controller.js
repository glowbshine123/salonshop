import Product from '../models/Product.js';
import User from '../models/User.js';
import Order from '../models/Order.js';

/**
 * Get public stats for the landing page
 * @route GET /api/v1/stats
 * @access Public
 */
export const getPublicStats = async (req, res) => {
    try {
        // 1. Total Active Products
        const productCount = await Product.countDocuments({ status: 'ACTIVE' });

        // 2. Total Active Agents
        const agentCount = await User.countDocuments({ 
            role: 'AGENT', 
            status: 'ACTIVE' 
        });

        // 3. Total Active Salons
        const salonCount = await User.countDocuments({ 
            role: 'SALON_OWNER', 
            status: 'ACTIVE' 
        });

        // 4. Lifetime Orders (Count)
        // Count of all orders that are NOT Cancelled or Refunded
        const orderCount = await Order.countDocuments({
            status: { $nin: ['CANCELLED', 'REFUNDED'] }
        });

        res.status(200).json({
            success: true,
            data: {
                products: productCount,
                agents: agentCount,
                salons: salonCount,
                orders: orderCount
            }
        });
    } catch (error) {
        console.error('Error fetching public stats:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching stats'
        });
    }
};
