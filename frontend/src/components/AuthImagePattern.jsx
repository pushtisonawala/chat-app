//authimagepattern
import React from 'react';

const AuthImagePattern = ({ title, subtitle }) => {
    return (
        <div className='flex flex-col justify-center items-center bg-gray-900 text-white p-6 rounded-lg shadow-lg'>
            {/* Pattern: Tic-Tac-Toe style grid */}
            <div className='grid grid-cols-3 gap-4 mb-4'>
                {Array.from({ length: 9 }).map((_, index) => (
                    <div
                        key={index}
                        className='h-20 w-20 bg-gray-700 border-2 border-gray-600 rounded-lg transition-transform transform hover:scale-105 hover:bg-gray-600'
                    ></div>
                ))}
            </div>

            {/* Title and Subtitle */}
            <h2 className='text-3xl font-semibold mb-2 mt-7'>{title}</h2>
            <p className='text-lg mb-6 '>{subtitle}</p>
        </div>
    );
};

export default AuthImagePattern;