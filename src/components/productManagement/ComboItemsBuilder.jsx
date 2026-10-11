import { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, Plus } from 'lucide-react';
import { SelectInput, Input } from './ProductTableComponents';
import { PRODUCT_TYPE } from '../../constants/commonConstants.js';

// Lets an admin build up a combo's composition: pick a (non-combo) product,
// pick one of that product's existing packs/variants, give a pack count, add.
export default function ComboItemsBuilder({ items = [], onChange, productOptions = [] }) {
    const BASE_URL = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem('token');

    const [pendingProductId, setPendingProductId] = useState('');
    const [pendingVariantId, setPendingVariantId] = useState('');
    const [pendingQuantity, setPendingQuantity] = useState('1');
    const [variantOptions, setVariantOptions] = useState([]);

    const nonComboProductOptions = productOptions.filter(
        (p) => p.product_type !== PRODUCT_TYPE.COMBO
    );

    useEffect(() => {
        setPendingVariantId('');
        setVariantOptions([]);

        if (!pendingProductId) return;

        const fetchVariantOptions = async () => {
            try {
                const response = await axios({
                    method: 'GET',
                    url: `${BASE_URL}/product-management/product-variants/options`,
                    headers: { Authorization: token },
                    params: { product_id: pendingProductId },
                });

                setVariantOptions(response?.data?.data || []);
            } catch (error) {
                console.error(error);
            }
        };

        fetchVariantOptions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pendingProductId]);

    const handleAdd = () => {
        if (!pendingVariantId || !pendingQuantity || Number(pendingQuantity) <= 0) return;

        const variant_id = Number(pendingVariantId);

        if (items.some((item) => item.component_variant_id === variant_id)) {
            return;
        }

        const variant = variantOptions.find((v) => v.id === variant_id);

        onChange([
            ...items,
            {
                component_variant_id: variant_id,
                quantity: Number(pendingQuantity),
                label: variant
                    ? `${variant.name} (${variant.product?.name || ''})`
                    : `Variant #${variant_id}`,
            },
        ]);

        setPendingProductId('');
        setPendingVariantId('');
        setPendingQuantity('1');
    };

    const handleRemove = (component_variant_id) => {
        onChange(items.filter((item) => item.component_variant_id !== component_variant_id));
    };

    return (
        <div className="border border-gray-200 rounded-lg p-3 space-y-3">
            <label className="block text-sm font-medium text-gray-700">Combo Contents *</label>

            {items.length > 0 && (
                <div className="space-y-1">
                    {items.map((item) => (
                        <div
                            key={item.component_variant_id}
                            className="flex items-center justify-between bg-gray-50 rounded px-2 py-1 text-sm"
                        >
                            <span>{item.quantity} x {item.label}</span>
                            <button
                                type="button"
                                onClick={() => handleRemove(item.component_variant_id)}
                            >
                                <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {items.length === 0 && (
                <p className="text-xs text-gray-500">No items added yet.</p>
            )}

            <div className="grid grid-cols-[1fr_1fr_70px_36px] gap-2 items-end">
                <SelectInput
                    label="Product"
                    value={pendingProductId}
                    onChange={(e) => setPendingProductId(e.target.value)}
                    options={nonComboProductOptions}
                    placeholder="Select"
                />

                <SelectInput
                    label="Pack"
                    value={pendingVariantId}
                    onChange={(e) => setPendingVariantId(e.target.value)}
                    options={variantOptions.map((v) => ({
                        label: `${v.name} (${v.unit_quantity} ${v.product?.base_unit || ''})`,
                        value: v.id,
                    }))}
                    placeholder="Select"
                />

                <Input
                    label="Count"
                    type="number"
                    min="1"
                    value={pendingQuantity}
                    onChange={(e) => setPendingQuantity(e.target.value)}
                />

                <button
                    type="button"
                    onClick={handleAdd}
                    className="h-[38px] flex items-center justify-center bg-blue-600 text-white rounded-lg"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
