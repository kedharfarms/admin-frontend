import { useEffect, useState } from 'react';

import axios from 'axios';

import {
    Plus,
    Trash2,
    GripVertical,
} from 'lucide-react';

import {
    DragDropContext,
    Droppable,
    Draggable,
} from '@hello-pangea/dnd';

import toast from 'react-hot-toast';
import { PLACEMENTS } from '../constants/commonConstants';
import ConfirmationModal from '../components/common/ConfirmationModal';

export default function BannerManagement() {
    const BASE_URL =
        process.env.REACT_APP_API_URL;

    const token =
        localStorage.getItem('token');

    const [placements, setPlacements] =
        useState([]);

    const [loading, setLoading] =
        useState(false);

    const [showModal, setShowModal] =
        useState(false);

    const [formData, setFormData] =
        useState({
            placement: '',
            image_url: '',
    });

    const [isExecuting, setIsExecuting] =
        useState(false);
    
    const [selectedBanner, setSelectedBanner] =
        useState(null);

    const [showBannerDeleteModal, setShowBannerDeleteModal] =
        useState(false);


    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        if(loading) return;
        try {
            setLoading(true);

            const response = await axios({
                method: 'GET',
                url: BASE_URL + '/banners',
                headers: {
                    Authorization: token,
                },
            });

            const responseData = response?.data;

            console.log('Fetched Banners:', responseData);

            if(responseData?.data){
                setPlacements(responseData.data);
            }
        } catch (error) {
            toast.error(
                error?.response?.data
                    ?.message || error.message
            );
        } finally {
            setLoading(false);
        }
    };

    const deleteBannerHandler = async () => {
        if(isExecuting) return;
        try {
            setIsExecuting(true);
            await axios({
                method: 'DELETE',
                url:
                    BASE_URL +
                    `/banners/${selectedBanner?.id}`,
                headers: {
                    Authorization: token,
                },
            });

            toast.success(
                'Banner deleted'
            );

            setShowBannerDeleteModal(false);
            setSelectedBanner(null);

            fetchBanners();
        } catch (error) {
            toast.error(
                error?.response?.data
                    ?.message || error.message
            );
        }
        finally {
            setIsExecuting(false);
        }
    };

    const handleDragEnd = async (
        result
    ) => {
        if (!result.destination) return;

        const sourcePlacement =
            result.source.droppableId;

        const destinationPlacement =
            result.destination.droppableId;

        if (
            sourcePlacement !==
            destinationPlacement
        ) {
            return;
        }

        const updatedPlacements = [
            ...placements,
        ];

        const placementIndex =
            updatedPlacements.findIndex(
                (placement) =>
                    placement.placement ===
                    sourcePlacement
            );

        const banners = [
            ...updatedPlacements[
                placementIndex
            ].banners,
        ];

        const [removed] = banners.splice(
            result.source.index,
            1
        );

        banners.splice(
            result.destination.index,
            0,
            removed
        );

        const reordered = banners.map(
            (banner, index) => ({
                ...banner,
                display_order: index + 1,
            })
        );

        const data = {
            placement: sourcePlacement,
            banners: reordered.map(
                (banner) => ({
                    id: banner.id,
                    display_order:
                        banner.display_order,
                })
            )
        };

        try {
            await axios({
                method: 'PUT',
                url:
                    BASE_URL +
                    '/banners/reorder',
                headers: {
                    Authorization: token,
                },
                data
            });

            toast.success(
                'Banner order updated'
            );

            fetchBanners();
        } catch (error) {
            toast.error(
                error?.response?.data
                    ?.message || error.message
            );
        }
    };

    const openCreateModal = (
        placement = ''
    ) => {
        setFormData({
            placement,
            image_url: '',
        });

        setShowModal(true);
    };

    const handleCreate = async () => {
        if(isExecuting) return;
        try {
            setIsExecuting(true);
            await axios({
                method: 'POST',
                url: BASE_URL + '/banners',
                headers: {
                    Authorization: token,
                },
                data: formData,
            });

            toast.success(
                'Banner created'
            );

            setShowModal(false);

            fetchBanners();
        } catch (error) {
            toast.error(
                error?.response?.data
                    ?.message || error.message
            );
        }
        finally {
            setIsExecuting(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">
                        Banner Management
                    </h1>

                    <p className="text-gray-600">
                        Manage banners by placement
                    </p>
                </div>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <DragDropContext
                    onDragEnd={
                        handleDragEnd
                    }
                >
                    <div className="space-y-6">
                        {PLACEMENTS.map((placementName) => {
                            const placementData =
                                placements.find(
                                    (placement) =>
                                        placement.placement ===
                                        placementName
                                );

                            const banners =
                                placementData?.banners || [];

                            return (
                                <div
                                    key={placementName}
                                    className="bg-white border rounded-xl p-5"
                                >
                                    {/* HEADER */}
                                    <div className="flex items-center justify-between mb-5">
                                        <div>
                                            <h2 className="text-lg font-semibold">
                                                {placementName}
                                            </h2>

                                            <p className="text-sm text-gray-500">
                                                {banners.length}{' '}
                                                banners
                                            </p>
                                        </div>

                                        <button
                                            onClick={() =>
                                                openCreateModal(
                                                    placementName
                                                )
                                            }
                                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                        >
                                            <Plus size={16} />
                                            Create Banner
                                        </button>
                                    </div>

                                    {/* EMPTY STATE */}
                                    {banners.length === 0 ? (
                                        <div className="h-40 border-2 border-dashed rounded-xl flex items-center justify-center text-gray-400">
                                            No banners added
                                        </div>
                                    ) : (
                                        <Droppable
                                            droppableId={
                                                placementName
                                            }
                                            direction="horizontal"
                                        >
                                            {(provided) => (
                                                <div
                                                    ref={
                                                        provided.innerRef
                                                    }
                                                    {
                                                        ...provided.droppableProps
                                                    }
                                                    className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4"
                                                >
                                                    {banners.map(
                                                        (
                                                            banner,
                                                            index
                                                        ) => (
                                                            <Draggable
                                                                key={
                                                                    banner.id
                                                                }
                                                                draggableId={banner?.id.toString()}
                                                                index={
                                                                    index
                                                                }
                                                            >
                                                                {(
                                                                    provided,
                                                                    snapshot
                                                                ) => (
                                                                    <div
                                                                        ref={
                                                                            provided.innerRef
                                                                        }
                                                                        {
                                                                            ...provided.draggableProps
                                                                        }
                                                                        {
                                                                            ...provided.dragHandleProps
                                                                        }
                                                                        className={`border rounded-xl overflow-hidden relative transition-all ${
                                                                            snapshot.isDragging
                                                                                ? 'bg-gray-100 shadow-xl scale-[1.02]'
                                                                                : 'bg-white'
                                                                        }`}
                                                                    >
                                                                        {/* IMAGE */}
                                                                        <img
                                                                            src={
                                                                                banner.image_url
                                                                            }
                                                                            alt="Banner"
                                                                            className="w-full h-40 object-cover"
                                                                        />

                                                                        {/* DELETE */}
                                                                        <button
                                                                            onClick={() =>{
                                                                                setSelectedBanner(banner)
                                                                                setShowBannerDeleteModal(true)
                                                                            }}
                                                                            className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                                                                        >
                                                                            <Trash2 size={16} />
                                                                        </button>

                                                                        {/* PRIORITY */}
                                                                        <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 text-xs rounded">
                                                                            #
                                                                            {
                                                                                index+1
                                                                            }
                                                                        </div>

                                                                        {/* FOOTER */}
                                                                        <div className="p-3 flex items-center justify-between">
                                                                            <div>
                                                                                <p className="text-xs text-gray-500">
                                                                                    Display
                                                                                    Order
                                                                                </p>

                                                                                <p className="font-semibold">
                                                                                    {
                                                                                        index+1
                                                                                    }
                                                                                </p>
                                                                            </div>

                                                                            <GripVertical className="w-5 h-5 text-gray-500" />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </Draggable>
                                                        )
                                                    )}

                                                    {
                                                        provided.placeholder
                                                    }
                                                </div>
                                            )}
                                        </Droppable>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </DragDropContext>
            )}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white w-[500px] rounded-2xl p-6">
                        <h2 className="text-xl font-semibold mb-5">
                            Create Banner
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block mb-1 text-sm font-medium">
                                    Placement
                                </label>

                                <select
                                    value={
                                        formData.placement
                                    }
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            placement:
                                                e.target
                                                    .value,
                                        })
                                    }
                                    className="w-full border rounded-lg p-2.5"
                                >
                                    <option value="">
                                        Select Placement
                                    </option>

                                    {PLACEMENTS.map(
                                        (
                                            placement
                                        ) => (
                                            <option
                                                key={
                                                    placement
                                                }
                                                value={
                                                    placement
                                                }
                                            >
                                                {
                                                    placement
                                                }
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="block mb-1 text-sm font-medium">
                                    Image URL
                                </label>

                                <input
                                    type="text"
                                    value={
                                        formData.image_url
                                    }
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            image_url:
                                                e.target
                                                    .value,
                                        })
                                    }
                                    className="w-full border rounded-lg p-2.5"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() =>
                                    setShowModal(false)
                                }
                                className="px-4 py-2 border rounded-lg"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={
                                    handleCreate
                                }
                                disabled={isExecuting}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                            >
                                Create Banner
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <ConfirmationModal
                isOpen={showBannerDeleteModal && selectedBanner !== null}
                onClose={() => {
                    setShowBannerDeleteModal(false);
                    setSelectedBanner(null);
                }}
                title="Confirm Delete Banner"
                zIndex="z-[60]"
                isLoading={isExecuting}
                onConfirm={deleteBannerHandler}
                confirmText={`Confirm`}
            >
                <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to delete this banner under placement {selectedBanner?.placement}?
                </p>

            </ConfirmationModal>
        </div>
    );
}