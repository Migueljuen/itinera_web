// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//     Search,
//     Heart,
//     MapPin,
//     Star,
//     Edit,
//     ChevronLeft,
//     ChevronRight,
//     Plus,
//     CheckCircle,
//     Edit3,
//     PauseCircle,
//     ChevronDown,
//     X,
//     Image as ImageIcon
// } from 'lucide-react';
// import axios from 'axios';
// import { useAuth } from '../../contexts/AuthContext';
// import API_URL from '../../constants/api';

// const ITEMS_PER_PAGE = 5;

// const CreatorExperiences = () => {
//     const navigate = useNavigate();
//     const { user, token } = useAuth();
//     const [loading, setLoading] = useState(false);
//     const [searchText, setSearchText] = useState('');
//     const [selectedTab, setSelectedTab] = useState('Active');
//     const [myExperiences, setMyExperiences] = useState([]);
//     const [currentPage, setCurrentPage] = useState(1);
//     const [statusModalVisible, setStatusModalVisible] = useState(false);
//     const [selectedExperience, setSelectedExperience] = useState(null);
//     const [updatingStatus, setUpdatingStatus] = useState(false);

//     // Function to fetch experiences
//     const fetchExperiences = async () => {
//         if (!user?.user_id) return;

//         try {
//             setLoading(true);
//             const response = await axios.get(`${API_URL}/experience/user/${user.user_id}`);
//             setMyExperiences(response.data);
//         } catch (error) {
//             console.error('Error fetching experiences:', error);
//             setMyExperiences([]);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Initial data loading
//     useEffect(() => {
//         if (user?.user_id) {
//             fetchExperiences();
//         }
//     }, [user]);

//     // Reset to first page when tab or search changes
//     useEffect(() => {
//         setCurrentPage(1);
//     }, [selectedTab, searchText]);

//     const filteredExperiences = myExperiences.filter(exp => {
//         const matchesSearch = exp.title.toLowerCase().includes(searchText.toLowerCase()) ||
//             exp.destination_name.toLowerCase().includes(searchText.toLowerCase());
//         const matchesTab = selectedTab === 'All' || exp.status.toLowerCase() === selectedTab.toLowerCase();
//         return matchesSearch && matchesTab;
//     });

//     // Calculate pagination
//     const totalPages = Math.ceil(filteredExperiences.length / ITEMS_PER_PAGE);
//     const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
//     const endIndex = startIndex + ITEMS_PER_PAGE;
//     const paginatedExperiences = filteredExperiences.slice(startIndex, endIndex);

//     // Generate page numbers to display
//     const getPageNumbers = () => {
//         const pages = [];
//         const maxPagesToShow = 5;

//         if (totalPages <= maxPagesToShow) {
//             for (let i = 1; i <= totalPages; i++) {
//                 pages.push(i);
//             }
//         } else {
//             if (currentPage <= 3) {
//                 for (let i = 1; i <= 4; i++) {
//                     pages.push(i);
//                 }
//                 pages.push('...');
//                 pages.push(totalPages);
//             } else if (currentPage >= totalPages - 2) {
//                 pages.push(1);
//                 pages.push('...');
//                 for (let i = totalPages - 3; i <= totalPages; i++) {
//                     pages.push(i);
//                 }
//             } else {
//                 pages.push(1);
//                 pages.push('...');
//                 pages.push(currentPage - 1);
//                 pages.push(currentPage);
//                 pages.push(currentPage + 1);
//                 pages.push('...');
//                 pages.push(totalPages);
//             }
//         }
//         return pages;
//     };

//     const tabs = ['All', 'Active', 'Draft', 'Inactive'];

//     // Function to update experience status
//     const updateExperienceStatus = async (experienceId, newStatus) => {
//         try {
//             setUpdatingStatus(true);

//             const response = await axios.patch(
//                 `${API_URL}/experience/${experienceId}/status`,
//                 { status: newStatus },
//                 {
//                     headers: {
//                         'Authorization': `Bearer ${token}`,
//                         'Content-Type': 'application/json'
//                     }
//                 }
//             );

//             if (response.status === 200) {
//                 setMyExperiences(prevExperiences =>
//                     prevExperiences.map(exp =>
//                         exp.experience_id === experienceId
//                             ? { ...exp, status: newStatus }
//                             : exp
//                     )
//                 );
//                 alert(`Experience status updated to ${newStatus}`);
//             }
//         } catch (error) {
//             console.error('Error updating experience status:', error);
//             if (error.response?.status === 500) {
//                 await fetchExperiences();
//             }
//             alert('Failed to update experience status. Please try again.');
//         } finally {
//             setUpdatingStatus(false);
//             setStatusModalVisible(false);
//             setSelectedExperience(null);
//         }
//     };

//     // Function to handle status badge click
//     const handleStatusClick = (experience) => {
//         setSelectedExperience(experience);
//         setStatusModalVisible(true);
//     };

//     if (loading && myExperiences.length === 0) {
//         return (
//             <div className="flex-1 flex justify-center items-center min-h-screen bg-gray-50">
//                 <div className="text-center">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
//                     <p className="mt-4 text-gray-600">Loading your experiences...</p>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-gray-50">
//             <div className="container mx-auto px-4 lg:px-8 py-6 lg:py-8 max-w-7xl">
//                 {/* Header */}
//                 <div className="flex items-center justify-between mb-6">
//                     <div>
//                         <h1 className="text-2xl lg:text-3xl font-semibold text-gray-800">Your Activities</h1>
//                         <p className="text-gray-400 mt-1">Manage your Activities</p>
//                     </div>

//                 </div>

//                 {/* Search Bar */}
//                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 flex items-center gap-3">
//                     <Search className="text-gray-400" size={20} />
//                     <input
//                         type="text"
//                         placeholder="Search your experiences"
//                         className="flex-1 outline-none text-gray-800"
//                         value={searchText}
//                         onChange={(e) => setSearchText(e.target.value)}
//                     />
//                     <Heart className="text-gray-400" size={20} />
//                 </div>

//                 {/* My Activities Section */}
//                 <div className="mb-8">
//                     <h2 className="text-xl font-medium mb-4">My Activities</h2>

//                     {/* Tabs */}
//                     <div className="flex gap-3 overflow-x-auto pb-2">
//                         {tabs.map((tab) => {
//                             const isSelected = selectedTab === tab;
//                             return (
//                                 <button
//                                     key={tab}
//                                     onClick={() => setSelectedTab(tab)}
//                                     className={`px-6 py-2 rounded-full whitespace-nowrap transition-colors ${isSelected
//                                         ? 'bg-gray-800 text-white'
//                                         : 'bg-white text-gray-400 hover:bg-gray-100'
//                                         }`}
//                                 >
//                                     {tab}
//                                 </button>
//                             );
//                         })}
//                     </div>
//                 </div>

//                 {/* Experiences List */}
//                 <div className="space-y-4">
//                     {loading ? (
//                         <div className="py-8 text-center">
//                             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
//                             <p className="mt-2 text-gray-500">Updating...</p>
//                         </div>
//                     ) : filteredExperiences.length === 0 ? (
//                         <div className="py-16 text-center">
//                             <p className="text-gray-500 text-lg font-medium">No experiences found</p>
//                             <p className="text-gray-400 mt-2">
//                                 {selectedTab === 'All'
//                                     ? "You haven't created any experiences yet"
//                                     : `No ${selectedTab.toLowerCase()} experiences found`}
//                             </p>
//                             {selectedTab === 'All' && (
//                                 <button
//                                     onClick={() => navigate('/creator/create-experience')}
//                                     className="mt-8 bg-indigo-600 text-white rounded-full px-8 py-4 flex items-center gap-3 mx-auto hover:bg-indigo-700 transition-colors"
//                                 >
//                                     <Plus size={16} />
//                                     <span>Create First Experience</span>
//                                 </button>
//                             )}
//                         </div>
//                     ) : (
//                         <>
//                             {paginatedExperiences.map((item) => (
//                                 <div
//                                     key={item.experience_id}
//                                     className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
//                                     onClick={() => navigate(`/experience/${item.experience_id}`)}
//                                 >
//                                     <div className="lg:flex">
//                                         {/* Image Section */}
//                                         <div className="relative lg:w-64 h-48 lg:h-auto">
//                                             {item.images && item.images.length > 0 ? (
//                                                 <img
//                                                     src={`${API_URL}${item.images[0]}`}
//                                                     alt={item.title}
//                                                     className="w-full h-full object-cover"
//                                                 />
//                                             ) : (
//                                                 <div className="w-full h-full bg-gray-200 flex items-center justify-center">
//                                                     <ImageIcon size={40} className="text-gray-400" />
//                                                 </div>
//                                             )}

//                                             {/* Price Badge */}
//                                             <div className="absolute top-2 right-2 bg-white/90 px-3 py-1 rounded-md shadow-sm">
//                                                 <span className="font-medium">
//                                                     {item.price === "0" || !item.price ? 'Free' : `₱${item.price}`}
//                                                 </span>
//                                             </div>

//                                             {/* Status Badge - Clickable */}
//                                             <button
//                                                 onClick={(e) => {
//                                                     e.stopPropagation();
//                                                     handleStatusClick(item);
//                                                 }}
//                                                 className={`absolute top-2 left-2 px-3 py-1 rounded-md flex items-center gap-1 ${item.status === 'active' ? 'bg-green-100 text-green-600' :
//                                                     item.status === 'draft' ? 'bg-yellow-100 text-yellow-600' :
//                                                         'bg-gray-100 text-gray-600'
//                                                     }`}
//                                             >
//                                                 <span className="text-xs font-medium capitalize">{item.status}</span>
//                                                 <ChevronDown size={12} />
//                                             </button>
//                                         </div>

//                                         {/* Content Section */}
//                                         <div className="flex-1 p-4 lg:p-6">
//                                             <h3 className="text-lg font-semibold mb-2">{item.title}</h3>

//                                             {/* Location */}
//                                             <div className="flex items-center gap-1 text-gray-600 mb-3">
//                                                 <MapPin size={16} className="text-indigo-600" />
//                                                 <span className="text-sm">{item.destination_name}</span>
//                                             </div>

//                                             {/* Tags */}
//                                             {item.tags && item.tags.length > 0 && (
//                                                 <div className="flex flex-wrap gap-2 mb-4">
//                                                     {item.tags.slice(0, 3).map((tag, index) => (
//                                                         <span key={index} className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-md text-xs font-medium">
//                                                             {tag}
//                                                         </span>
//                                                     ))}
//                                                 </div>
//                                             )}

//                                             {/* Stats and Actions */}
//                                             <div className="flex items-center justify-between pt-4 border-t border-gray-100">
//                                                 <div className="flex items-center gap-4">
//                                                     <div className="flex items-center gap-1 text-gray-500">
//                                                         <Heart size={14} />
//                                                         <span className="text-xs">{item.bookings || 0} bookings</span>
//                                                     </div>
//                                                     {item.rating > 0 && (
//                                                         <div className="flex items-center gap-1 text-gray-500">
//                                                             <Star size={14} className="text-yellow-500 fill-yellow-500" />
//                                                             <span className="text-xs">{item.rating}</span>
//                                                         </div>
//                                                     )}
//                                                 </div>

//                                                 <button
//                                                     onClick={(e) => {
//                                                         e.stopPropagation();
//                                                         navigate(`/creator/edit-experience/${item.experience_id}`);
//                                                     }}
//                                                     className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full flex items-center gap-1 hover:bg-indigo-100 transition-colors"
//                                                 >
//                                                     <Edit size={14} />
//                                                     <span className="text-sm font-medium">Edit</span>
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             ))}

//                             {/* Pagination */}
//                             {totalPages > 1 && (
//                                 <div className="mt-8">
//                                     <p className="text-center text-gray-500 text-sm mb-4">
//                                         Showing {startIndex + 1}-{Math.min(endIndex, filteredExperiences.length)} of {filteredExperiences.length} experiences
//                                     </p>

//                                     <div className="flex justify-center items-center gap-2">
//                                         <button
//                                             onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
//                                             disabled={currentPage === 1}
//                                             className={`p-2 rounded-md ${currentPage === 1
//                                                 ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
//                                                 : 'bg-gray-800 text-white hover:bg-gray-700'
//                                                 }`}
//                                         >
//                                             <ChevronLeft size={20} />
//                                         </button>

//                                         {getPageNumbers().map((page, index) => (
//                                             <button
//                                                 key={index}
//                                                 onClick={() => typeof page === 'number' && setCurrentPage(page)}
//                                                 disabled={page === '...'}
//                                                 className={`px-3 py-2 rounded-md ${page === currentPage
//                                                     ? 'bg-indigo-600 text-white'
//                                                     : page === '...'
//                                                         ? 'bg-transparent text-gray-400 cursor-default'
//                                                         : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
//                                                     }`}
//                                             >
//                                                 {page}
//                                             </button>
//                                         ))}

//                                         <button
//                                             onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
//                                             disabled={currentPage === totalPages}
//                                             className={`p-2 rounded-md ${currentPage === totalPages
//                                                 ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
//                                                 : 'bg-gray-800 text-white hover:bg-gray-700'
//                                                 }`}
//                                         >
//                                             <ChevronRight size={20} />
//                                         </button>
//                                     </div>
//                                 </div>
//                             )}
//                         </>
//                     )}
//                 </div>

//                 {/* Floating Action Button */}
//                 <button
//                     onClick={() => navigate('/creator/create-experience')}
//                     className="fixed bottom-6 right-6 bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 group"
//                 >
//                     <Plus size={20} />
//                     <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
//                         Add New Activity
//                     </span>
//                 </button>

//                 {/* Status Change Modal */}
//                 {statusModalVisible && (
//                     <div className="fixed inset-0 bg-black/50 flex items-end lg:items-center justify-center z-50">
//                         <div
//                             className="bg-white rounded-t-3xl lg:rounded-xl p-6 w-full lg:max-w-md"
//                             onClick={(e) => e.stopPropagation()}
//                         >
//                             <div className="flex justify-between items-center mb-6">
//                                 <div>
//                                     <h3 className="text-xl font-semibold text-gray-800">Change Experience Status</h3>
//                                     <p className="text-sm text-gray-500 mt-1">
//                                         Select a new status for "{selectedExperience?.title}"
//                                     </p>
//                                 </div>
//                                 <button
//                                     onClick={() => {
//                                         setStatusModalVisible(false);
//                                         setSelectedExperience(null);
//                                     }}
//                                     className="p-2 hover:bg-gray-100 rounded-lg"
//                                 >
//                                     <X size={20} />
//                                 </button>
//                             </div>

//                             <div className="space-y-3">
//                                 {/* Active Option */}
//                                 <button
//                                     onClick={() => selectedExperience && updateExperienceStatus(selectedExperience.experience_id, 'active')}
//                                     disabled={updatingStatus || selectedExperience?.status === 'active'}
//                                     className={`w-full flex items-center justify-between p-4 rounded-xl border transition-colors ${selectedExperience?.status === 'active'
//                                         ? 'bg-green-50 border-green-200'
//                                         : 'bg-white border-gray-200 hover:bg-gray-50'
//                                         }`}
//                                 >
//                                     <div className="flex items-center gap-3">
//                                         <div className="bg-green-100 p-2 rounded-full">
//                                             <CheckCircle size={24} className="text-green-600" />
//                                         </div>
//                                         <div className="text-left">
//                                             <p className="font-medium text-gray-800">Active</p>
//                                             <p className="text-xs text-gray-500">Visible to travelers</p>
//                                         </div>
//                                     </div>
//                                     {selectedExperience?.status === 'active' && (
//                                         <CheckCircle size={20} className="text-green-600" />
//                                     )}
//                                 </button>

//                                 {/* Draft Option */}
//                                 <button
//                                     onClick={() => selectedExperience && updateExperienceStatus(selectedExperience.experience_id, 'draft')}
//                                     disabled={updatingStatus || selectedExperience?.status === 'draft'}
//                                     className={`w-full flex items-center justify-between p-4 rounded-xl border transition-colors ${selectedExperience?.status === 'draft'
//                                         ? 'bg-yellow-50 border-yellow-200'
//                                         : 'bg-white border-gray-200 hover:bg-gray-50'
//                                         }`}
//                                 >
//                                     <div className="flex items-center gap-3">
//                                         <div className="bg-yellow-100 p-2 rounded-full">
//                                             <Edit3 size={24} className="text-yellow-600" />
//                                         </div>
//                                         <div className="text-left">
//                                             <p className="font-medium text-gray-800">Draft</p>
//                                             <p className="text-xs text-gray-500">Work in progress</p>
//                                         </div>
//                                     </div>
//                                     {selectedExperience?.status === 'draft' && (
//                                         <CheckCircle size={20} className="text-yellow-600" />
//                                     )}
//                                 </button>

//                                 {/* Inactive Option */}
//                                 <button
//                                     onClick={() => selectedExperience && updateExperienceStatus(selectedExperience.experience_id, 'inactive')}
//                                     disabled={updatingStatus || selectedExperience?.status === 'inactive'}
//                                     className={`w-full flex items-center justify-between p-4 rounded-xl border transition-colors ${selectedExperience?.status === 'inactive'
//                                         ? 'bg-gray-100 border-gray-300'
//                                         : 'bg-white border-gray-200 hover:bg-gray-50'
//                                         }`}
//                                 >
//                                     <div className="flex items-center gap-3">
//                                         <div className="bg-gray-200 p-2 rounded-full">
//                                             <PauseCircle size={24} className="text-gray-600" />
//                                         </div>
//                                         <div className="text-left">
//                                             <p className="font-medium text-gray-800">Inactive</p>
//                                             <p className="text-xs text-gray-500">Hidden from travelers</p>
//                                         </div>
//                                     </div>
//                                     {selectedExperience?.status === 'inactive' && (
//                                         <CheckCircle size={20} className="text-gray-600" />
//                                     )}
//                                 </button>
//                             </div>

//                             <button
//                                 onClick={() => {
//                                     setStatusModalVisible(false);
//                                     setSelectedExperience(null);
//                                 }}
//                                 disabled={updatingStatus}
//                                 className="w-full mt-6 p-4 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors font-medium text-gray-700"
//                             >
//                                 {updatingStatus ? 'Updating...' : 'Cancel'}
//                             </button>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default CreatorExperiences;

import React, { useState } from 'react';
import {
    Search,
    Plus,
    Edit3,
    Eye,
    EyeOff,
    Trash2,
    Calendar,
    Clock,
    Users,
    MapPin,
    Star,
    ChevronLeft,
    ChevronRight,
    Filter,
    Download,
    MoreHorizontal,
    ImageIcon
} from 'lucide-react';

const ExperienceManagement = () => {
    const [searchText, setSearchText] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);

    // Sample data
    const [experiences, setExperiences] = useState([
        {
            id: 1,
            title: "Catch Fireflies in the Mountains",
            category: "Nature",
            price: 1200,
            duration: "3 hours",
            difficulty: "Easy",
            status: "Published",
            rating: 4.8,
            bookings: 45,
            availability: "Daily",
            location: "Mount Banahaw",
            tags: ["Nature", "Evening", "Family-friendly"]
        },
        {
            id: 2,
            title: "Learn Pottery with Locals",
            category: "Cultural",
            price: 800,
            duration: "2 hours",
            difficulty: "Beginner",
            status: "Published",
            rating: 4.9,
            bookings: 32,
            availability: "Weekends",
            location: "Rizal Province",
            tags: ["Cultural", "Hands-on", "Art"]
        },
        {
            id: 3,
            title: "Sunrise Hiking Adventure",
            category: "Adventure",
            price: 1500,
            duration: "5 hours",
            difficulty: "Moderate",
            status: "Draft",
            rating: 0,
            bookings: 0,
            availability: "Daily",
            location: "Mount Purro",
            tags: ["Adventure", "Hiking", "Photography"]
        },
        {
            id: 4,
            title: "Traditional Cooking Class",
            category: "Culinary",
            price: 950,
            duration: "3 hours",
            difficulty: "Easy",
            status: "Inactive",
            rating: 4.6,
            bookings: 28,
            availability: "Tue-Sun",
            location: "Local Village",
            tags: ["Culinary", "Traditional", "Interactive"]
        },
        {
            id: 5,
            title: "River Tubing Experience",
            category: "Adventure",
            price: 2000,
            duration: "4 hours",
            difficulty: "Moderate",
            status: "Published",
            rating: 4.7,
            bookings: 18,
            availability: "Weekends",
            location: "Pagsanjan River",
            tags: ["Adventure", "Water Sports", "Thrilling"]
        }
    ]);

    const statuses = ['All', 'Published', 'Draft', 'Inactive'];
    const categories = ['All', 'Nature', 'Cultural', 'Adventure', 'Culinary'];
    const itemsPerPage = 10;

    const filteredExperiences = experiences.filter(exp => {
        const matchesSearch = exp.title.toLowerCase().includes(searchText.toLowerCase()) ||
            exp.location.toLowerCase().includes(searchText.toLowerCase());
        const matchesStatus = selectedStatus === 'All' || exp.status === selectedStatus;
        const matchesCategory = selectedCategory === 'All' || exp.category === selectedCategory;
        return matchesSearch && matchesStatus && matchesCategory;
    });

    const totalPages = Math.ceil(filteredExperiences.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedExperiences = filteredExperiences.slice(startIndex, startIndex + itemsPerPage);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Published': return 'bg-green-100 text-green-700';
            case 'Draft': return 'bg-yellow-100 text-yellow-700';
            case 'Inactive': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return 'bg-green-50 text-green-600';
            case 'Moderate': return 'bg-yellow-50 text-yellow-600';
            case 'Hard': return 'bg-red-50 text-red-600';
            default: return 'bg-gray-50 text-gray-600';
        }
    };

    const handleStatusChange = (experienceId, newStatus) => {
        setExperiences(prev =>
            prev.map(exp =>
                exp.id === experienceId ? { ...exp, status: newStatus } : exp
            )
        );
    };

    const handleDelete = (experienceId) => {
        if (window.confirm('Are you sure you want to delete this experience?')) {
            setExperiences(prev => prev.filter(exp => exp.id !== experienceId));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Experience Management</h1>
                        <p className="text-gray-600 mt-1">Manage your experiential offerings</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                            <Download size={16} />
                            Export
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <Plus size={16} />
                            Add Experience
                        </button>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search experiences..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex gap-3">
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                {statuses.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>

                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                {categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>

                            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                <Filter size={16} />
                                Filter
                            </button>
                        </div>
                    </div>
                </div>

                {/* Experiences Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    {/* Table Header */}
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                            <div className="col-span-1">
                                <input type="checkbox" className="rounded" />
                            </div>
                            <div className="col-span-4">Experience Name</div>
                            <div className="col-span-1">Category</div>
                            <div className="col-span-1">Availability</div>
                            <div className="col-span-1">Price</div>
                            <div className="col-span-2">Status</div>
                            <div className="col-span-2">Actions</div>
                        </div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-gray-200">
                        {paginatedExperiences.map((experience) => (
                            <div key={experience.id} className="px-6 py-4 hover:bg-gray-50">
                                <div className="grid grid-cols-12 gap-4 items-center">
                                    {/* Checkbox */}
                                    <div className="col-span-1">
                                        <input type="checkbox" className="rounded" />
                                    </div>

                                    {/* Experience Info */}
                                    <div className="col-span-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                                <ImageIcon size={24} className="text-gray-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-900">{experience.title}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <MapPin size={14} className="text-gray-400" />
                                                    <span className="text-sm text-gray-600">{experience.location}</span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Clock size={14} className="text-gray-400" />
                                                    <span className="text-sm text-gray-600">{experience.duration}</span>
                                                    <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(experience.difficulty)}`}>
                                                        {experience.difficulty}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Category */}
                                    <div className="col-span-1">
                                        <span className="text-sm text-gray-600">{experience.category}</span>
                                    </div>

                                    {/* Availability */}
                                    <div className="col-span-1">
                                        <span className="text-sm text-gray-600">{experience.availability}</span>
                                    </div>

                                    {/* Price */}
                                    <div className="col-span-1">
                                        <span className="font-medium">₱{experience.price.toLocaleString()}</span>
                                    </div>

                                    {/* Status */}
                                    <div className="col-span-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(experience.status)}`}>
                                                {experience.status}
                                            </span>
                                            {experience.rating > 0 && (
                                                <div className="flex items-center gap-1">
                                                    <Star size={14} className="text-yellow-400 fill-current" />
                                                    <span className="text-sm text-gray-600">{experience.rating}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 mt-1">
                                            <Users size={14} className="text-gray-400" />
                                            <span className="text-sm text-gray-600">{experience.bookings} bookings</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="col-span-2">
                                        <div className="flex items-center gap-2">
                                            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                                                <Edit3 size={16} />
                                            </button>
                                            <button
                                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
                                                onClick={() => handleStatusChange(experience.id, experience.status === 'Published' ? 'Inactive' : 'Published')}
                                            >
                                                {experience.status === 'Published' ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                            <button
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                                onClick={() => handleDelete(experience.id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded">
                                                <MoreHorizontal size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Tags */}
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {experience.tags.map((tag, index) => (
                                        <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-6 flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredExperiences.length)} of {filteredExperiences.length} experiences
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={16} />
                            </button>

                            {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                const page = i + 1;
                                return (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-3 py-2 border rounded-lg ${currentPage === page
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Experiences</p>
                                <p className="text-2xl font-semibold text-gray-900">{experiences.length}</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-full">
                                <Calendar className="text-blue-600" size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Published</p>
                                <p className="text-2xl font-semibold text-green-600">
                                    {experiences.filter(exp => exp.status === 'Published').length}
                                </p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-full">
                                <Eye className="text-green-600" size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Bookings</p>
                                <p className="text-2xl font-semibold text-purple-600">
                                    {experiences.reduce((sum, exp) => sum + exp.bookings, 0)}
                                </p>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-full">
                                <Users className="text-purple-600" size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Average Rating</p>
                                <p className="text-2xl font-semibold text-yellow-600">
                                    {(experiences.filter(exp => exp.rating > 0).reduce((sum, exp) => sum + exp.rating, 0) /
                                        experiences.filter(exp => exp.rating > 0).length || 0).toFixed(1)}
                                </p>
                            </div>
                            <div className="bg-yellow-100 p-3 rounded-full">
                                <Star className="text-yellow-600" size={24} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExperienceManagement;