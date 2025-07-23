import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Heart,
    MapPin,
    Star,
    Edit,
    ChevronLeft,
    ChevronRight,
    Plus,
    CheckCircle,
    Edit3,
    PauseCircle,
    ChevronDown,
    X,
    Image as ImageIcon
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import API_URL from '../../constants/api';

const ITEMS_PER_PAGE = 5;

const CreatorExperiences = () => {
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedTab, setSelectedTab] = useState('Active');
    const [myExperiences, setMyExperiences] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [statusModalVisible, setStatusModalVisible] = useState(false);
    const [selectedExperience, setSelectedExperience] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    // Function to fetch experiences
    const fetchExperiences = async () => {
        if (!user?.user_id) return;

        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/experience/user/${user.user_id}`);
            setMyExperiences(response.data);
        } catch (error) {
            console.error('Error fetching experiences:', error);
            setMyExperiences([]);
        } finally {
            setLoading(false);
        }
    };

    // Initial data loading
    useEffect(() => {
        if (user?.user_id) {
            fetchExperiences();
        }
    }, [user]);

    // Reset to first page when tab or search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedTab, searchText]);

    const filteredExperiences = myExperiences.filter(exp => {
        const matchesSearch = exp.title.toLowerCase().includes(searchText.toLowerCase()) ||
            exp.destination_name.toLowerCase().includes(searchText.toLowerCase());
        const matchesTab = selectedTab === 'All' || exp.status.toLowerCase() === selectedTab.toLowerCase();
        return matchesSearch && matchesTab;
    });

    // Calculate pagination
    const totalPages = Math.ceil(filteredExperiences.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedExperiences = filteredExperiences.slice(startIndex, endIndex);

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push('...');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };

    const tabs = ['All', 'Active', 'Draft', 'Inactive'];

    // Function to update experience status
    const updateExperienceStatus = async (experienceId, newStatus) => {
        try {
            setUpdatingStatus(true);

            const response = await axios.patch(
                `${API_URL}/experience/${experienceId}/status`,
                { status: newStatus },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 200) {
                setMyExperiences(prevExperiences =>
                    prevExperiences.map(exp =>
                        exp.experience_id === experienceId
                            ? { ...exp, status: newStatus }
                            : exp
                    )
                );
                alert(`Experience status updated to ${newStatus}`);
            }
        } catch (error) {
            console.error('Error updating experience status:', error);
            if (error.response?.status === 500) {
                await fetchExperiences();
            }
            alert('Failed to update experience status. Please try again.');
        } finally {
            setUpdatingStatus(false);
            setStatusModalVisible(false);
            setSelectedExperience(null);
        }
    };

    // Function to handle status badge click
    const handleStatusClick = (experience) => {
        setSelectedExperience(experience);
        setStatusModalVisible(true);
    };

    if (loading && myExperiences.length === 0) {
        return (
            <div className="flex-1 flex justify-center items-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your experiences...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 lg:px-8 py-6 lg:py-8 max-w-7xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-semibold text-gray-800">Your Experiences</h1>
                        <p className="text-gray-400 mt-1">Manage your experiences</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {user?.profile_pic ? (
                            <img
                                src={`${API_URL}/${user.profile_pic}`}
                                alt="Profile"
                                className="w-12 h-12 lg:w-14 lg:h-14 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-500 text-lg">{user?.first_name?.[0] || 'U'}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 flex items-center gap-3">
                    <Search className="text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search your experiences"
                        className="flex-1 outline-none text-gray-800"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    <Heart className="text-gray-400" size={20} />
                </div>

                {/* My Activities Section */}
                <div className="mb-8">
                    <h2 className="text-xl font-medium mb-4">My Activities</h2>

                    {/* Tabs */}
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {tabs.map((tab) => {
                            const isSelected = selectedTab === tab;
                            return (
                                <button
                                    key={tab}
                                    onClick={() => setSelectedTab(tab)}
                                    className={`px-6 py-2 rounded-full whitespace-nowrap transition-colors ${isSelected
                                        ? 'bg-gray-800 text-white'
                                        : 'bg-white text-gray-400 hover:bg-gray-100'
                                        }`}
                                >
                                    {tab}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Experiences List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="py-8 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                            <p className="mt-2 text-gray-500">Updating...</p>
                        </div>
                    ) : filteredExperiences.length === 0 ? (
                        <div className="py-16 text-center">
                            <p className="text-gray-500 text-lg font-medium">No experiences found</p>
                            <p className="text-gray-400 mt-2">
                                {selectedTab === 'All'
                                    ? "You haven't created any experiences yet"
                                    : `No ${selectedTab.toLowerCase()} experiences found`}
                            </p>
                            {selectedTab === 'All' && (
                                <button
                                    onClick={() => navigate('/creator/create-experience')}
                                    className="mt-8 bg-indigo-600 text-white rounded-full px-8 py-4 flex items-center gap-3 mx-auto hover:bg-indigo-700 transition-colors"
                                >
                                    <Plus size={16} />
                                    <span>Create First Experience</span>
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            {paginatedExperiences.map((item) => (
                                <div
                                    key={item.experience_id}
                                    className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                                    onClick={() => navigate(`/experience/${item.experience_id}`)}
                                >
                                    <div className="lg:flex">
                                        {/* Image Section */}
                                        <div className="relative lg:w-64 h-48 lg:h-auto">
                                            {item.images && item.images.length > 0 ? (
                                                <img
                                                    src={`${API_URL}${item.images[0]}`}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                    <ImageIcon size={40} className="text-gray-400" />
                                                </div>
                                            )}

                                            {/* Price Badge */}
                                            <div className="absolute top-2 right-2 bg-white/90 px-3 py-1 rounded-md shadow-sm">
                                                <span className="font-medium">
                                                    {item.price === "0" || !item.price ? 'Free' : `₱${item.price}`}
                                                </span>
                                            </div>

                                            {/* Status Badge - Clickable */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleStatusClick(item);
                                                }}
                                                className={`absolute top-2 left-2 px-3 py-1 rounded-md flex items-center gap-1 ${item.status === 'active' ? 'bg-green-100 text-green-600' :
                                                    item.status === 'draft' ? 'bg-yellow-100 text-yellow-600' :
                                                        'bg-gray-100 text-gray-600'
                                                    }`}
                                            >
                                                <span className="text-xs font-medium capitalize">{item.status}</span>
                                                <ChevronDown size={12} />
                                            </button>
                                        </div>

                                        {/* Content Section */}
                                        <div className="flex-1 p-4 lg:p-6">
                                            <h3 className="text-lg font-semibold mb-2">{item.title}</h3>

                                            {/* Location */}
                                            <div className="flex items-center gap-1 text-gray-600 mb-3">
                                                <MapPin size={16} className="text-indigo-600" />
                                                <span className="text-sm">{item.destination_name}</span>
                                            </div>

                                            {/* Tags */}
                                            {item.tags && item.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {item.tags.slice(0, 3).map((tag, index) => (
                                                        <span key={index} className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-md text-xs font-medium">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Stats and Actions */}
                                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-1 text-gray-500">
                                                        <Heart size={14} />
                                                        <span className="text-xs">{item.bookings || 0} bookings</span>
                                                    </div>
                                                    {item.rating > 0 && (
                                                        <div className="flex items-center gap-1 text-gray-500">
                                                            <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                                            <span className="text-xs">{item.rating}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/creator/edit-experience/${item.experience_id}`);
                                                    }}
                                                    className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full flex items-center gap-1 hover:bg-indigo-100 transition-colors"
                                                >
                                                    <Edit size={14} />
                                                    <span className="text-sm font-medium">Edit</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-8">
                                    <p className="text-center text-gray-500 text-sm mb-4">
                                        Showing {startIndex + 1}-{Math.min(endIndex, filteredExperiences.length)} of {filteredExperiences.length} experiences
                                    </p>

                                    <div className="flex justify-center items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className={`p-2 rounded-md ${currentPage === 1
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'bg-gray-800 text-white hover:bg-gray-700'
                                                }`}
                                        >
                                            <ChevronLeft size={20} />
                                        </button>

                                        {getPageNumbers().map((page, index) => (
                                            <button
                                                key={index}
                                                onClick={() => typeof page === 'number' && setCurrentPage(page)}
                                                disabled={page === '...'}
                                                className={`px-3 py-2 rounded-md ${page === currentPage
                                                    ? 'bg-indigo-600 text-white'
                                                    : page === '...'
                                                        ? 'bg-transparent text-gray-400 cursor-default'
                                                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        ))}

                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                            className={`p-2 rounded-md ${currentPage === totalPages
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'bg-gray-800 text-white hover:bg-gray-700'
                                                }`}
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Floating Action Button */}
                <button
                    onClick={() => navigate('/creator/create-experience')}
                    className="fixed bottom-6 right-6 bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 group"
                >
                    <Plus size={20} />
                    <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
                        Add New Activity
                    </span>
                </button>

                {/* Status Change Modal */}
                {statusModalVisible && (
                    <div className="fixed inset-0 bg-black/50 flex items-end lg:items-center justify-center z-50">
                        <div
                            className="bg-white rounded-t-3xl lg:rounded-xl p-6 w-full lg:max-w-md"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800">Change Experience Status</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Select a new status for "{selectedExperience?.title}"
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setStatusModalVisible(false);
                                        setSelectedExperience(null);
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-3">
                                {/* Active Option */}
                                <button
                                    onClick={() => selectedExperience && updateExperienceStatus(selectedExperience.experience_id, 'active')}
                                    disabled={updatingStatus || selectedExperience?.status === 'active'}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-colors ${selectedExperience?.status === 'active'
                                        ? 'bg-green-50 border-green-200'
                                        : 'bg-white border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-green-100 p-2 rounded-full">
                                            <CheckCircle size={24} className="text-green-600" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-medium text-gray-800">Active</p>
                                            <p className="text-xs text-gray-500">Visible to travelers</p>
                                        </div>
                                    </div>
                                    {selectedExperience?.status === 'active' && (
                                        <CheckCircle size={20} className="text-green-600" />
                                    )}
                                </button>

                                {/* Draft Option */}
                                <button
                                    onClick={() => selectedExperience && updateExperienceStatus(selectedExperience.experience_id, 'draft')}
                                    disabled={updatingStatus || selectedExperience?.status === 'draft'}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-colors ${selectedExperience?.status === 'draft'
                                        ? 'bg-yellow-50 border-yellow-200'
                                        : 'bg-white border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-yellow-100 p-2 rounded-full">
                                            <Edit3 size={24} className="text-yellow-600" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-medium text-gray-800">Draft</p>
                                            <p className="text-xs text-gray-500">Work in progress</p>
                                        </div>
                                    </div>
                                    {selectedExperience?.status === 'draft' && (
                                        <CheckCircle size={20} className="text-yellow-600" />
                                    )}
                                </button>

                                {/* Inactive Option */}
                                <button
                                    onClick={() => selectedExperience && updateExperienceStatus(selectedExperience.experience_id, 'inactive')}
                                    disabled={updatingStatus || selectedExperience?.status === 'inactive'}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-colors ${selectedExperience?.status === 'inactive'
                                        ? 'bg-gray-100 border-gray-300'
                                        : 'bg-white border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-gray-200 p-2 rounded-full">
                                            <PauseCircle size={24} className="text-gray-600" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-medium text-gray-800">Inactive</p>
                                            <p className="text-xs text-gray-500">Hidden from travelers</p>
                                        </div>
                                    </div>
                                    {selectedExperience?.status === 'inactive' && (
                                        <CheckCircle size={20} className="text-gray-600" />
                                    )}
                                </button>
                            </div>

                            <button
                                onClick={() => {
                                    setStatusModalVisible(false);
                                    setSelectedExperience(null);
                                }}
                                disabled={updatingStatus}
                                className="w-full mt-6 p-4 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors font-medium text-gray-700"
                            >
                                {updatingStatus ? 'Updating...' : 'Cancel'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreatorExperiences;