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

const DashboardLayout = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);
    const [isTasksExpanded, setIsTasksExpanded] = useState(true);

    // Mock data instead of using auth
    const mockUser = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com'
    };

    const handleLogout = () => {
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
            id: 'projects',
            label: 'Projects',
            icon: LayoutGrid,
            path: '/creator/experiences',
            expandable: true,
            isExpanded: isProjectsExpanded,
            setExpanded: setIsProjectsExpanded,
            subItems: [
                { label: 'All Experiences', path: '/creator/experiences' },
                { label: 'Create New', path: '/creator/create-experience' }
            ]
        },
        {
            id: 'tasks',
            label: 'Tasks',
            icon: Calendar,
            path: '/creator/bookings',
            expandable: true,
            isExpanded: isTasksExpanded,
            setExpanded: setIsTasksExpanded,
            subItems: [
                { label: 'Active Bookings', path: '/creator/bookings/active' },
                { label: 'Completed', path: '/creator/bookings/completed' }
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
                className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo Section */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
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
                    <div className="p-4 border-t border-gray-100">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-4 text-white">
                            <h3 className="font-semibold mb-1">Upgrade to Pro</h3>
                            <p className="text-sm opacity-90 mb-3">Get 1 month free and unlock</p>
                            <button className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors w-full">
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
                <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
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
                                Hello, {mockUser.first_name}
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Track your progress here. You almost reach a goal!
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
                                        {mockUser.first_name} {mockUser.last_name}
                                    </p>
                                    <p className="text-xs text-gray-500">@{mockUser.email.split('@')[0]}</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                    <span className="text-indigo-600 font-medium">
                                        {mockUser.first_name[0]}
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