import { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle } from "lucide-react";
import { useParams } from "react-router-dom";
import { formatISTTime } from "../utils/utils";

export function OrderDetails() {
    const { id } = useParams();

    const BASE_URL = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("token");

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchOrderDetails = async (orderId) => {
        try {
            setLoading(true);

            const res = await axios.get(
                `${BASE_URL}/order-management/${orderId}`,
                {
                    headers: { Authorization: token },
                }
            );

            setData(res.data?.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchOrderDetails(id);
    }, [id]);

    const getStatusBadge = (status) => {
        const map = {
            DELIVERED: "bg-green-100 text-green-700",
            CANCELLED: "bg-gray-200 text-gray-700",
            REJECTED: "bg-red-100 text-red-700",
            PROCESSING: "bg-blue-100 text-blue-700",
            OUT_FOR_DELIVERY: "bg-yellow-100 text-yellow-700",
        };
        return map[status] || "bg-gray-100 text-gray-700";
    };

    if (loading) {
        return <div className="p-8 text-gray-400">Loading order...</div>;
    }

    if (!data) return null;

    const {
        order_no,
        current_status,
        created_at,
        total_amount,
        delivery_charges,
        payment_status,
        items = [],
        user,
        delivery_address,
        status_logs = [],
    } = data;

    return (
    <div className="p-6 max-w-7xl mx-auto">
    {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-2xl font-semibold">
                    Order #{order_no}
                </h1>
                <p className="text-sm text-gray-500">
                    {new Date(created_at).toLocaleString()}
                </p>
            </div>

            <span
                className={`px-3 py-1 rounded-full text-sm ${getStatusBadge(
                    current_status
                )}`}
            >
                {current_status.replaceAll("_", " ")}
            </span>
        </div>

    {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT SIDE (70%) */}
            <div className="lg:col-span-8 space-y-6">
                
                {/* CUSTOMER + ADDRESS */}
                <div className="grid md:grid-cols-2 gap-6">
                    <Card title="Customer">
                        <p className="font-medium">{user?.name}</p>
                        <p className="text-sm text-gray-500">
                            {user?.phone_number}
                        </p>
                    </Card>

                    <Card title="Delivery Address">
                        <p className="font-medium">
                            {delivery_address?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                            {delivery_address?.house},{" "}
                            {delivery_address?.street}
                        </p>
                        <p className="text-sm text-gray-500">
                            {delivery_address?.city}
                        </p>
                    </Card>
                </div>

                {/* ITEMS */}
                <div className="bg-white border rounded-xl p-5 shadow-sm">
                    <h3 className="font-medium mb-4">Items</h3>

                    <div className="divide-y">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="flex justify-between py-3"
                            >
                                <div className="flex gap-3">
                                    <img
                                        src={item.image_url}
                                        className="w-12 h-12 rounded-lg object-cover"
                                    />

                                    <div>
                                        <p className="font-medium">
                                            {item.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {item.unit_quantity} kg ×{" "}
                                            {item.quantity}
                                        </p>
                                    </div>
                                </div>

                                <p className="font-medium">
                                    ₹{(item.mrp * item.quantity).toFixed(2)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SUMMARY */}
                <div className="bg-white border rounded-xl p-5 shadow-sm">
                    <h3 className="font-medium mb-3">Summary</h3>

                    <Row label="Subtotal">
                        ₹{(total_amount - delivery_charges).toFixed(2)}
                    </Row>
                    <Row label="Delivery">
                        ₹{delivery_charges.toFixed(2)}
                    </Row>
                    <Row label="Total" bold>
                        ₹{total_amount.toFixed(2)}
                    </Row>
                    <Row label="Payment">
                        {payment_status}
                    </Row>
                </div>
            </div>

            {/* RIGHT SIDE (30%) */}
            <div className="lg:col-span-4">
                <div className="bg-white border rounded-xl p-5 shadow-sm sticky top-6">
                    <h3 className="font-medium mb-4">Order Timeline</h3>

                    {status_logs.length === 0 ? (
                        <p className="text-sm text-gray-500">
                            No updates yet
                        </p>
                    ) : (
                        <div className="space-y-5">
                            {status_logs.map((log, i) => (
                                <div key={log.id} className="flex gap-3">
                                    <CheckCircle className="text-blue-500 mt-1" />

                                    <div>
                                        <p className="text-sm font-medium">
                                            {log.status.replaceAll("_", " ")}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatISTTime(
                                                log.created_at
                                            )}
                                        </p>

                                        {log.remarks && (
                                            <p className="text-xs text-gray-500">
                                                {log.remarks}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
    );
}

/* UI helpers */

const Card = ({ title, children }) => (
    <div className="bg-white border rounded-xl p-5 shadow-sm">
        <h3 className="text-sm text-gray-500 mb-2">{title}</h3>
        {children}
    </div>
);

const Row = ({ label, children, bold }) => (
    <div className="flex justify-between text-sm py-1">
        <span className="text-gray-500">{label}</span>
        <span className={bold ? "font-semibold" : ""}>
            {children}
        </span>
    </div>
);