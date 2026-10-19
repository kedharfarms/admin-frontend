import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

export default function CloudinaryImageUpload({
    label = 'Upload images',
    value,
    onChange,
    multiple = false,
    baseUrl,
    token,
    onUploadingChange,
}) {
    const inputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const urls = multiple ? (Array.isArray(value) ? value : []) : (value ? [value] : []);

    useEffect(() => {
        if (!previewUrl) return undefined;
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') setPreviewUrl('');
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [previewUrl]);

    const handleFileChange = async (event) => {
        const files = Array.from(event.target.files || []);
        event.target.value = '';
        if (!files.length) return;

        const invalidFiles = files.filter((file) =>
            !file.type.startsWith('image/') || file.size > MAX_IMAGE_SIZE_BYTES
        );
        if (invalidFiles.length) {
            toast.error('Choose image files that are 10 MB or smaller');
        }

        const validFiles = files.filter((file) =>
            file.type.startsWith('image/') && file.size <= MAX_IMAGE_SIZE_BYTES
        );
        if (!validFiles.length) return;

        setIsUploading(true);
        onUploadingChange?.(true);
        let currentUrls = urls;

        try {
            for (const file of validFiles) {
                const signatureResponse = await axios.post(
                    `${baseUrl}/media/cloudinary-signature`,
                    {},
                    { headers: { Authorization: token } }
                );
                const signatureData = signatureResponse.data.data;
                const uploadData = new FormData();

                uploadData.append('file', file);
                uploadData.append('api_key', signatureData.api_key);
                uploadData.append('timestamp', signatureData.timestamp);
                uploadData.append('folder', signatureData.folder);
                uploadData.append('signature', signatureData.signature);

                const uploadResponse = await axios.post(
                    `https://api.cloudinary.com/v1_1/${signatureData.cloud_name}/image/upload`,
                    uploadData
                );
                const secureUrl = uploadResponse.data.secure_url;
                currentUrls = multiple ? [...currentUrls, secureUrl] : [secureUrl];
                onChange(multiple ? currentUrls : secureUrl);
            }
            toast.success(validFiles.length === 1 ? 'Image uploaded' : 'Images uploaded');
        } catch (error) {
            toast.error(
                error?.response?.data?.error?.message ||
                error?.response?.data?.message ||
                error.message ||
                'Image upload failed'
            );
        } finally {
            setIsUploading(false);
            onUploadingChange?.(false);
        }
    };

    const removeImage = (index) => {
        const updatedUrls = urls.filter((_, urlIndex) => urlIndex !== index);
        onChange(multiple ? updatedUrls : '');
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <div className="flex flex-wrap items-center gap-3">
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    multiple={multiple}
                    disabled={isUploading}
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-700 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:font-medium file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                />
                {isUploading && <span className="text-sm text-gray-500">Uploading...</span>}
            </div>
            {urls.length > 0 && (
                <div className="flex flex-wrap gap-3">
                    {urls.map((url, index) => (
                        <div key={`${url}-${index}`} className="relative">
                            <img
                                src={url}
                                alt={`Uploaded ${index + 1}`}
                                onClick={() => setPreviewUrl(url)}
                                className="h-16 w-16 cursor-pointer rounded border border-gray-200 object-cover"
                            />
                            <button
                                type="button"
                                disabled={isUploading}
                                onClick={() => removeImage(index)}
                                aria-label={`Remove image ${index + 1}`}
                                className="absolute -right-2 -top-2 rounded-full bg-red-600 px-1.5 text-xs text-white disabled:opacity-50"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}
            {previewUrl && (
                <div
                    role="presentation"
                    onClick={() => setPreviewUrl('')}
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
                >
                    <button
                        type="button"
                        onClick={() => setPreviewUrl('')}
                        aria-label="Close image preview"
                        className="absolute right-5 top-5 rounded-full bg-white px-3 py-1 text-2xl leading-none text-gray-800 hover:bg-gray-200"
                    >
                        ×
                    </button>
                    <img
                        src={previewUrl}
                        alt="Full-size preview"
                        onClick={(event) => event.stopPropagation()}
                        className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
                    />
                </div>
            )}
        </div>
    );
}
