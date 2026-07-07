import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Package, Users, ShoppingCart, IndianRupee } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/admin/analytics');
        setData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="p-8">Loading dashboard...</div>;
  if (!data) return <div className="p-8 text-red-500">Failed to load analytics.</div>;

  const stats = [
    { label: 'Total Revenue', value: `₹${data.totalRevenue.toLocaleString('en-IN')}`, icon: <IndianRupee size={24} className="text-emerald-600" />, bg: 'bg-emerald-100' },
    { label: 'Total Orders', value: data.totalOrders, icon: <ShoppingCart size={24} className="text-blue-600" />, bg: 'bg-blue-100' },
    { label: 'Total Products', value: data.totalProducts, icon: <Package size={24} className="text-amber-600" />, bg: 'bg-amber-100' },
    { label: 'Customers', value: data.totalCustomers, icon: <Users size={24} className="text-purple-600" />, bg: 'bg-purple-100' },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-500">Welcome back! Here is what's happening with your store today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 flex items-center gap-4">
            <div className={`p-4 rounded-full ${stat.bg}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Over Time</h3>
        <div className="h-80 w-full">
          {data.revenueChart && data.revenueChart.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueChart} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8d6e63" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8d6e63" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} tickFormatter={(val) => `₹${val}`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`₹${value}`, "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#8d6e63" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500">Not enough data to display chart</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
