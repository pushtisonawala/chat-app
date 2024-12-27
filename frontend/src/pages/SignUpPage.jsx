//signup pg
import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore.js';

import { MessageSquare, Mail, Lock, Eye, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuthImagePattern from '../components/AuthImagePattern.jsx';
import toast from 'react-hot-toast';

const SignUpPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
    });
    const { signup, isSigningUp } = useAuthStore();
    const loading = isSigningUp;

    const validateForm = () => {
        if (!formData.fullName.trim()) {
            toast.error("Full name is required");
            return false;
        }

        if (!formData.email.trim()) {
            toast.error("Email is required");
            return false;
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(formData.email)) {
            toast.error("Please enter a valid email address");
            return false;
        }

        if (!formData.password) {
            toast.error("Password is required");
            return false;
        }

        if (formData.password.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return false;
        }

        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const isValid = validateForm();
        if (isValid) {
            console.log("Form Data before submitting:", formData); // Debugging log
            signup(formData);
        }
    };

    return (
        <div className='min-h-screen bg-gray-800 text-gray-200 grid lg:grid-cols-2'>
            {/* Left Column: Sign-Up Form */}
            <div className='flex flex-col justify-center items-center p-6 sm:p-12 mt-10'>
                <div className='w-full max-w-md space-y-8'>
                    <div className='text-center mb-8'>
                        <div className='flex flex-col items-center gap-2 group'>
                            <div className='size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors'>
                                <MessageSquare className='size-6 text-primary' />
                            </div>
                            <h1 className='text-3xl font-bold mt-2 text-white'>Create Account</h1>
                            <p className='text-gray-400'>Get started with your account</p>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Full Name */}
                        <div className='relative'>
                            <label className='label p-2'>
                                <span className='text-base label-text text-gray-300'>Full Name</span>
                            </label>
                            <div className='flex items-center'>
                                <User className='absolute left-2 text-gray-400' />
                                <input
                                    type='text'
                                    placeholder='Pushti Sonawala'
                                    className='w-full input input-bordered h-10 pl-10 bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-primary'
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className='relative'>
                            <label className='label p-2'>
                                <span className='text-base label-text text-gray-300'>Email</span>
                            </label>
                            <div className='flex items-center'>
                                <Mail className='absolute left-2 text-gray-400' />
                                <input
                                    type='email'
                                    placeholder='pushtisonawala@email.com'
                                    className='w-full input input-bordered h-10 pl-10 bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-primary'
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className='relative'>
                            <label className='label'>
                                <span className='text-base label-text text-gray-300'>Password</span>
                            </label>
                            <div className='flex items-center'>
                                <Lock className='absolute left-2 text-gray-400' />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder='Enter Password'
                                    className='w-full input input-bordered h-10 pl-10 bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-primary'
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                <Eye
                                    className='absolute right-2 text-gray-400 cursor-pointer'
                                    onClick={() => setShowPassword(!showPassword)}
                                />
                            </div>
                        </div>

                        <Link
                            to={"/login"}
                            className='text-sm hover:underline hover:text-blue-400 mt-2 inline-block'
                        >
                            Already have an account?
                        </Link>

                        <div>
                            <button className='btn btn-block btn-sm mt-2 bg-primary text-white hover:bg-primary/80' disabled={loading}>
                                {loading ? <span className='loading loading-spinner'></span> : "Sign Up"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Right Column: AuthImagePattern */}
            <AuthImagePattern 
                title="Join Our Community" 
                subtitle="Connect with friends, share moments, and stay in touch." 
            />
        </div>
    );
};

export default SignUpPage;
