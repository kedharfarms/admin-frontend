import { useState } from 'react';

import axios from 'axios';

import {
    Send,
    Bell,
} from 'lucide-react';

import toast from 'react-hot-toast';

export default function CustomNotification() {
    const BASE_URL =
        process.env.REACT_APP_API_URL;

    const token =
        localStorage.getItem('token');

    const [isExecuting, setIsExecuting] =
        useState(false);

    const [formData, setFormData] =
        useState({
            title: '',
            message: '',
        });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isExecuting) return;

        try {
            if (
                !formData.title ||
                !formData.message
            ) {
                throw new Error(
                    'Please fill all fields'
                );
            }

            setIsExecuting(true);

            await axios({
                method: 'POST',
                url:
                    BASE_URL +
                    '/custom-notifications/send',
                headers: {
                    Authorization: token,
                },
                data: {
                    title:
                        formData.title,
                    message:
                        formData.message,
                },
            });

            toast.success(
                'Notification sent successfully'
            );

            setFormData({
                title: '',
                message: '',
            });
        } catch (error) {
            const message =
                error?.response?.data
                    ?.message ||
                error.message;

            toast.error(message);
        } finally {
            setIsExecuting(false);
        }
    };

    return (
        <div className="p-6">
            {/* HEADER */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold">
                    Custom Notification
                </h1>

                <p className="text-gray-600">
                    Send push notifications
                    to users
                </p>
            </div>

            {/* FORM */}
            <div className="bg-white border rounded-2xl overflow-hidden max-w-3xl">

                {/* BODY */}
                <form
                    onSubmit={
                        handleSubmit
                    }
                    className="p-6 space-y-5"
                >
                    {/* TITLE */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notification Title
                        </label>

                        <input
                            type="text"
                            placeholder="Enter title"
                            value={
                                formData.title
                            }
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    title:
                                        e.target
                                            .value,
                                })
                            }
                            className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* MESSAGE */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Message
                        </label>

                        <textarea
                            rows={6}
                            placeholder="Enter notification message"
                            value={
                                formData.message
                            }
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    message:
                                        e.target
                                            .value,
                                })
                            }
                            className="w-full border rounded-xl px-4 py-3 outline-none resize-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* BUTTON */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={
                                isExecuting
                            }
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl disabled:opacity-50"
                        >
                            <Send size={18} />

                            {isExecuting
                                ? 'Sending...'
                                : 'Send Notification'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}