import { useEffect, useState } from "react";
import { MultiSelect } from "primereact/multiselect";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Paginator } from 'primereact/paginator';

// Draggable Item Component
const DraggableItem = ({ id, children, type }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `${type}-${id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-2 border border-gray-200 rounded-md mb-1 cursor-grab active:cursor-grabbing ${type === 'question' ? 'text-[#26a69a] font-semibold' : 'text-[#26a69a]'
        } ${isDragging ? 'shadow-lg' : ''}`}
    >
      {children}
    </li>
  );
};

// Droppable Area Component
const DroppableArea = ({ children, title, count }) => {
  return (
    <div className="mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg min-h-[100px] bg-gray-50">
      <h4 className="font-semibold text-gray-700 mb-2">{title} ({count})</h4>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
};

const TestBuilder = () => {
  const stripHtml = (htmlString) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    return doc.body.textContent || "";
  };

  const makeId = () =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  // Holds { [sectionId]: { questions: [], passages: [] } }
  const [sectionData, setSectionData] = useState({});

  // NEW: Holds dropped items for each section { [sectionId]: { droppedQuestions: [], droppedPassages: [] } }
  const [droppedItems, setDroppedItems] = useState({});

  // UI control for which section is currently shown in right panel
  const [activeSectionId, setActiveSectionId] = useState(null);
  // Right-panel tab: "questions" | "passages"
  const [activeTab, setActiveTab] = useState("questions");
  // MultiSelect selected values per section: { [sectionId]: [ids...] }
  const [selectedQuestion, setSelectedQuestion] = useState({});
  // Sections list and per-section small form states
  const [passageOpen, setpassageOpen] = useState(null)

  const handlePassageToggle = (id) => {
    setpassageOpen(prev => {
      // If clicking the same passage that's already open, close it (set to null)
      // If clicking a different passage, open that one (set to new id)
      const newState = prev === id ? null : id;
      return newState;
    });
  }
  // This is the state and function for Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalQuestions, setTotalQuestions] = useState([]);
  // If you want to paginate passages too, add similar states for passages.
  const onPageChange = (event) => {
    const newPage = Math.floor(event.first / pageSize) + 1;
    setCurrentPage(newPage);
    // Call fetchQuestions with current section/topic
    if (activeSectionId && formAdd.length > 0) {
      const formItem = formAdd.find(item => item.id === activeSectionId) || {};
      fetchQuestions(activeSectionId, formItem.multiTopics || formItem.courseVal, newPage, pageSize);
    }
  };
  const fetchQuestions = async (sectionId, topicId, page = 1, size = 10) => {
    try {
      const start = (page - 1) * size;
      const response = await fetch(
        "https://api.natsent.com/api/v1/commons/test_builders/get_all_questions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization:
              "eyJhbGciOiJIUzI1NiJ9.eyJ0cnVlX3VzZXJfaWQiOm51bGwsInVzZXJfaWQiOiJiN2UyOGZjOS04YmExLTRjZWUtYWZlYS0yOTFjYTE1MmYyNmQiLCJleHAiOjE3ODU5MTk0MDd9.UI12IbbjeYpt3x6gJ2Z-nX3QRL9SoQLLvx4soiI4Hb8",
          },
          body: JSON.stringify({
            ids: [topicId],
            length: size,
            start: start,
          }),
        }
      );
      const data = await response.json();
      setSectionData(prev => ({
        ...prev,
        [sectionId]: {
          ...prev[sectionId],
          questions: data?.data?.data || [],
        },
      }));
      setTotalQuestions(data?.data?.total || 0); // If API returns total count
    } catch (error) {
      console.error("fetchQuestions error:", error);
    }
  };
  // State for the searching data from question and passages from right div
  const [search, setSearch] = useState('')
  const [addSection, setAddsection] = useState([]);
  const [formAdd, setFormAdd] = useState([]);
  const [courses, setCourses] = useState([]);
  const [courses_1, setCourses_1] = useState([]);
  const [formData, setformData] = useState({
    id: -1,
    title: "",
    courseVal: "",
    publicVal: "",
    locked: "",
  });

  // Drag and Drop Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleFormAdd = (id, e) => {
    const { name, value } = e.target;
    setFormAdd((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [name]: value } : item))
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setformData((previous) => ({ ...previous, [name]: value }));
  };

  const AddSection = (e) => {
    e.preventDefault();
    const newId = makeId();
    const newFormData = {
      id: newId,
      title: "",
      multiTopics: "",
    };

    const newSection = {
      ...formData,
      id: newId,
    };

    // Append new section
    setAddsection((prev) => [...prev, newSection]);
    setFormAdd((prev) => [...prev, newFormData]);

    // Initialize data containers for the new section
    setSectionData((prev) => ({
      ...prev,
      [newId]: { questions: [], passages: [] },
    }));

    // Initialize dropped items for the new section
    setDroppedItems((prev) => ({
      ...prev,
      [newId]: { droppedQuestions: [], droppedPassages: [] },
    }));

    setSelectedQuestion((prev) => ({ ...prev, [newId]: [] }));

    // Make the newly added section active in right panel
    setActiveSectionId(newId);

    // Reset only fields you want, but keep the courseVal
    setformData((prev) => ({
      ...prev,
      title: "",
      publicVal: "",
      locked: "",
    }));
  };

  const removeSection = (sectionIdToRemove) => {
    // 1. Remove from section list
    const filteredSections = addSection.filter(
      (sec) => String(sec.id) !== String(sectionIdToRemove)
    );
    setAddsection(filteredSections);

    // 2. Remove formAdd entry
    const updatedFormAdd = formAdd.filter(
      (item) => String(item.id) !== String(sectionIdToRemove)
    );
    setFormAdd(updatedFormAdd);

    // 3. Remove selected questions for this section
    setSelectedQuestion((prev) => {
      const copy = { ...prev };
      delete copy[sectionIdToRemove];
      return copy;
    });

    // 4. Remove sectionData (questions + passages)
    setSectionData((prev) => {
      const copy = { ...prev };
      delete copy[sectionIdToRemove];
      return copy;
    });

    // 5. Remove dropped items for this section
    setDroppedItems((prev) => {
      const copy = { ...prev };
      delete copy[sectionIdToRemove];
      return copy;
    });

    // 6. Reset active section if needed
    setActiveSectionId((prevActive) => {
      if (String(prevActive) === String(sectionIdToRemove)) {
        // choose first remaining section if any, else null
        return filteredSections.length > 0 ? filteredSections[0].id : null;
      }
      return prevActive;
    });
  };

  const getCoursesData = async () => {
    try {
      const response = await fetch(
        "https://api.natsent.com/api/v1/commons/generics/get_course",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            authorization:
              "eyJhbGciOiJIUzI1NiJ9.eyJ0cnVlX3VzZXJfaWQiOm51bGwsInVzZXJfaWQiOiJiN2UyOGZjOS04YmExLTRjZWUtYWZlYS0yOTFjYTE1MmYyNmQiLCJleHAiOjE3ODU5MTk0MDd9.UI12IbbjeYpt3x6gJ2Z-nX3QRL9SoQLLvx4soiI4Hb8",
          },
        }
      );
      const data = await response.json();
      setCourses(data.data || []);
    } catch (error) {
      console.error("getCoursesData error:", error);
    }
  };

  const handleCourseChange = async (id) => {
    try {
      const response = await fetch(
        `https://api.natsent.com/api/v1/commons/test_builders/get_course_topics?id=${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            authorization:
              "eyJhbGciOiJIUzI1NiJ9.eyJ0cnVlX3VzZXJfaWQiOm51bGwsInVzZXJfaWQiOiJiN2UyOGZjOS04YmExLTRjZWUtYWZlYS0yOTFjYTE1MmYyNmQiLCJleHAiOjE3ODU5MTk0MDd9.UI12IbbjeYpt3x6gJ2Z-nX3QRL9SoQLLvx4soiI4Hb8",
          },
        }
      );
      const data = await response.json();
      setCourses_1(data.data || []);
    } catch (error) {
      console.error("handleCourseChange error:", error);
    }
  };

  const handleTopics = async (sectionId, questionIds, topicId) => {
    if (!sectionId) return;
    try {
      // Fetch passages using topicId (not questionIds)
      const responsePassages = await fetch(
        "https://api.natsent.com/api/v1/commons/test_builders/get_all_passages",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization:
              "eyJhbGciOiJIUzI1NiJ9.eyJ0cnVlX3VzZXJfaWQiOm51bGwsInVzZXJfaWQiOiJiN2UyOGZjOS04YmExLTRjZWUtYWZlYS0yOTFjYTE1MmYyNmQiLCJleHAiOjE3ODU5MTk0MDd9.UI12IbbjeYpt3x6gJ2Z-nX3QRL9SoQLLvx4soiI4Hb8",
          },
          body: JSON.stringify({ ids: [topicId] }),
        }
      );
      const passagesData = await responsePassages.json();

      // Fetch questions as before
      const responseQuestions = await fetch(
        "https://api.natsent.com/api/v1/commons/test_builders/get_all_questions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization:
              "eyJhbGciOiJIUzI1NiJ9.eyJ0cnVlX3VzZXJfaWQiOm51bGwsInVzZXJfaWQiOiJiN2UyOGZjOS04YmExLTRjZWUtYWZlYS0yOTFjYTE1MmYyNmQiLCJleHAiOjE3ODU5MTk0MDd9.UI12IbbjeYpt3x6gJ2Z-nX3QRL9SoQLLvx4soiI4Hb8",
          },
          body: JSON.stringify({ ids: [questionIds] }),
        }
      );
      const questionsData = await responseQuestions.json();

      setSectionData((prev) => ({
        ...prev,
        // spread operator used to get copy 
        [sectionId]: {
          questions: questionsData?.data?.data || [],
          passages: passagesData?.data?.data || [],
        },
      }));
      setActiveSectionId(sectionId);
    } catch (error) {
      console.error("handleTopics error:", error);
    }
  };

  // NEW: Handle drag end
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || !activeSectionId) return;

    const activeId = active.id;
    const overId = over.id;

    // Parse the drag item type and id
    const [dragType, dragId] = activeId.split('-');

    // Check if dropping in the drop zone
    if (overId === 'drop-zone') {
      // Find the item being dragged
      let draggedItem = null;

      if (dragType === 'question') {
        draggedItem = sectionData[activeSectionId]?.questions?.find(q => q.id === parseInt(dragId));
      } else if (dragType === 'passage') {
        draggedItem = sectionData[activeSectionId]?.passages?.find(p => p.id === parseInt(dragId));
      }

      if (!draggedItem) return;

      // Add to dropped items
      setDroppedItems(prev => {
        const newDroppedItems = { ...prev };
        if (!newDroppedItems[activeSectionId]) {
          newDroppedItems[activeSectionId] = { droppedQuestions: [], droppedPassages: [] };
        }

        if (dragType === 'question') {
          // Check if already exists
          const exists = newDroppedItems[activeSectionId].droppedQuestions.some(q => q.id === draggedItem.id);
          if (!exists) {
            newDroppedItems[activeSectionId].droppedQuestions = [
              ...newDroppedItems[activeSectionId].droppedQuestions,
              draggedItem
            ];
            console.log('✅ Question added to drop zone:', {
              sectionId: activeSectionId,
              questionId: draggedItem.id,
              questionName: stripHtml(draggedItem.name),
              totalDroppedQuestions: newDroppedItems[activeSectionId].droppedQuestions.length
            });
          }
        } else if (dragType === 'passage') {
          const exists = newDroppedItems[activeSectionId].droppedPassages.some(p => p.id === draggedItem.id);
          if (!exists) {
            newDroppedItems[activeSectionId].droppedPassages = [
              ...newDroppedItems[activeSectionId].droppedPassages,
              draggedItem
            ];
            console.log('✅ Passage added to drop zone:', {
              sectionId: activeSectionId,
              passageId: draggedItem.id,
              passageName: stripHtml(draggedItem.name),
              totalDroppedPassages: newDroppedItems[activeSectionId].droppedPassages.length
            });
          }
        }

        return newDroppedItems;
      });

      // Remove from original list
      setSectionData(prev => {
        const newSectionData = { ...prev };
        if (dragType === 'question') {
          newSectionData[activeSectionId].questions = newSectionData[activeSectionId].questions.filter(
            q => q.id !== draggedItem.id
          );
          console.log('Question removed from list:', {
            sectionId: activeSectionId,
            questionId: draggedItem.id,
            remainingQuestions: newSectionData[activeSectionId].questions.length
          });
        } else if (dragType === 'passage') {
          newSectionData[activeSectionId].passages = newSectionData[activeSectionId].passages.filter(
            p => p.id !== draggedItem.id
          );
          console.log('Passage removed from list:', {
            sectionId: activeSectionId,
            passageId: draggedItem.id,
            remainingPassages: newSectionData[activeSectionId].passages.length
          });
        }
        return newSectionData;
      });
    }
  };

  // NEW: Remove item from dropped area (move back to original list)
  const removeFromDropped = (itemId, itemType) => {
    if (!activeSectionId) return;

    let itemToRestore = null;

    // Find and remove from dropped items
    setDroppedItems(prev => {
      const newDroppedItems = { ...prev };
      if (itemType === 'question') {
        itemToRestore = newDroppedItems[activeSectionId].droppedQuestions.find(q => q.id === itemId);
        newDroppedItems[activeSectionId].droppedQuestions = newDroppedItems[activeSectionId].droppedQuestions.filter(
          q => q.id !== itemId
        );
        console.log(' Question removed from drop zone:', {
          sectionId: activeSectionId,
          questionId: itemId,
          remainingDroppedQuestions: newDroppedItems[activeSectionId].droppedQuestions.length
        });
      } else if (itemType === 'passage') {
        itemToRestore = newDroppedItems[activeSectionId].droppedPassages.find(p => p.id === itemId);
        newDroppedItems[activeSectionId].droppedPassages = newDroppedItems[activeSectionId].droppedPassages.filter(
          p => p.id !== itemId
        );
        console.log(' Passage removed from drop zone:', {
          sectionId: activeSectionId,
          passageId: itemId,
          remainingDroppedPassages: newDroppedItems[activeSectionId].droppedPassages.length
        });
      }
      return newDroppedItems;
    });

    // Add back to original list
    if (itemToRestore) {
      setSectionData(prev => {
        const newSectionData = { ...prev };
        if (itemType === 'question') {
          newSectionData[activeSectionId].questions = [
            ...newSectionData[activeSectionId].questions,
            itemToRestore
          ];
          console.log('Question restored to list:', {
            sectionId: activeSectionId,
            questionId: itemToRestore.id,
            totalQuestions: newSectionData[activeSectionId].questions.length
          });
        } else if (itemType === 'passage') {
          newSectionData[activeSectionId].passages = [
            ...newSectionData[activeSectionId].passages,
            itemToRestore
          ];
          console.log('Passage restored to list:', {
            sectionId: activeSectionId,
            passageId: itemToRestore.id,
            totalPassages: newSectionData[activeSectionId].passages.length
          });
        }
        return newSectionData;
      });
    }
  };
  const handleSearch = (e) => {
    setSearch(e.target.value)
    console.log(e.target.value)
  }
  // Filter items based on search
  const getFilteredItems = (items, searchTerm) => {
    if (!searchTerm) return items;
    return items.filter(item =>
      stripHtml(item.name).toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  useEffect(() => {
    getCoursesData();
    setCurrentPage(1);
    setTotalQuestions(0);
    setTotalPassages();
    setpassageOpen(null);
    if (activeSectionId && formAdd.length > 0) {
      const formItem = formAdd.find(item => item.id === activeSectionId) || {};
      fetchQuestions(activeSectionId, formItem.multiTopics || formItem.courseVal, currentPage, pageSize);
    }
  }, [activeSectionId, formAdd, currentPage, pageSize]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="main-container p-3 ">
        <div className="tb-header p-3 mb-3 rounded-xl bg-white w-full flex item-center justify-between">
          <h3 className="text-2xl font-semibold text-blue-950">Test Builder</h3>
          <div className="">
            <button className="bg-blue-950 text-white px-8 py-2 rounded-lg">save</button>
          </div>
        </div>
        <div className="tb-body-main flex  gap-2 ">
          {/* LEFT */}
          <div className="tb-body tb-left w-[50%]">
            <div className="b-header flex flex-between items-center justify-between ">
              <ul className="flex items-center bg-white p-2 rounded-xl">
                <li>All Section</li>
              </ul>
              <ul className={`flex ${addSection.length === 0 ? "overflow-auto" : "overflow-x-scroll p-2"}`}>
                {addSection.map((sec) => (
                  <li
                    key={sec.id}
                    className={`bg-white rounded-lg p-2 relative ml-2 cursor-pointer ${String(activeSectionId) === String(sec.id) ? "bg-[#7ddbd0]  " : ""}`}
                    onClick={() => {
                      setActiveSectionId(sec.id);
                      setActiveTab("questions");
                    }}
                  >
                    <span className="text-gray-600 block w-10 text-center">{sec.title}</span>
                    <span
                      className="px-1 rounded-full bg-red-600 absolute -top-2 -right-1 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSection(sec.id);
                      }}
                    >
                      &times;
                    </span>
                  </li>
                ))}
              </ul>
              <div>
                <button
                  className="py-3 px-2 rounded-xl bg-blue-950 text-white"
                >
                  Add
                </button>
              </div>
            </div>
            <div className="p-3 bg-white rounded-2xl">
              <form onSubmit={AddSection}>
                <input
                  type="text"
                  placeholder="Title"
                  className="p-2 outline-1 outline-slate-600 border border-gray-500 rounded-md w-full mb-1"
                  value={formData.title}
                  onChange={handleChange}
                  name="title"
                  required
                />
                <select
                  name="courseVal"
                  id="courses"
                  value={formData.courseVal}
                  onChange={(e) => {
                    const newCourseId = e.target.value;
                    // If there is already a selected course and user changes it → clear all sections
                    if (formData.courseVal && formData.courseVal !== newCourseId) {
                      setAddsection([]);
                      setFormAdd([]);
                      setSectionData({});
                      setDroppedItems({});
                      setSelectedQuestion({});
                      setActiveSectionId(null);
                    }
                    // Always update formData and fetch topics
                    handleChange(e);
                    handleCourseChange(newCourseId);
                  }}
                  className="p-2 outline-1 outline-slate-600 border border-gray-500 rounded-md w-full mb-1"
                  required
                >
                  <option value="">select courses</option>
                  {courses.map((course, id) => (
                    <option key={id} className="text-black" value={course.course.id}>
                      {course.course.title}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <select
                    name="publicVal"
                    id="public"
                    value={formData.publicVal}
                    onChange={handleChange}
                    className="p-2 outline-1 outline-slate-600 border border-gray-500 rounded-md w-[50%] mb-1"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                  <select
                    name="locked"
                    id="locked"
                    className="p-2 outline-1 outline-slate-600 border border-gray-500 rounded-md w-[50%] mb-1"
                    value={formData.locked}
                    onChange={handleChange}
                  >
                    <option value="locked">Locked</option>
                    <option value="unlocked">UnLocked</option>
                  </select>
                </div>
                <button type="submit" className="py-3 px-2 rounded-xl bg-blue-950 text-white">
                  Add
                </button>
              </form>
              <div className="bottom">
                <div className="checkbox flex justify-end gap-3">
                  <label htmlFor="full-length">Full Length Test</label>
                  <input type="checkbox" name="" id="" />
                </div>
              </div>

              {/* Section list */}
              {addSection.length > 0 && (
                <ul className="border border-gray-200 rounded-xl p-1 mt-3">
                  {addSection.map((sec) => (
                    <li
                      key={sec.id}
                      className="bg-white border border-gray-300 rounded-xl p-2 relative ml-2 mb-1"
                    >
                      <span className="text text-[#26a69a]">{sec.id} </span>
                      <span
                        className=" rounded-lg bg-red-400 absolute -top-2 -right-1 cursor-pointer"
                        onClick={() => removeSection(sec.id)}
                      >
                        &times;
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="bt-text text-center mt-3 border border-slate-400 rounded-lg p-2">
                <p>
                  {activeSectionId && droppedItems[activeSectionId]
                    ? `${droppedItems[activeSectionId].droppedPassages?.length || 0} Passages, ${droppedItems[activeSectionId].droppedQuestions?.length || 0} Questions, 0 Difficulty, 0 EVAD`
                    : '0 Passages, 0 Questions, 0 Difficulty, 0 EVAD'
                  }
                </p>
              </div>
            </div>

            {/* Per-section forms */}
            <div className="section-added mt-3">
              {addSection.length > 0 && (
                <div className="">
                  {addSection.filter((e) => String(e.id) === String(activeSectionId))
                    .map((e) => {
                      const formItem = formAdd.find((item) => item.id === e.id) || {};
                      return (
                        <div key={e.id} className="created_form p-2 m-2 bg-white rounded-lg">
                          <form>
                            <input
                              type="text"
                              placeholder="Title"
                              className="p-2 outline-1 outline-slate-600 border border-gray-500 rounded-md w-full mb-1"
                              value={formItem.title || ""}
                              onChange={(event) => handleFormAdd(e.id, event)}
                              name="title"
                              required
                            />
                            <select
                              name="multiTopics"
                              value={formItem.multiTopics || ""}
                              onChange={(event) => handleFormAdd(e.id, event)}
                              className="p-2 outline-1 outline-slate-600 border border-gray-500 rounded-md w-full mb-1"
                            >
                              <option value="">Multiple Topics</option>
                              <option value="break">Break</option>
                            </select>

                            {formItem.multiTopics !== "break" && (
                              <div className="w-full">
                                <MultiSelect
                                  value={selectedQuestion[e.id] || []}
                                  onChange={(ev) => {
                                    const selected = ev.value || [];
                                    setSelectedQuestion((prev) => ({
                                      ...prev,
                                      [e.id]: selected,
                                    }));
                                    handleTopics(e.id, selected, formItem.multiTopics || e.courseVal);
                                  }}
                                  options={courses_1}
                                  optionLabel="title"
                                  optionValue="id"
                                  placeholder="Select Questions"
                                  className="p-3 bg-white w-full border border-gray-400 rounded-lg"
                                />
                              </div>
                            )}

                            <button className="w-full text-white bg-[#26a69a] p-2 rounded-xl mt-2">
                              Advance Section Formatting
                            </button>
                          </form>
                          <div className="dnd-text text-center mt-3">
                            <p className="text-slate-800">
                              <i> Drag and Drop to re-arrange section below</i>
                            </p>
                          </div>

                          {/* NEW: Drop Zone */}
                          <div id="drop-zone" className="mt-4">
                            <DroppableArea
                              title="Dropped Passages"
                              count={droppedItems[activeSectionId]?.droppedPassages?.length || 0}
                            >
                              {droppedItems[activeSectionId]?.droppedPassages?.map((passage) => (
                                <div key={passage.id} className="p-2 bg-white border border-gray-200 rounded-md flex justify-between items-center">
                                  <span className="text-[#26a69a]">
                                    {stripHtml(passage.name)}
                                  </span>
                                  <button
                                    onClick={() => removeFromDropped(passage.id, 'passage')}
                                    className="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                              {(!droppedItems[activeSectionId]?.droppedPassages || droppedItems[activeSectionId].droppedPassages.length === 0) && (
                                <p className="text-gray-500 text-center py-4">Drag passages here</p>
                              )}
                            </DroppableArea>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT - tabbed panel for the active section */}
          <div className="tb-right rounded-lg w-[50%]  ">
            {activeSectionId === null || !sectionData[activeSectionId] ? (
              <div className="p-4 bg-white rounded-lg">No data for this section.</div>
            ) : (
              <div className="p-2 bg-white rounded-lg">
                <div className="heading flex justify-between items-center">
                  <h3 className="font-bold text-gray-700 py-2">Questions</h3>
                </div>
                {/* Tabs */}
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setActiveTab("questions")}
                    className={`px-4 py-2 rounded ${activeTab === "questions" ? "bg-[#26a69a] text-white" : "bg-gray-200"}`}
                  >
                    Questions ({getFilteredItems(sectionData[activeSectionId].questions || [], search).length})
                  </button>
                  <button
                    onClick={() => setActiveTab("passages")}
                    className={`px-4 py-2 rounded ${activeTab === "passages" ? "bg-[#26a69a] text-white" : "bg-gray-200"}`}
                  >
                    Passages ({getFilteredItems(sectionData[activeSectionId].passages || [], search).length})
                  </button>
                </div>

                {/* Search box */}
                <div className="search_box flex items-center justify-between mb-4">
                  <div className="show">
                    <label htmlFor="show">Show</label>
                    <select
                      name="show"
                      id="show"
                      className="ml-2 p-1 border border-gray-300 rounded"
                      value={pageSize}
                      onChange={e => setPageSize(Number(e.target.value))}
                    >
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="30">30</option>
                    </select>
                  </div>
                  <div className="search__">
                    <label htmlFor="search">Search:</label>
                    <input
                      type="text"
                      name="search"
                      id="search"
                      value={search}
                      onChange={handleSearch}
                      className="bg-gray-200 outline-none p-1 text-[#26a69a] rounded-md ml-2"
                    />
                  </div>
                </div>

                {/* Questions Tab */}
                {activeTab === "questions" && (
                  <div>
                    <SortableContext
                      items={getFilteredItems(sectionData[activeSectionId].questions || [], search).map(q => `question-${q.id}`)}
                      strategy={verticalListSortingStrategy}
                    >
                      <ul>
                        {getFilteredItems(sectionData[activeSectionId].questions || [], search).length === 0 && (
                          <li className="p-2 text-gray-500">
                            {search ? 'No questions found matching your search.' : 'No questions selected yet.'}
                          </li>
                        )}
                        {getFilteredItems(sectionData[activeSectionId].questions || [], search).map((q) => (
                          <DraggableItem key={q.id} id={q.id} type="question">
                            <div className="flex justify-between items-center">
                              <span>{stripHtml(q.name)}</span>
                              <span className="text-xs text-gray-500 ml-2">Drag me</span>
                            </div>
                          </DraggableItem>
                        ))}
                      </ul>
                    </SortableContext>
                  </div>
                )}

                {/* Passages Tab */}
                {activeTab === "passages" && (
                  <div>
                    <SortableContext
                      items={getFilteredItems(sectionData[activeSectionId].passages || [], search).map(p => `passage-${p.id}`)}
                      strategy={verticalListSortingStrategy}
                    >
                      <ul>
                        {getFilteredItems(sectionData[activeSectionId].passages || [], search).length === 0 && (
                          <li className="p-2 text-gray-500">
                            {search ? 'No passages found matching your search.' : 'No passages available.'}
                          </li>
                        )}
                        {getFilteredItems(sectionData[activeSectionId].passages || [], search).map((p) => (
                          <DraggableItem key={p.id} id={p.id} type="passage">
                            <div
                              className="cursor-pointer"
                              onClick={() => handlePassageToggle(p.id)}
                            >
                              <div className="flex justify-between items-center">
                                <span>{stripHtml(p.name)}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[#26a69a]">
                                    {passageOpen === p.id ? "⮟" : "⮟"}
                                  </span>
                                </div>
                              </div>

                              {passageOpen === p.id && (
                                <div className="mt-2 pl-4 border-l-2 border-gray-200">
                                  {p.questions.length > 0 ? (
                                    <div>
                                      <h4 className="font-bold text-gray-900 mt-2">Questions</h4>
                                      <ul className="mt-1">
                                        {p.questions.map((pas) => (
                                          <li
                                            key={pas.id}
                                            className="text-[#26a69a] border border-gray-300 rounded-md my-2 p-2"
                                          >
                                            {stripHtml(pas.name)}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  ) : (
                                    <div>
                                      <h4 className="font-bold text-gray-900 mt-2">Questions</h4>
                                      <div className="font-bold text-blue-800 bg-blue-300 rounded-lg border border-gray-400 mt-2 p-2">
                                        No Record Found
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </DraggableItem>
                        ))}
                      </ul>
                    </SortableContext>
                  </div>
                )}
              </div>
            )}
            <div className="card">
              <Paginator
                first={(currentPage - 1) * pageSize}
                rows={pageSize}
                totalRecords={totalQuestions}
                onPageChange={onPageChange}
                template={{ layout: 'PrevPageLink CurrentPageReport NextPageLink' }}
              />
            </div>
          </div>
        </div>
      </div>
    </DndContext>
  );
};

export default TestBuilder;

// title="Dropped Questions"
//                               count={droppedItems[activeSectionId]?.droppedQuestions?.length || 0}
//                             >
//                               {droppedItems[activeSectionId]?.droppedQuestions?.map((question) => (
//                                 <div key={question.id} className="p-2 bg-white border border-gray-200 rounded-md flex justify-between items-center">
//                                   <span className="text-[#26a69a] font-semibold">
//                                     {stripHtml(question.name)}
//                                   </span>
//                                   <button
//                                     onClick={() => removeFromDropped(question.id, 'question')}
//                                     className="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
//                                   >
//                                     Remove
//                                   </button>
//                                 </div>
//                               ))}
//                               {(!droppedItems[activeSectionId]?.droppedQuestions || droppedItems[activeSectionId].droppedQuestions.length === 0) && (
//                                 <p className="text-gray-500 text-center py-4">Drag questions here</p>
//                               )}
//                             </DroppableArea>

//                             <DroppableArea