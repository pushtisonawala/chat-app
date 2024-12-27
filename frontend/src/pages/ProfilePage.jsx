import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { Camera } from 'lucide-react';
import { toast } from 'react-hot-toast';
import avatarPlaceholder from '/avatar.jpg';

const ProfilePage = () => {
    const { authUser , isUpdatingProfile, updateProfile } = useAuthStore();
    const [image, setImage] = useState(null);
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
        toast.error("No file selected.");
        return;
    }

    const formData = new FormData();
    formData.append("profilePic", file);

    try {
        await updateProfile(formData); 
        setImage(URL.createObjectURL(file));
        toast.success("Profile picture updated successfully!");
    } catch (error) {
        console.error("Error updating profile picture:", error);
        toast.error("Failed to update profile picture. Please try again.");
    }
};

    return (
        <div className="h-screen-200 pt-20 bg-gray-600 dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-3xl mx-auto p-4 py-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg space-y-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Profile</h1>
                        <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">Update your profile information</p>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <img
                                src={image || authUser ?.profilePic || avatarPlaceholder}
                                alt="Profile"
                                className="w-32 h-32 rounded-full object-cover border-4 border-gray-300 dark:border-gray-700 shadow-md"
                            />
                            <label
                                htmlFor="avatar-upload"
                                className={`absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 p-2 rounded-full cursor-pointer transition-all duration-200 ${isUpdatingProfile ? 'animate-pulse pointer-events-none' : ''}`}
                            >
                                <Camera className="text-white w-6 h-6" />
                                <input
                                    type="file"
                                    id="avatar-upload"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={isUpdatingProfile}
                                />
                            </label>
                        </div>
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                            {isUpdatingProfile ? 'Uploading...' : 'Click the camera to upload your picture'}
                        </p>
                    </div>

                    <div className="mt-8">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Account Info</h2>
                        <div className="space-y-4 mt-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-300">Name:</span>
                                <span className="text-sm font-semibold text-gray-800 dark:text-white">{authUser ?.fullName || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-300">Email:</span>
                                <span className="text-sm font-semibold text-gray-800 dark:text-white truncate">{authUser ?.email || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 bg-base-300 dark:bg-gray-700 rounded-xl p-6">
                        <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Account Information</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between py-2 border-b border-zinc-700 dark:border-zinc-600">
                                <span>Member Since</span>
                                <span>{authUser ?.createdAt?.split("T")[0]}</span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span>Account Status</span>
                                <span className="text-green-500">Active</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;