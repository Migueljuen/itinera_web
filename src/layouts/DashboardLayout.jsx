import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
    Home,
    LayoutGrid,
    Calendar,
    Users,
    Settings,
    HelpCircle,
    LogOut,
    Menu,
    X,
    ChevronDown,
    Plus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const DashboardLayout = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);
    const [isTasksExpanded, setIsTasksExpanded] = useState(true);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navigationItems = [
        {
            id: 'home',
            label: 'Home',
            icon: Home,
            path: '/creator/dashboard',
            expandable: false
        },
        {
            id: 'activities',
            label: 'Activities',
            icon: LayoutGrid,
            path: '/owner/activities',
            expandable: true,
            isExpanded: isProjectsExpanded,
            setExpanded: setIsProjectsExpanded,
            subItems: [
                { label: 'All Activities', path: '/owner/activities' },
                { label: 'Add New', path: '/owner/create' }
            ]
        },
        {
            id: 'tasks',
            label: 'Tasks',
            icon: Calendar,
            path: '/owner/bookings',
            expandable: true,
            isExpanded: isTasksExpanded,
            setExpanded: setIsTasksExpanded,
            subItems: [
                { label: 'Active Bookings', path: '/owner/bookings/active' },
                { label: 'Completed', path: '/owner/bookings/completed' },

            ]
        },
        {
            id: 'team',
            label: 'Team',
            icon: Users,
            path: '/creator/team',
            expandable: false
        },
        {
            id: 'settings',
            label: 'Settings',
            icon: Settings,
            path: '/creator/settings',
            expandable: false
        }
    ];

    const NavItem = ({ item }) => {
        const Icon = item.icon;

        if (item.expandable) {
            return (
                <div>
                    <button
                        onClick={() => item.setExpanded(!item.isExpanded)}
                        className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <Icon size={20} className="text-gray-500 group-hover:text-gray-700" />
                            <span className="font-medium">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Plus size={16} className="text-gray-400" />
                            <ChevronDown
                                size={16}
                                className={`text-gray-400 transition-transform ${item.isExpanded ? 'rotate-180' : ''}`}
                            />
                        </div>
                    </button>
                    {item.isExpanded && (
                        <div className="ml-8 mt-1 space-y-1">
                            {item.subItems.map((subItem) => (
                                <NavLink
                                    key={subItem.path}
                                    to={subItem.path}
                                    className={({ isActive }) =>
                                        `block px-4 py-2 text-sm rounded-lg transition-colors ${isActive
                                            ? 'bg-indigo-50 text-indigo-600 font-medium'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`
                                    }
                                >
                                    {subItem.label}
                                </NavLink>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <NavLink
                to={item.path}
                className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group ${isActive
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                }
            >
                <Icon size={20} className={`group-hover:text-gray-700`} />
                <span className="font-medium">{item.label}</span>
            </NavLink>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Sidebar Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-300 z-50 transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo Section */}
                    <div className="flex items-center justify-between p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">I</span>
                            </div>
                            <span className="text-xl font-semibold">Itinera</span>
                        </div>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="lg:hidden p-1 hover:bg-gray-100 rounded-lg"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {navigationItems.map((item) => (
                            <NavItem key={item.id} item={item} />
                        ))}
                    </nav>

                    {/* Upgrade Section */}
                    <div className="p-4 border-t border-gray-200">
                        <div className=" rounded-lg p-4  text-center text-[#212121]">
                            <h3 className="font-bold mb-1">Upgrade Plan</h3>
                            <p className="text-sm opacity-90 mb-3">Showcase more activities</p>
                            <button className="bg-[#376a63] text-gray-50 px-4 py-2 rounded-4xl text-sm font-medium hover:bg-gray-50 transition-colors w-3/4">
                                Upgrade
                            </button>
                        </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="p-4 border-t border-gray-100 space-y-1">
                        <button className="flex items-center gap-3 px-4 py-3 w-full text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                            <HelpCircle size={20} className="text-gray-500" />
                            <span className="font-medium">Help & Information</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 w-full text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <LogOut size={20} className="text-gray-500" />
                            <span className="font-medium">Log out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="lg:ml-64 min-h-screen">
                {/* Top Header */}
                <header className="bg-white border-b border-gray-300 sticky top-0 z-30">
                    <div className="flex items-center justify-between px-4 lg:px-8 py-4">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <Menu size={24} />
                        </button>

                        {/* Page Title */}
                        <div className="flex-1 lg:flex-none">
                            <h1 className="text-2xl font-semibold text-gray-900">
                                Hello, {user?.first_name || 'Creator'}
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Welcome back, track your progress here.
                            </p>
                        </div>

                        {/* Right Section */}
                        <div className="flex items-center gap-4">
                            {/* Date */}
                            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                                <Calendar size={16} />
                                <span>{new Date().toLocaleDateString('en-US', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}</span>
                            </div>

                            {/* User Profile */}
                            <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-medium text-gray-900">
                                        {user?.first_name} {user?.last_name}
                                    </p>
                                    <p className="text-xs text-gray-500">@{user?.email?.split('@')[0]}</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                    <span className="text-indigo-600 font-medium">
                                        {user?.first_name?.[0] || 'U'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;