const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Category = require('../models/Category');

exports.getAnalytics = async (req, res) => {
  try {
    const [totalProducts, totalCategories, totalOrders, totalCustomers, orders] = await Promise.all([
      Product.countDocuments(),
      Category.countDocuments(),
      Order.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Order.find({ paymentStatus: 'paid' }, 'totalAmount createdAt')
    ]);

    const revenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);

    // Group revenue by month for chart (last 6 months)
    const monthlyData = {};
    orders.forEach(order => {
      const date = new Date(order.createdAt);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { revenue: 0, orders: 0 };
      }
      monthlyData[monthYear].revenue += order.totalAmount;
      monthlyData[monthYear].orders += 1;
    });

    const revenueChart = Object.keys(monthlyData).map(key => ({
      name: key,
      revenue: monthlyData[key].revenue,
      orders: monthlyData[key].orders
    }));

    res.json({
      success: true,
      data: {
        totalProducts,
        totalCategories,
        totalOrders,
        totalCustomers,
        totalRevenue: revenue,
        revenueChart
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
};

exports.getCustomers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password');
    
    // Attach order count and total spend for each user
    const customersWithStats = await Promise.all(users.map(async (user) => {
      const orders = await Order.find({ user: user._id });
      const totalSpent = orders.reduce((acc, curr) => acc + curr.totalAmount, 0);
      return {
        ...user.toObject(),
        ordersCount: orders.length,
        totalSpent
      };
    }));

    res.json({ success: true, data: customersWithStats });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch customers' });
  }
};
