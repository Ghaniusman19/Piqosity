// import { useState } from "react";

// export default function DragnDrop2Items() {
//     const LEFT = "left";
//     const RIGHT = "right";
//     const [items, setItems] = useState([
//         { id: 1, group: LEFT, value: "Item 1" },
//         { id: 2, group: LEFT, value: "Item 2" },
//         { id: 3, group: LEFT, value: "Item 3" },
//         { id: 4, group: LEFT, value: "Item 4" },
//     ]);

//     // Store dragged item id (number)
//     const handleDragStart = (e, id) => {
//         e.dataTransfer.setData("text/plain", String(id));
//     };

//     const allowDrop = (e) => {
//         e.preventDefault(); // required to allow drop
//     };
//     const handleDrop = (e, targetGroup) => {
//         e.preventDefault();
//         const idStr = e.dataTransfer.getData("text/plain");
//         if (!idStr) return;
//         const id = Number(idStr);
//         setItems((prev) =>
//             prev.map((it) => (it.id === id ? { ...it, group: targetGroup } : it))
//         );
//         console.log(items)
//     };

//     return (
//         <div className="flex gap-4">
//             <div
//                 className="w-1/2 p-4 border"
//                 onDragOver={allowDrop}
//                 onDrop={(e) => handleDrop(e, LEFT)}
//             >
//                 <h3>Left </h3>
//                 {items
//                     .filter((it) => it.group === LEFT)
//                     .map((it) => (
//                         <div
//                             key={it.id}
//                             draggable
//                             onDragStart={(e) => handleDragStart(e, it.id)}
//                             className="p-2 mb-2 bg-white cursor-move"
//                         >
//                             <p className="bg-white border border-gray-400 rounded-lg p-2"> {it.value} || ID is : {it.id} </p>
//                         </div>
//                     ))}
//             </div>

//             <div
//                 className="w-1/2 p-4 border"
//                 onDragOver={allowDrop}
//                 onDrop={(e) => handleDrop(e, RIGHT)}
//             >
//                 <h3>Right </h3>
//                 {items
//                     .filter((it) => it.group === RIGHT)
//                     .map((it) => (
//                         <div
//                             key={it.id}
//                             draggable
//                             onDragStart={(e) => handleDragStart(e, it.id)}
//                             className="p-2 mb-2 bg-white cursor-move"
//                         >
//                             <p className="bg-white border border-gray-400 rounded-lg p-2"> {it.value} || {it.id} </p>
//                         </div>
//                     ))}
//             </div>
//         </div>
//     );
// }
// import Select from 'react-select';
// const colourOptions = [
//     { value: 'ocean', label: 'Ocean', color: '#00B8D9' },
//     { value: 'blue', label: 'Blue', color: '#0052CC' },
//     { value: 'purple', label: 'Purple', color: '#5243AA' },
//     { value: 'red', label: 'Red', color: '#FF5630' },
//     { value: 'orange', label: 'Orange', color: '#FF8B00' },
//     { value: 'yellow', label: 'Yellow', color: '#FFC400' },
//     { value: 'green', label: 'Green', color: '#36B37E' },
//     { value: 'forest', label: 'Forest', color: '#00875A' },
//     { value: 'slate', label: 'Slate', color: '#253858' },
//     { value: 'silver', label: 'Silver', color: '#666666' },
// ]
// const DragnDrop2Items = () => {
//     return (
//         <Select
//             isMulti
//             name="options"
//             options={colourOptions}
//             className="basic-multi-select"
//             classNamePrefix="select"
//         />
//     )
// };
// export default DragnDrop2Items;


// import React, { useState } from "react";
// import { MultiSelect } from 'primereact/multiselect';

// export default function FilterDemo() {
//     const [selectedCities, setSelectedCities] = useState(null);
//     const cities = [
//         { name: 'New York', code: 'NY' },
//         { name: 'Rome', code: 'RM' },
//         { name: 'London', code: 'LDN' },
//         { name: 'Istanbul', code: 'IST' },
//         { name: 'Paris', code: 'PRS' }
//     ];

//     return (
//         <div className="card flex justify-content-center">
//             <MultiSelect value={selectedCities} onChange={(e) => setSelectedCities(e.value)} options={cities} optionLabel="name"
//                 filter filterDelay={400} placeholder="Select Cities" maxSelectedLabels={3} className="w-full md:w-20rem" />
//         </div>
//     );
// }
// import React, { useState } from "react";
// import { Paginator } from 'primereact/paginator';
// export default function LayoutDemo() {
//     const [first, setFirst] = useState(0);
//     const onPageChange = (event) => {
//         setFirst(event.first);
//     };
//     return (
//         <div className="card">
//             <Paginator first={first} rows={10} totalRecords={1000} onPageChange={onPageChange} template={{ layout: 'PrevPageLink CurrentPageReport NextPageLink' }} />
//         </div>
//     );
// }


// import React, { useState } from 'react';
// function DragnDrop2Items() {
//     const [openTabs, setOpenTabs] = useState([
//         { id: 'tab1', title: 'Tab 1', content: 'Content for Tab 1' },
//         { id: 'tab2', title: 'Tab 2', content: 'Content for Tab 2' },
//     ]);
//     const [activeTabId, setActiveTabId] = useState('tab1');

//     const handleCloseTab = (tabIdToClose) => {
//         const updatedTabs = openTabs.filter(tab => tab.id !== tabIdToClose);
//         setOpenTabs(updatedTabs);

//         if (tabIdToClose === activeTabId) {
//             // Find the index of the closed tab
//             const closedTabIndex = openTabs.findIndex(tab => tab.id === tabIdToClose);
//             let newActiveTabId = null;

//             if (updatedTabs.length > 0) {
//                 // Activate the previous tab if available, otherwise the first remaining tab
//                 newActiveTabId = closedTabIndex > 0 ? updatedTabs[closedTabIndex - 1]?.id : updatedTabs[0]?.id;
//             }
//             setActiveTabId(newActiveTabId);
//         }
//     };

//     return (
//         <div>
//             {/* Tab Headers */}
//             <div className="tab-headers">
//                 {openTabs.map(tab => (
//                     <button
//                         key={tab.id}
//                         onClick={() => setActiveTabId(tab.id)}
//                         className={activeTabId === tab.id ? 'active' : ''}
//                     >
//                         {tab.title}
//                         <span onClick={(e) => { e.stopPropagation(); handleCloseTab(tab.id); }}>x</span>
//                     </button>
//                 ))}
//             </div>

//             {/* Tab Content */}
//             <div className="tab-content">
//                 {openTabs.map(tab => (
//                     <div
//                         key={tab.id}
//                         style={{ display: activeTabId === tab.id ? 'block' : 'none' }}
//                     >
//                         {tab.content}
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// }

// export default DragnDrop2Items;

import React, { useState, useRef } from 'react';

function CustomDragAndDropList() {
    const [items, setItems] = useState(['Item A', 'Item B', 'Item C', 'Item D']);
    const dragItem = useRef();
    const dragOverItem = useRef();

    const handleDragStart = (e, index) => {
        dragItem.current = index;
    };

    const handleDragEnter = (e, index) => {
        dragOverItem.current = index;
    };

    const handleDragEnd = () => {
        const newItems = [...items];
        const draggedItemContent = newItems[dragItem.current];
        newItems.splice(dragItem.current, 1);
        newItems.splice(dragOverItem.current, 0, draggedItemContent);
        setItems(newItems);
        dragItem.current = null;
        dragOverItem.current = null;
    };

    return (
        <div className="list-container">
            {items.map((item, index) => (
                <div
                    key={item}
                    className="list-item"
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnter={(e) => handleDragEnter(e, index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                >
                    {item}
                </div>
            ))}
        </div>
    );
}

export default CustomDragAndDropList;