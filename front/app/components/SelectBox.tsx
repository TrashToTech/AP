"use client";

import { useState } from 'react';

export default function SelectBox({ options, label }: {
    options: string[],
    label: string
}) {
    const [selected, setSelected] = useState(options[0]);

    return (
        <div className="inline-block mr-4">
            <label className="mr-2 font-medium text-gray-600">{label}</label>
            <select
                value={selected}
                onChange={e => setSelected(e.target.value)}
                className="border rounded px-2 py-1 text-sm shadow focus:outline-none focus:ring focus:border-blue-300"
            >
                {options.map(o => (
                    <option value={o} key={o}>{o}</option>
                ))}
            </select>
            <span className="ml-2 text-blue-600 font-bold">{selected}</span>
        </div>
    );
}
