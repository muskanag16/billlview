"use client";

interface InvoiceItem {
    description: string;
    quantity: string;
    rate: string;
}

interface Props {
    items: InvoiceItem[];
    onChange: (items: InvoiceItem[]) => void;
}

export default function InvoiceItemsEditor({ items, onChange }: Props) {
    const addItem = () => {
        onChange([...items, { description: '', quantity: '1', rate: '0.00' }]);
    };

    const removeItem = (index: number) => {
        onChange(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: keyof InvoiceItem, value: string) => {
        const updated = items.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        );
        onChange(updated);
    };

    return (
        <div className="space-y-3">
            <div className="hidden sm:grid sm:grid-cols-12 gap-2 text-xs font-medium text-gray-500 uppercase px-1">
                <div className="col-span-6">Description</div>
                <div className="col-span-2">Quantity</div>
                <div className="col-span-3">Rate</div>
                <div className="col-span-1"></div>
            </div>

            {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-12 sm:col-span-6">
                        <input
                            type="text"
                            placeholder="Description"
                            required
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="col-span-5 sm:col-span-2">
                        <input
                            type="number"
                            placeholder="Qty"
                            required
                            min="0.01"
                            step="0.01"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                        <input
                            type="number"
                            placeholder="Rate"
                            required
                            min="0"
                            step="0.01"
                            value={item.rate}
                            onChange={(e) => updateItem(index, 'rate', e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="col-span-1 flex justify-center">
                        <button
                            type="button"
                            onClick={() => removeItem(index)}
                            disabled={items.length === 1}
                            className="text-red-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed text-lg font-bold"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            ))}

            <button
                type="button"
                onClick={addItem}
                className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
                + Add Line Item
            </button>
        </div>
    );
}
