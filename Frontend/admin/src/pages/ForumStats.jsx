import React, { useState, useEffect } from 'react';

import { FiMessageSquare, FiUsers, FiCheckSquare, FiEye, FiBarChart2, FiHash, FiAlertCircle } from 'react-icons/fi';
import CommunityService from '../services/community.service'; // Import CommunityService
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Helper component for individual stat cards using Tailwind
const StatCard = ({ title, stat, icon: IconComponent, helpText }) => {
    return (
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-3xl font-semibold text-gray-900 dark:text-white">{stat}</p>
                {helpText && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{helpText}</p>}
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/50 rounded-full p-3">
                <IconComponent className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
        </div>
    );
};

const ForumStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await CommunityService.getForumStats();
                setStats(response.data); // Assuming response structure is { success: true, data: { ...stats } }
            } catch (err) {
                console.error("Error fetching forum stats:", err);
                setError(err.response?.data?.message || 'Unable to load statistics data.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // Prepare data for charts
    const categoryChartData = stats?.postsPerCategory?.map(item => ({ name: item.category, 'Posts': item.count })) || [];
    const resolutionChartData = [
        { name: 'Resolved', count: stats?.resolutionStats?.resolved || 0 },
        { name: 'Unresolved', count: stats?.resolutionStats?.unresolved || 0 },
    ];

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-theme(space.16))] flex items-center justify-center p-4">
                {/* Simple Spinner using Tailwind animation */}
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error loading data!</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-4 sm:p-8">
            <div className="container mx-auto max-w-7xl">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Forum Statistics</h1>

                {/* Key Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Posts"
                        stat={stats?.totalPosts || 0}
                        icon={FiMessageSquare}
                    />
                    <StatCard
                        title="Total Comments"
                        stat={stats?.totalComments || 0}
                        icon={FiBarChart2}
                    />
                    <StatCard
                        title="Active Authors"
                        stat={stats?.activeAuthors || 0}
                        icon={FiUsers}
                    />
                     <StatCard
                        title="Resolved Posts"
                        stat={stats?.resolutionStats?.resolved || 0}
                        icon={FiCheckSquare}
                        helpText={`Unresolved: ${stats?.resolutionStats?.unresolved || 0}`}
                    />
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Posts per Category Chart */}
                    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Posts by Category</h2>
                        {categoryChartData.length > 0 ? (
                            <div className="h-80"> {/* Set fixed height for chart container */}
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={categoryChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                                        <XAxis dataKey="name" className="text-xs text-gray-600 dark:text-gray-400" />
                                        <YAxis allowDecimals={false} className="text-xs text-gray-600 dark:text-gray-400" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}
                                            labelStyle={{ color: '#1a202c' }}
                                        />
                                        <Legend wrapperStyle={{ fontSize: '0.875rem' }} />
                                        <Bar dataKey="Posts" fill="#3B82F6" /> {/* Updated dataKey name */}
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-10">No category data available.</p>
                        )}
                    </div>

                    {/* Post Resolution Chart */}
                    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Post Resolution Status</h2>
                         {resolutionChartData.reduce((sum, item) => sum + item.count, 0) > 0 ? (
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={resolutionChartData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                                        <XAxis type="number" allowDecimals={false} className="text-xs text-gray-600 dark:text-gray-400"/>
                                        <YAxis dataKey="name" type="category" width={100} className="text-xs text-gray-600 dark:text-gray-400" /> {/* Increased width for English labels */}
                                        <Tooltip
                                             contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}
                                            labelStyle={{ color: '#1a202c' }}
                                        />
                                        <Bar dataKey="count" fill="#60A5FA" name="Count"/> {/* Translated name */}
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                         ) : (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-10">No status data available.</p>
                         )}
                    </div>
                </div>

                {/* Top Posts Lists */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Most Viewed Posts */}
                    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white p-6 border-b border-gray-200 dark:border-gray-700">Most Viewed Posts</h2>
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700 px-6 py-4">
                            {stats?.mostViewedPosts?.length > 0 ? stats.mostViewedPosts.map(post => (
                                <li key={post.id} className="py-3 flex justify-between items-center">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate mr-4">
                                        {post.title} <span className="text-gray-500 dark:text-gray-400">({post.author?.username || 'N/A'})</span>
                                    </p>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                                        {post.viewCount} views
                                    </span>
                                </li>
                            )) : (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-6">No data available</p>
                            )}
                        </ul>
                    </div>

                    {/* Most Commented Posts */}
                    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white p-6 border-b border-gray-200 dark:border-gray-700">Most Commented Posts</h2>
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700 px-6 py-4">
                             {stats?.mostCommentedPosts?.length > 0 ? stats.mostCommentedPosts.map(post => (
                                <li key={post.id} className="py-3 flex justify-between items-center">
                                     <p className="text-sm font-medium text-gray-900 dark:text-white truncate mr-4">
                                        {post.title} <span className="text-gray-500 dark:text-gray-400">({post.author?.username || 'N/A'})</span>
                                    </p>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
                                        {post.commentCount} comments
                                    </span>
                                </li>
                            )) : (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-6">No data available</p>
                            )}
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ForumStats; 