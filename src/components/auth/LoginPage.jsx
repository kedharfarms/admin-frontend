import { useState } from "react";
import axios from "axios";
import { Eye, EyeOff, Milk, Sprout, Leaf } from "lucide-react";

export function LoginPage({ onLogin }) {
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const BASE_URL = process.env.REACT_APP_API_URL;

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios({
                method: "POST",
                url: `${BASE_URL}/auth/admin-login`,
                data: {
                    username,
                    password,
                },
            });

            const token = response?.data?.data?.token;

            if(!token){
                throw new Error('Invalid Token or Token not found')
            }

            localStorage.setItem("token", token);

            onLogin();

        } catch (error) {
            console.error(error);

            const message =
                error.response?.data?.message || error?.message;

            alert(message);
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            {/* Left Side */}
            <div className="lg:w-1/2 bg-gradient-to-br from-[#E8F5E9] to-white relative overflow-hidden p-8 lg:p-16 flex items-center justify-center">
                <div className="absolute top-10 right-10 opacity-10">
                    <Leaf className="w-64 h-64 text-[#2E7D32] rotate-12" />
                </div>

                <div className="relative z-10 max-w-md">
                    <h1 className="text-4xl font-bold text-[#2E7D32] mb-4">
                        Welcome Back
                    </h1>
                    <p className="text-lg text-gray-700 mb-12">
                        Manage subscriptions, deliveries, and farm operations efficiently.
                    </p>
                </div>
            </div>

            {/* Right Side */}
            <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-gray-50">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-[#2E7D32] mb-2">
                                KedharFarms
                            </h2>
                            <p className="text-gray-600 font-medium">Admin Dashboard</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Username */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border-2 border-[#E8F5E9] focus:border-[#2E7D32] focus:outline-none"
                                    placeholder="Enter username"
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border-2 border-[#E8F5E9] focus:border-[#2E7D32] focus:outline-none pr-12"
                                        placeholder="Enter your password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                    >
                                        {showPassword ? <EyeOff /> : <Eye />}
                                    </button>
                                </div>
                            </div>

                            {/* Login Button */}
                            <button
                                type="submit"
                                className="w-full bg-[#2E7D32] text-white py-3 rounded-lg"
                            >
                                Login to Dashboard
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}