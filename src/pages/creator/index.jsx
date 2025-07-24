import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Star, Activity, Circle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import API_URL from '../../constants/api';

const CreatorDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const [stats, setStats] = useState({
        totalBookings: 85,
        avgRating: 4.8,
        activeBooking: 12
    });

    const [expStats, setExpStats] = useState({
        active: 4,
        draft: 2,
        inactive: 3
    });

    const StatCard = ({ icon, value, label }) => (
        <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-gray-100 text-center">
            <div className="w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-3">
                {icon}
            </div>
            <h3 className="text-2xl lg:text-3xl font-semibold mb-1">{value}</h3>
            <p className="text-xs lg:text-sm text-gray-500">{label}</p>
        </div>
    );

    const ExperienceCard = ({ color, value, label }) => (
        <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-gray-100 text-center">
            <div className="w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-3">
                <div className={`w-5 h-5 rounded-full ${color}`}></div>
            </div>
            <h3 className="text-2xl lg:text-3xl font-semibold mb-1">{value}</h3>
            <p className="text-xs lg:text-sm text-gray-500">{label}</p>
        </div>
    );

    const FeedbackCard = ({ name, date, rating, avatar }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6">
            <div className="flex items-center gap-3 mb-2">
                <img
                    src={avatar}
                    alt={name}
                    className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover"
                />
                <div>
                    <h4 className="font-medium">{name}</h4>
                    <p className="text-sm text-gray-500">{date}</p>
                </div>
            </div>
            <div className="flex items-center gap-1">
                {[...Array(5)].map((_, index) => (
                    <Star
                        key={index}
                        size={16}
                        className={index < rating ? 'fill-blue-500 text-blue-500' : 'text-gray-300'}
                    />
                ))}
            </div>
        </div>
    );

    return (
        <div className=''>
            {/* Performance Chart Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold">Performance</h2>
                    <select className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option>01-07 May</option>
                        <option>08-14 May</option>
                        <option>15-21 May</option>
                        <option>22-28 May</option>
                    </select>
                </div>

                {/* Placeholder for chart */}
                <div className="h-64 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-gray-800 mb-2">Performance Chart</div>
                        <p className="text-gray-500">Analytics visualization coming soon</p>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-6 mb-8">
                <StatCard
                    icon={<Calendar className="text-blue-500" />}
                    value={stats.totalBookings}
                    label="Total Bookings"
                />
                <StatCard
                    icon={<Star className="text-yellow-500" />}
                    value={stats.avgRating}
                    label="Avg. Rating"
                />
                <StatCard
                    icon={<div className="w-5 h-5 rounded-full bg-green-600"></div>}
                    value={stats.activeBooking}
                    label="Active Bookings"
                />
            </div>

            {/* Experience Overview */}
            <section className="mb-8">
                <h2 className="text-xl lg:text-2xl font-medium mb-4">My Activities</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-6">
                    <ExperienceCard
                        color="bg-green-600"
                        value={expStats.active}
                        label="Active"
                    />
                    <ExperienceCard
                        color="bg-yellow-400"
                        value={expStats.draft}
                        label="Draft"
                    />
                    <ExperienceCard
                        color="bg-gray-300"
                        value={expStats.inactive}
                        label="Inactive"
                    />
                </div>
            </section>

            {/* Recent Feedbacks */}
            <section className="mb-8">
                <h2 className="text-xl lg:text-2xl font-medium mb-4">Recent Feedbacks</h2>
                <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                    <FeedbackCard
                        name="Miguel"
                        date="March 11, 2025"
                        rating={1}
                        avatar="https://ui-avatars.com/api/?name=Miguel&background=random"
                    />
                    <FeedbackCard
                        name="Jonathan"
                        date="May 01, 2025"
                        rating={3}
                        avatar="https://ui-avatars.com/api/?name=Jonathan&background=random"
                    />
                </div>
            </section>


        </div>
    );
};

export default CreatorDashboard;