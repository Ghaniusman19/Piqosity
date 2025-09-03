function AdvanceModal({
    adv,
    modalTab,
    handleAdvanceInputChange,
    setAdvanceModalTab,
}) {
    return (
        <div className="modal-overlay">
            <div
                className="modal-content bg-white max-w-[50%] overflow-y-scroll h-[80%]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="header flex justify-between items-center">
                    <h3 className="text-lg font-semibold mb-4">
                        Advanced Section Formatting
                    </h3>
                    <button
                        className="w-10 h-10 text-center border text-2xl text-gray-500 rounded-full"
                        onClick={() => setAdvanceModalTab(null)}
                    >
                        &times;
                    </button>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                    {/* Directions */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Directions
                        </label>
                        <div className="border rounded-t-md p-2 flex flex-wrap gap-2 text-gray-600 text-sm">
                            <button className="hover:text-black font-bold">B</button>
                            <button className="hover:text-black italic">I</button>
                            <button className="hover:text-black underline">U</button>
                            <button className="hover:text-black">A</button>
                            <button className="hover:text-black">•</button>
                            <button className="hover:text-black">1.</button>
                            <button className="hover:text-black">Img</button>
                            <button className="hover:text-black">Link</button>
                        </div>
                        <textarea
                            rows={4}
                            value={adv.directions || ""}
                            onChange={(e) =>
                                handleAdvanceInputChange(modalTab.id, "directions", e.target.value)
                            }
                            placeholder="Type something"
                            className="w-full border border-t-0 rounded-b-md p-2 text-sm"
                            required
                        />
                    </div>

                    {/* Single Question Layout */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Single Question Layout
                        </label>
                        <select
                            value={adv.singleLayout || ""}
                            onChange={(e) =>
                                handleAdvanceInputChange(modalTab.id, "singleLayout", e.target.value)
                            }
                            className="w-full border rounded p-2 text-sm"
                        >
                            <option>Single Column</option>
                            <option>Two Column</option>
                        </select>
                    </div>

                    {/* Passage Question Layout */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Passage Question Layout
                        </label>
                        <select
                            value={adv.passageLayout || ""}
                            onChange={(e) =>
                                handleAdvanceInputChange(modalTab.id, "passageLayout", e.target.value)
                            }
                            className="w-full border rounded p-2 text-sm"
                        >
                            <option>Single Column</option>
                            <option>Two Column</option>
                        </select>
                    </div>

                    {/* Calculator */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Calculator
                        </label>
                        <select
                            value={adv.calculator || ""}
                            onChange={(e) =>
                                handleAdvanceInputChange(modalTab.id, "calculator", e.target.value)
                            }
                            className="w-full border rounded p-2 text-sm"
                        >
                            <option>Default</option>
                            <option>Scientific</option>
                            <option>None</option>
                        </select>
                    </div>

                    {/* Reference Sheet */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Reference Sheet
                        </label>
                        <select
                            value={adv.referenceSheet || ""}
                            onChange={(e) =>
                                handleAdvanceInputChange(modalTab.id, "referenceSheet", e.target.value)
                            }
                            className="w-full border rounded p-2 text-sm"
                        >
                            <option>No Reference Sheet</option>
                            <option>Sheet A</option>
                            <option>Sheet B</option>
                        </select>
                    </div>

                    {/* Allotted Time */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Allotted Time
                        </label>
                        <select
                            value={adv.allottedTime || ""}
                            onChange={(e) =>
                                handleAdvanceInputChange(modalTab.id, "allottedTime", e.target.value)
                            }
                            className="w-full border rounded p-2 text-sm"
                        >
                            <option>Default</option>
                            <option>Custom</option>
                        </select>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-start gap-2 pt-3 border-t">
                        <button
                            className="px-4 py-2 rounded bg-[#26a69a] text-white text-sm"
                            onClick={() => setAdvanceModalTab(null)}
                        >
                            Submit form
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdvanceModal;
