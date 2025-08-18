import { useState } from 'react';
import { closestCorners, DndContext } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { useSensor, useSensors, PointerSensor, TouchSensor } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
function TestDnd() {

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({})
    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    }
    const [data, setData] = useState([
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
        { id: 4, name: 'Item 4' },
        { id: 5, name: 'Item 5' },
        { id: 6, name: 'Item 6' }
    ]);
    const handleDragEnd = (event) => {
        const { active, over } = event;
        console.log(active, over);

    }

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(TouchSensor)

    )
    return (
        <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
            <div>

                <SortableContext strategy={
                    verticalListSortingStrategy
                } items={data}>
                    <div>
                        <h1>Test DND Page</h1>
                        <p>Drag and drop functionality can be implemented here.</p>

                        <div style={style} {...attributes} {...listeners} ref={setNodeRef} {...transform} {...transition} className='w-[50%]' >
                            <ul  >
                                {data.map(item => (
                                    <li style={{ touchAction: "none" }} key={item.id} className='bg-slate-400  mb-2 text-center' draggable="true">
                                        {item.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </SortableContext>
            </div>
        </DndContext>

    )
}

export default TestDnd;