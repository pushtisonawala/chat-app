
import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { MessageSquare, Mail, Lock, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuthImagePattern from '../components/AuthImagePattern';
import toast from 'react-hot-toast';

const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const { login, isLoggingIn } = useAuthStore();
    const loading = isLoggingIn;

    const validateForm = () => {
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

        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const isValid = validateForm();
        if (isValid) {
            console.log("Login Data before submitting:", formData); 
            login(formData);
        }
    };

    return (
        <div className='min-h-screen bg-gray-800 text-gray-200 grid lg:grid-cols-2'>
            
            <div className='flex flex-col justify-center items-center p-6 sm:p-12 mt-10'>
                <div className='w-full max-w-md space-y-8'>
                    <div className='text-center mb-8'>
                        <div className='flex flex-col items-center gap-2 group'>
                            <div className='size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors'>
                                <MessageSquare className='size-6 text-primary' />
                            </div>
                            <h1 className='text-3xl font-bold mt-2 text-white'>Welcome Back</h1>
                            <p className='text-gray-400'>Login to your account</p>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className='relative'>
                            <label className='label p-2'>
                                <span className='text-base label-text text-gray-300'>Email</span>
                            </label>
                            <div className='flex items-center'>
                                <Mail className='absolute left-2 text-gray-400' />
                                <input
                                    type='email'
                                    placeholder='example@email.com'
                                    className='w-full input input-bordered h-10 pl-10 bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-primary'
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

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
                            to={"/signup"}
                            className='text-sm hover:underline hover:text-blue-400 mt-2 inline-block'
                        >
                            Don’t have an account? Sign Up
                        </Link>

                        <div>
                            <button className='btn btn-block btn-sm mt-2 bg-primary text-white hover:bg-primary/80' disabled={loading}>
                                {loading ? <span className='loading loading-spinner'></span> : "Login"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <AuthImagePattern 
                title="Welcome Back to Chatterly" 
                subtitle="Stay connected with your friends and the community." 
            />
        </div>
    );
};

export default LoginPage;
