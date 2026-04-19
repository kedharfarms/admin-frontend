import { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle } from "lucide-react";
import { useParams } from "react-router-dom";

export function SubscriptionDetails() {
    const { id } = useParams();

    const BASE_URL = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("token");

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchSubscription = async () => {
        try {
            const res = await axios.get(
                `${BASE_URL}/subscription-management/${id}`,
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
        if (id) fetchSubscription();
    }, [id]);

    const getStatusBadge = (status) => {
        const map = {
            ACTIVE: "bg-green-100 text-green-700",
            PAUSED: "bg-yellow-100 text-yellow-700",
            CANCELLED: "bg-red-100 text-red-700",
            EXPIRED: "bg-gray-100 text-gray-700",
        };
        return map[status] || "bg-gray-100 text-gray-700";
    };

    if (loading) return <div className="p-6 text-gray-400">Loading...</div>;
    if (!data) return null;

    const {
        subscription_no,
        title,
        status,
        created_at,
        price_per_delivery,
        start_date,
        payment_status,
        delivery_slot,
        frequency,
        image_url,
        deliveries = [],
        vacations = [],
        user,
        delivery_address,
    } = data;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-semibold">
                        {subscription_no}
                    </h1>
                    <p className="text-sm text-gray-500">
                        {new Date(created_at).toLocaleString()}
                    </p>
                </div>

                <span
                    className={`px-3 py-1 rounded-full text-sm ${getStatusBadge(
                        status
                    )}`}
                >
                    {status}
                </span>
            </div>

            {/* MAIN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* LEFT */}
                <div className="lg:col-span-8 space-y-6">

                    {/* PRODUCT */}
                    <div className="bg-white border rounded-xl p-5 shadow-sm flex gap-4 items-center">
                        <img
                            src={image_url}
                            className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div>
                            <p className="font-medium">{title}</p>
                            <p className="text-sm text-gray-500">
                                {frequency} • {delivery_slot}
                            </p>
                        </div>
                    </div>

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

                    {/* SUMMARY */}
                    <div className="bg-white border rounded-xl p-5 shadow-sm">
                        <h3 className="font-medium mb-3">Subscription Info</h3>

                        <Row label="Start Date">
                            {new Date(start_date).toLocaleDateString()}
                        </Row>
                        <Row label="Price / Delivery">
                            ₹{price_per_delivery}
                        </Row>
                        <Row label="Payment Status">
                            {payment_status}
                        </Row>
                    </div>

                    {/* VACATIONS */}
                    <div className="bg-white border rounded-xl p-5 shadow-sm">
                        <h3 className="font-medium mb-3">Vacations</h3>

                        {vacations.length === 0 ? (
                            <p className="text-sm text-gray-500">
                                No vacations
                            </p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {vacations.map((v) => (
                                    <span
                                        key={v.id}
                                        className="text-xs bg-gray-100 px-2 py-1 rounded"
                                    >
                                        {new Date(
                                            v.vacation_date
                                        ).toLocaleDateString()}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="lg:col-span-4">
                    <div className="bg-white border rounded-xl p-5 shadow-sm sticky top-6">
                        <h3 className="font-medium mb-4">
                            Deliveries Timeline
                        </h3>

                        {deliveries.length === 0 ? (
                            <p className="text-sm text-gray-500">
                                No deliveries yet
                            </p>
                        ) : (
                            <div className="space-y-5">
                                {deliveries.map((d) => (
                                    <div key={d.id} className="flex gap-3">
                                        <CheckCircle className="text-green-500 mt-1" />
                                        <div>
                                            <p className="text-sm font-medium capitalize">
                                                {d.status}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(
                                                    d.delivery_date
                                                ).toLocaleDateString()}
                                            </p>
                                            {d.reason && (
                                                <p className="text-xs text-gray-500">
                                                    {d.reason}
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

/* helpers */

const Card = ({ title, children }) => (
    <div className="bg-white border rounded-xl p-5 shadow-sm">
        <h3 className="text-sm text-gray-500 mb-2">{title}</h3>
        {children}
    </div>
);

const Row = ({ label, children }) => (
    <div className="flex justify-between text-sm py-1">
        <span className="text-gray-500">{label}</span>
        <span>{children}</span>
    </div>
);