import React, { useEffect, useState } from "react";
import { MultiSelect } from "primereact/multiselect";
// import {
//   DragDropContext,
//   Droppable,
//   Draggable,
// } from "@hello-pangea/dnd";
const Test = () => {
  const stripHtml = (htmlString) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    return doc.body.textContent || "";
  };

  const makeId = () =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const [sectionData, setSectionData] = useState({});
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [activeTab, setActiveTab] = useState("questions");
  const [selectedQuestion, setSelectedQuestion] = useState({});
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
  // All available questions & passages that act as the DRAG SOURCE
  const [allQuestions, setAllQuestions] = useState([]);
  const [allPassages, setAllPassages] = useState([]);
  const [passageOpen, setpassageOpen] = useState(false)
  const handlePassageToggle = (id) => {
    setpassageOpen(prev => prev === id ? null : id);
  }
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
    // append new section
    setAddsection((prev) => [...prev, newSection]);
    setFormAdd((prev) => [...prev, newFormData]);
    // initialize data containers for the new section (empty drop zones)
    setSectionData((prev) => ({
      ...prev,
      [newId]: { questions: [], passages: [] },
    }));
    console.log(formData, "112233")
    setSelectedQuestion((prev) => ({ ...prev, [newId]: [] }));
    // make the newly added section active in right panel
    setActiveSectionId(newId);
    // reset only non-course fields (keep courseVal)
    setformData((prev) => ({
      ...prev,
      title: "",
      publicVal: "",
      locked: "",
    }));
  };
  const removeSection = (sectionIdToRemove) => {
    const filteredSections = addSection.filter(
      (sec) => String(sec.id) !== String(sectionIdToRemove)
    );
    setAddsection(filteredSections);
    const updatedFormAdd = formAdd.filter(
      (item) => String(item.id) !== String(sectionIdToRemove)
    );
    setFormAdd(updatedFormAdd);
    setSelectedQuestion((prev) => {
      const copy = { ...prev };
      delete copy[sectionIdToRemove];
      return copy;
    });
    setSectionData((prev) => {
      const copy = { ...prev };
      delete copy[sectionIdToRemove];
      return copy;
    });
    setActiveSectionId((prevActive) => {
      if (String(prevActive) === String(sectionIdToRemove)) {
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
            authorization: "eyJhbGciOiJIUzI1NiJ9.eyJ0cnVlX3VzZXJfaWQiOm51bGwsInVzZXJfaWQiOiJiN2UyOGZjOS04YmExLTRjZWUtYWZlYS0yOTFjYTE1MmYyNmQiLCJleHAiOjE3ODU5MTk0MDd9.UI12IbbjeYpt3x6gJ2Z-nX3QRL9SoQLLvx4soiI4Hb8",
          },
        }
      );
      const data = await response.json();
      setCourses(data.data || []);
    } catch (error) {
      console.error("getCoursesData error:", error);
    }
  };
  // NOTE: we change handleCourseChange to populate topics (unchanged)
  const handleCourseChange = async (id) => {
    try {
      const response = await fetch(
        `https://api.natsent.com/api/v1/commons/test_builders/get_course_topics?id=${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            authorization: "eyJhbGciOiJIUzI1NiJ9.eyJ0cnVlX3VzZXJfaWQiOm51bGwsInVzZXJfaWQiOiJiN2UyOGZjOS04YmExLTRjZWUtYWZlYS0yOTFjYTE1MmYyNmQiLCJleHAiOjE3ODU5MTk0MDd9.UI12IbbjeYpt3x6gJ2Z-nX3QRL9SoQLLvx4soiI4Hb8",
          },
        }
      );
      const data = await response.json();
      setCourses_1(data.data || []);
    } catch (error) {
      console.error("handleCourseChange error:", error);
    }
  };
  // IMPORTANT: handleTopics now loads the RIGHT PANEL source data (allQuestions/allPassages)
  // instead of putting those items directly into a section. Sections start empty and only receive items via DnD.
  const handleTopics = async (sectionId, questionIds, topicId) => {
    if (!sectionId) return;
    try {
      const responsePassages = await fetch(
        "https://api.natsent.com/api/v1/commons/test_builders/get_all_passages",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: "eyJhbGciOiJIUzI1NiJ9.eyJ0cnVlX3VzZXJfaWQiOm51bGwsInVzZXJfaWQiOiJiN2UyOGZjOS04YmExLTRjZWUtYWZlYS0yOTFjYTE1MmYyNmQiLCJleHAiOjE3ODU5MTk0MDd9.UI12IbbjeYpt3x6gJ2Z-nX3QRL9SoQLLvx4soiI4Hb8",
          },
          body: JSON.stringify({ ids: [topicId] }),
        }
      );
      const passagesData = await responsePassages.json();
      const responseQuestions = await fetch(
        "https://api.natsent.com/api/v1/commons/test_builders/get_all_questions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: "eyJhbGciOiJIUzI1NiJ9.eyJ0cnVlX3VzZXJfaWQiOm51bGwsInVzZXJfaWQiOiJiN2UyOGZjOS04YmExLTRjZWUtYWZlYS0yOTFjYTE1MmYyNmQiLCJleHAiOjE3ODU5MTk0MDd9.UI12IbbjeYpt3x6gJ2Z-nX3QRL9SoQLLvx4soiI4Hb8",
          },
          body: JSON.stringify({ ids: questionIds }),
        }
      );
      const questionsData = await responseQuestions.json();
      // populate the right-panel source with fetched items
      setAllQuestions(questionsData?.data?.data || []);
      setAllPassages(passagesData?.data?.data || []);
      // keep the active section focused
      console.log(allPassages, "All Pasages")
      setActiveSectionId(sectionId);
    } catch (error) {
      console.error("handleTopics error:", error);
    }
  };
  useEffect(() => {
    getCoursesData();
  }, []);
  // ------------------ DnD logic ------------------
  // Source droppable ids:
  // const SOURCE_QUESTIONS = "source-questions";
  // const SOURCE_PASSAGES = "source-passages";

  // const parseSectionDroppableId = (droppableId) => {
  //   // for droppableId like: "section::<id>::questions" or "section::<id>::passages"
  //   const parts = droppableId.split("::");
  //   if (parts.length !== 3) return null;
  //   return { sectionId: parts[1], type: parts[2] };
  // };

  // const handleDragEnd = useCallback(
  //   (result) => {
  //     const { source, destination, draggableId } = result;
  //     if (!destination) return;

  //     // if dropped in same position
  //     if (
  //       source.droppableId === destination.droppableId &&
  //       source.index === destination.index
  //     )
  //       return;
  //     // --- Dragging FROM SOURCE to a SECTION (copy behavior) ---
  //     if (source.droppableId === SOURCE_QUESTIONS) {
  //       // only allow drop into section target
  //       const dest = parseSectionDroppableId(destination.droppableId);
  //       if (!dest) return;

  //       const itemId = String(draggableId).replace(/^q-/, "");
  //       const item = allQuestions.find((x) => String(x.id) === String(itemId));
  //       if (!item) return;

  //       setSectionData((prev) => {
  //         const copy = { ...prev };
  //         if (!copy[dest.sectionId]) copy[dest.sectionId] = { questions: [], passages: [] };

  //         // prevent duplicate in same section
  //         if (copy[dest.sectionId].questions.some((q) => String(q.id) === String(item.id))) return prev;

  //         copy[dest.sectionId] = {
  //           ...copy[dest.sectionId],
  //           questions: [...(copy[dest.sectionId].questions || []), item],
  //         };

  //         return copy;
  //       });

  //       return;
  //     }

  //     if (source.droppableId === SOURCE_PASSAGES) {
  //       const dest = parseSectionDroppableId(destination.droppableId);
  //       if (!dest) return;

  //       const itemId = String(draggableId).replace(/^p-/, "");
  //       const item = allPassages.find((x) => String(x.id) === String(itemId));
  //       if (!item) return;

  //       setSectionData((prev) => {
  //         const copy = { ...prev };
  //         if (!copy[dest.sectionId]) copy[dest.sectionId] = { questions: [], passages: [] };

  //         if (copy[dest.sectionId].passages.some((p) => String(p.id) === String(item.id))) return prev;

  //         copy[dest.sectionId] = {
  //           ...copy[dest.sectionId],
  //           passages: [...(copy[dest.sectionId].passages || []), item],
  //         };

  //         return copy;
  //       });

  //       return;
  //     }

  //     // --- Dragging BETWEEN SECTIONS (move/reorder behavior) ---
  //     const src = parseSectionDroppableId(source.droppableId);
  //     const dest = parseSectionDroppableId(destination.droppableId);
  //     if (!src || !dest) return;

  //     // same section + same type => reorder
  //     if (src.sectionId === dest.sectionId && src.type === dest.type) {
  //       setSectionData((prev) => {
  //         const copy = { ...prev };
  //         const list = Array.from(copy[src.sectionId][src.type] || []);
  //         const [moved] = list.splice(source.index, 1);
  //         list.splice(destination.index, 0, moved);
  //         copy[src.sectionId] = { ...copy[src.sectionId], [src.type]: list };
  //         return copy;
  //       });
  //       return;
  //     }

  //     // moving from one section to another (different type or different section)
  //     setSectionData((prev) => {
  //       const copy = { ...prev };
  //       const fromList = Array.from(copy[src.sectionId][src.type] || []);
  //       const [moved] = fromList.splice(source.index, 1);

  //       const toList = Array.from(copy[dest.sectionId][dest.type] || []);
  //       toList.splice(destination.index, 0, moved);

  //       copy[src.sectionId] = { ...copy[src.sectionId], [src.type]: fromList };
  //       copy[dest.sectionId] = { ...copy[dest.sectionId], [dest.type]: toList };

  //       return copy;
  //     });
  //   },
  //   [allQuestions, allPassages]
  // );
  const handleMultiTopics = (e) => {
    e.preventDefault()
    console.log("handle multi topic clicked ")
    console.log(formAdd, "ewred")
  }

  return (
    <div className="main-container p-3 ">
      <div className="tb-header p-3 mb-3 rounded-xl bg-white w-full flex item-center justify-between">
        <h3 className="text-2xl font-semibold text-blue-950">Test Builder</h3>
        <div className="">
          <button className="bg-blue-950 text-white px-8 py-2 rounded-lg">save</button>
        </div>
      </div>

      {/* <DragDropContext onDragEnd={handleDragEnd}> */}
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
                  className={`bg-white rounded-lg p-2 relative ml-2 cursor-pointer ${String(activeSectionId) === String(sec.id) ? "bg-[#2db6a8]" : ""}`}
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
                  if (formData.courseVal && formData.courseVal !== newCourseId) {
                    setAddsection([]);
                    setFormAdd([]);
                    setSectionData({});
                    setSelectedQuestion({});
                    setActiveSectionId(null);
                  }
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
                    {/* || {course.course.id} */}
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
                <input type="checkbox" name="full-length" id="full-length" />
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
                    <span className="text text-[#26a69a]">{sec.title} </span>
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
              <p> 0 Passages, 0 Questions, 0 Difficulty, 0 EVAD</p>
            </div>
          </div>
          {/* Per-section forms (these will receive drops) */}
          <div className="section-added mt-3">
            {addSection.length > 0 && (
              <div className="">
                {addSection
                  .filter((e) => String(e.id) === String(activeSectionId))
                  .map((e) => {
                    const formItem = formAdd.find((item) => item.id === e.id) || {};
                    const secItems = sectionData[e.id] || { questions: [], passages: [] };
                    return (
                      <div key={e.id} className="created_form p-2 bg-white rounded-lg">
                        <form onSubmit={handleMultiTopics} >
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
                            value={formItem.multiTopics}
                            onChange={(event) => handleFormAdd(e.id, event)}
                            className="p-2 outline-1 outline-slate-600 border border-gray-500 rounded-md w-full mb-1"
                          >
                            <option value="multitopics">Multiple Topics</option>
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

                          <button type="submit" className="w-full text-white bg-[#26a69a] p-2 rounded-xl mt-2">
                            Advance Section Formatting
                          </button>
                        </form>
                        <div className="dnd-area mt-3">
                          <h4 className="font-semibold">Drop Questions for this section</h4>
                          <div

                            className="min-h-[60px] p-2 text-[#26a69a] border border-dashed rounded-md"
                          >
                            {(secItems.questions || []).length === 0 && (
                              <div className="text-sm ">Drop questions here</div>
                            )}
                            {(secItems.questions || []).map((q) => (
                              <div
                                className="p-2 my-1 bg-white border rounded-md"
                              >
                                {stripHtml(q.name)}
                              </div>

                            ))}
                          </div>
                          <h4 className="font-semibold mt-3">Drop Passages for this section</h4>
                          <div

                            className="min-h-[60px] p-2 border border-dashed rounded-md"
                          >
                            {(secItems.passages || []).length === 0 && (
                              <div className="text-sm text-gray-500">Drop passages here</div>
                            )}
                            {(secItems.passages || []).map((p) => (
                              <div
                                className="p-2 my-1 bg-white border rounded-md"
                              >
                                {stripHtml(p.name)}
                              </div>

                            ))}
                          </div>

                          <div className="dnd-text text-center mt-3">
                            <p className="text-slate-800">
                              <i> Drag items from the right panel into these boxes</i>
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT - tabbed panel for the active section (source of draggables) */}
        <div className="tb-right rounded-lg w-[50%]  ">
          {/* Right panel now acts as a SOURCE (shows allQuestions / allPassages) */}
          <div className="p-2 bg-white rounded-lg">
            {/* Tabs */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setActiveTab("questions")}
                className={`px-4 py-2 rounded ${activeTab === "questions" ? "bg-[#26a69a] text-white" : "bg-gray-200"}`}
              > Questions
              </button>
              <button
                onClick={() => setActiveTab("passages")}
                className={`px-4 py-2 rounded ${activeTab === "passages" ? "bg-[#26a69a] text-white" : "bg-gray-200"}`}
              >Passages
              </button>
            </div>
            {/* Source lists: these are draggable items but not droppable targets */}
            {activeTab === "questions" && addSection.length > 0 && (
              <ul>
                {(allQuestions || []).length === 0 && (
                  <li className="p-2 text-gray-500">No questions loaded. Use the Question to load.</li>
                )}
                {(allQuestions || []).map((q) => (
                  <li key={q.id}
                    className="p-2 border text-[#26a69a] font-semibold border-gray-200 rounded-md mb-1 cursor-move bg-white"
                  >
                    {stripHtml(q.name)}
                  </li>

                ))}
              </ul>
            )}

            {activeTab === "passages" && (
              <ul>
                {(allPassages || []).length === 0 && (
                  <li className="p-2 text-gray-500">No passages available.</li>
                )}
                {(allPassages || []).map((p) => (
                  <li
                    key={p.id}
                    className="p-2 border border-gray-200 rounded-md mb-1   text-[#26a69a] cursor-pointer"
                    onClick={() => handlePassageToggle(p.id)}
                  >
                    {stripHtml(p.name)}{" "}
                    {passageOpen === p.id ? (
                      <span className="text-[#26a69a] flex items-start justify-end">⮟</span>
                    ) : (
                      <span className="text-[#26a69a] flex items-start justify-end">⮟</span>
                    )}
                    {passageOpen === p.id && (
                      <ul>
                        {p.questions.length > 0 ? <h3 className="font-bold text-gray-900 mt-2">Questions</h3>
                          : ""}
                        {p.questions.map((pas) => (
                          <li
                            key={pas.id}
                            className="text-[#26a69a] border border-gray-300 rounded-md my-2 p-2 "
                          >
                            {stripHtml(pas.name)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Test;

