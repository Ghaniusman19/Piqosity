import { useEffect, useState } from "react";
import { MultiSelect } from "primereact/multiselect";
const TestBuilder = () => {
  const stripHtml = (htmlString) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    return doc.body.textContent || "";
  };
  // Robust display label extractor - tries a few common fields and falls back to id
  const getDisplayLabel = (item, prefix = '') => {
    if (!item) return prefix ? `${prefix} ?` : 'Unknown';
    const name = item.name || item.title || item.question || item.question_text || item.text || item.body;
    const id = item.id || item._id || item.question_id || item.passage_id;
    if (name && typeof name === 'string' && name.trim() !== '') return name;
    if (id) return `${prefix ? prefix + ' ' : ''}${id}`;
    return prefix ? `${prefix} ?` : 'Unknown';
  };
  const makeId = () =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const [sectionData, setSectionData] = useState({});
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [activeTab, setActiveTab] = useState("questions");
  const [selectedQuestion, setSelectedQuestion] = useState({});
  const [passageOpen, setpassageOpen] = useState(null)
  const handlePassageToggle = (id) => {
    console.log("Passage toggle clicked for ID:", id);
    console.log("Current passageOpen state:", passageOpen);
    setpassageOpen(prev => {
      const newState = prev === id ? null : id;
      console.log("New passageOpen state:", newState);
      return newState;
    });
  }
  const [search, setSearch] = useState('')
  const [addSection, setAddsection] = useState([]);
  const [formAdd, setFormAdd] = useState([]);
  // per-section dropped items: { [sectionId]: { questions: [], passages: [], questionIds: [], passageIds: [] } }
  const [droppedItems, setDroppedItems] = useState({});
  const [courses, setCourses] = useState([]);
  const [courses_1, setCourses_1] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setformData] = useState({
    id: -1,
    title: "",
    courseVal: "",
    publicVal: "",
    locked: "",
  });
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
    setAddsection((prev) => [...prev, newSection]);
    setFormAdd((prev) => [...prev, newFormData]);
    setSectionData((prev) => ({
      ...prev,
      [newId]: { questions: [], passages: [] },
    }));
    setSelectedQuestion((prev) => ({ ...prev, [newId]: [] }));
    setActiveSectionId(newId);
    console.log("New section created with ID:", newId);
    console.log("Section data after creation:", { ...sectionData, [newId]: { questions: [], passages: [] } });
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

    console.log('=== handleTopics Debug Info ===');
    console.log('Section ID:', sectionId);
    console.log('Question IDs:', questionIds);
    console.log('Topic ID:', topicId);

    setLoading(true);

    try {
      // First, let's get passages
      const responsePassages = await fetch(
        "https://api.natsent.com/api/v1/commons/test_builders/get_all_passages",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization:
              "eyJhbGciOiJIUzI1NiJ9.eyJ0cnVlX3VzZXJfaWQiOm51bGwsInVzZXJfaWQiOiJiN2UyOGZjOS04YmExLTRjZWUtYWZlYS0yOTFjYTE1MmYyNmQiLCJleHAiOjE3ODU5MTk0MDd9.UI12IbbjeYpt3x6gJ2Z-nX3QRL9SoQLLvx4soiI4Hb8",
          },
          body: JSON.stringify({
            ids: Array.isArray(topicId) ? topicId : [topicId], // Ensure it's an array
          }),
        }
      );

      if (!responsePassages.ok) {
        throw new Error(`Passages API failed: ${responsePassages.status}`);
      }

      const passagesData = await responsePassages.json();
      console.log("Passages API Raw Response:", passagesData);

      // Now get questions - Fix the parameter structure
      const responseQuestions = await fetch(
        "https://api.natsent.com/api/v1/commons/test_builders/get_all_questions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization:
              "eyJhbGciOiJIUzI1NiJ9.eyJ0cnVlX3VzZXJfaWQiOm51bGwsInVzZXJfaWQiOiJiN2UyOGZjOS04YmExLTRjZWUtYWZlYS0yOTFjYTE1MmYyNmQiLCJleHAiOjE3ODU5MTk0MDd9.UI12IbbjeYpt3x6gJ2Z-nX3QRL9SoQLLvx4soiI4Hb8",
          },
          body: JSON.stringify({
            // Try different parameter structures based on what your API expects
            ids: questionIds, // Remove the extra array wrapper
            // Alternative: topic_ids: questionIds,
            // Alternative: question_ids: questionIds,
          }),
        }
      );

      if (!responseQuestions.ok) {
        throw new Error(`Questions API failed: ${responseQuestions.status}`);
      }

      const questionsData = await responseQuestions.json();
      console.log("Questions API Raw Response:", questionsData);

      // Debug the data structure
      console.log("Questions data path check:");
      console.log("questionsData.data:", questionsData.data);
      console.log("questionsData.data.data:", questionsData?.data?.data);
      console.log("Direct questionsData array check:", Array.isArray(questionsData));

      // Try different possible response structures
      let finalQuestions = [];
      let finalPassages = [];

      // For questions - try different possible structures
      if (questionsData?.data?.data && Array.isArray(questionsData.data.data)) {
        finalQuestions = questionsData.data.data;
      } else if (questionsData?.data && Array.isArray(questionsData.data)) {
        finalQuestions = questionsData.data;
      } else if (Array.isArray(questionsData)) {
        finalQuestions = questionsData;
      } else {
        console.warn("Questions: Unexpected response structure", questionsData);
      }

      // For passages - try different possible structures  
      if (passagesData?.data?.data && Array.isArray(passagesData.data.data)) {
        finalPassages = passagesData.data.data;
      } else if (passagesData?.data && Array.isArray(passagesData.data)) {
        finalPassages = passagesData.data;
      } else if (Array.isArray(passagesData)) {
        finalPassages = passagesData;
      } else {
        console.warn("Passages: Unexpected response structure", passagesData);
      }

      console.log("Final processed questions:", finalQuestions);
      console.log("Final processed passages:", finalPassages);

      setSectionData((prev) => ({
        ...prev,
        [sectionId]: {
          questions: finalQuestions,
          passages: finalPassages,
        },
      }));

      setActiveSectionId(sectionId);
      console.log("handleTopics completed successfully");

    } catch (error) {
      console.error("handleTopics error:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack
      });
    } finally {
      setLoading(false);
    }
  };
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  useEffect(() => {
    getCoursesData();
    checkAPI();
    setpassageOpen(null);
  }, [activeSectionId]);
  useEffect(() => {
    console.log("Section data updated:", sectionData);
    console.log("Active section ID:", activeSectionId);
    if (activeSectionId && sectionData[activeSectionId]) {
      console.log("Current section questions:", sectionData[activeSectionId].questions);
      console.log("Current section passages:", sectionData[activeSectionId].passages);
    }
  }, [sectionData, activeSectionId]);
  const [advanceModal, setAdvanceModal] = useState(false);
  const hasSelectedQuestions = selectedQuestion[activeSectionId] && selectedQuestion[activeSectionId].length > 0;
  const [filterActive, setFilterActive] = useState(false);
  const handleSearch = (e) => {
    setSearch(e.target.value)
    console.log(e.target.value)
    // const filterSearch = sectionData.sectionId.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
    // setSectionData(filterSearch)
    console.log(sectionData)
  }

  // Add question to active section dropped list and remove from source
  const handleAddQuestion = (question) => {
    if (!activeSectionId) return;
    setDroppedItems(prev => {
      const copy = { ...prev };
      if (!copy[activeSectionId]) copy[activeSectionId] = { questions: [], passages: [], questionIds: [], passageIds: [] };
      if (!copy[activeSectionId].questionIds.includes(question.id)) {
        copy[activeSectionId].questions = [...copy[activeSectionId].questions, question];
        copy[activeSectionId].questionIds = [...copy[activeSectionId].questionIds, question.id];
      }
      console.log('Dropped questionIds for', activeSectionId, copy[activeSectionId].questionIds);
      return copy;
    });

    setSectionData(prev => {
      const copy = { ...prev };
      if (!copy[activeSectionId]) return prev;
      copy[activeSectionId] = {
        ...copy[activeSectionId],
        questions: (copy[activeSectionId].questions || []).filter(q => q.id !== question.id),
      };
      console.log('Remaining source question ids after add:', copy[activeSectionId].questions.map(q => q.id));
      return copy;
    });
  };

  // Add passage to active section dropped list and remove from source
  const handleAddPassage = (passage) => {
    if (!activeSectionId) return;
    setDroppedItems(prev => {
      const copy = { ...prev };
      if (!copy[activeSectionId]) copy[activeSectionId] = { questions: [], passages: [], questionIds: [], passageIds: [] };
      if (!copy[activeSectionId].passageIds.includes(passage.id)) {
        copy[activeSectionId].passages = [...copy[activeSectionId].passages, passage];
        copy[activeSectionId].passageIds = [...copy[activeSectionId].passageIds, passage.id];
      }
      console.log('Dropped passageIds for', activeSectionId, copy[activeSectionId].passageIds);
      return copy;
    });

    setSectionData(prev => {
      const copy = { ...prev };
      if (!copy[activeSectionId]) return prev;
      copy[activeSectionId] = {
        ...copy[activeSectionId],
        passages: (copy[activeSectionId].passages || []).filter(p => p.id !== passage.id),
      };
      console.log('Remaining source passage ids after add:', copy[activeSectionId].passages.map(p => p.id));
      return copy;
    });
  };

  // Remove from dropped and restore back to source lists
  const handleRemoveDroppedQuestion = (questionId) => {
    if (!activeSectionId) return;
    // remove from droppedItems and capture the full item to restore
    let restoredItem = null;
    setDroppedItems(prev => {
      const copy = { ...prev };
      if (!copy[activeSectionId]) return prev;
      const existing = copy[activeSectionId].questions || [];
      const remaining = existing.filter(q => {
        const keep = q.id !== questionId;
        if (!keep) restoredItem = q;
        return keep;
      });
      copy[activeSectionId] = {
        ...copy[activeSectionId],
        questions: remaining,
        questionIds: (copy[activeSectionId].questionIds || []).filter(id => id !== questionId),
      };
      console.log('Dropped questionIds after remove for', activeSectionId, copy[activeSectionId].questionIds);
      return copy;
    });

    // restore the full item back into sectionData if we found it
    if (restoredItem) {
      // normalize the restored item to ensure it has a displayable name
      const normalized = {
        ...restoredItem,
        id: restoredItem.id || restoredItem._id || restoredItem.question_id || restoredItem.passage_id,
        name:
          restoredItem.name ||
          restoredItem.title ||
          restoredItem.question ||
          restoredItem.question_text ||
          `Q ${restoredItem.id || restoredItem._id || ''}`,
      };
      setSectionData(prev => {
        const copy = { ...prev };
        if (!copy[activeSectionId]) copy[activeSectionId] = { questions: [], passages: [] };
        copy[activeSectionId] = {
          ...copy[activeSectionId],
          questions: [...(copy[activeSectionId].questions || []), normalized],
        };
        console.log('Restored question into source list:', normalized);
        return copy;
      });
    }
  };

  const handleRemoveDroppedPassage = (passageId) => {
    if (!activeSectionId) return;
    // remove from droppedItems and capture the full passage to restore
    let restoredPassage = null;
    setDroppedItems(prev => {
      const copy = { ...prev };
      if (!copy[activeSectionId]) return prev;
      const existing = copy[activeSectionId].passages || [];
      const remaining = existing.filter(p => {
        const keep = p.id !== passageId;
        if (!keep) restoredPassage = p;
        return keep;
      });
      copy[activeSectionId] = {
        ...copy[activeSectionId],
        passages: remaining,
        passageIds: (copy[activeSectionId].passageIds || []).filter(id => id !== passageId),
      };
      console.log('Dropped passageIds after remove for', activeSectionId, copy[activeSectionId].passageIds);
      return copy;
    });

    if (restoredPassage) {
      const normalized = {
        ...restoredPassage,
        id: restoredPassage.id || restoredPassage._id || restoredPassage.passage_id,
        name: restoredPassage.name || restoredPassage.title || `P ${restoredPassage.id || restoredPassage._id || ''}`,
      };
      setSectionData(prev => {
        const copy = { ...prev };
        if (!copy[activeSectionId]) copy[activeSectionId] = { questions: [], passages: [] };
        copy[activeSectionId] = {
          ...copy[activeSectionId],
          passages: [...(copy[activeSectionId].passages || []), normalized],
        };
        console.log('Restored passage into source list:', normalized);
        return copy;
      });
    }
  };
  const [fetchTopics, setfetchTopics] = useState([]);
  const checkAPI = async () => {
    console.log("check");
    try {
      const response = await fetch(`https://api.natsent.com/api/v1/commons/test_builders/get_sub_topics_of_topics?ids=%5B%226c19a0d6-f285-4326-a38f-0cc10205d475%22,%22332f63f0-3c38-42fa-8b12-433aac528e12%22,%22d3fe7910-bfe6-4a93-ac65-d4243c020b45%22,%224313a43b-80c2-47c8-ac4a-67ccc0483ec1%22,%229b6fbad2-5c81-498a-86c8-1032bfcaefaf%22%5D`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            authorization: "eyJhbGciOiJIUzI1NiJ9.eyJ0cnVlX3VzZXJfaWQiOm51bGwsInVzZXJfaWQiOiJiN2UyOGZjOS04YmExLTRjZWUtYWZlYS0yOTFjYTE1MmYyNmQiLCJleHAiOjE3ODU5MTk0MDd9.UI12IbbjeYpt3x6gJ2Z-nX3QRL9SoQLLvx4soiI4Hb8"
          }
        }
      )
      const data = await response.json();
      console.log(data.data)
      setfetchTopics(data.data);
      console.log(fetchTopics)
    } catch (error) {
      console.log(error)
    }
  }
  return (
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
                  <span className="px-1 rounded-full bg-red-600 absolute -top-2 -right-1 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSection(sec.id);
                    }}
                  >&times;
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
                    setSelectedQuestion({});
                    setActiveSectionId(null);
                  }   // Always update formData and fetch topics
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
              <p> 0 Passages, 0 Questions, 0 Difficulty, 0 EVAD</p>
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
                                  console.log("MultiSelect onChange triggered:");
                                  console.log("Section ID:", e.id);
                                  console.log("Selected values:", selected);
                                  console.log("Form item multiTopics:", formItem.multiTopics);
                                  console.log("Course value:", e.courseVal);

                                  setSelectedQuestion((prev) => {
                                    const newState = {
                                      ...prev,
                                      [e.id]: selected,
                                    };
                                    console.log("Updated selectedQuestion state:", newState);
                                    return newState;
                                  });

                                  // Only call handleTopics if we have selected topics
                                  if (selected && selected.length > 0) {
                                    // Determine what to use as the topic ID - this might need adjustment
                                    const topicIdToUse = formItem.multiTopics || e.courseVal || selected[0];

                                    console.log("Calling handleTopics with:");
                                    console.log("- sectionId:", e.id);
                                    console.log("- questionIds (selected):", selected);
                                    console.log("- topicId:", topicIdToUse);

                                    handleTopics(e.id, selected, topicIdToUse);
                                  } else {
                                    console.log("No topics selected, clearing section data");
                                    // Clear the section data when nothing is selected
                                    setSectionData((prev) => ({
                                      ...prev,
                                      [e.id]: { questions: [], passages: [] },
                                    }));
                                  }
                                }}
                                options={courses_1}
                                optionLabel="title"
                                optionValue="id"
                                placeholder="Select Topics"
                                className="p-3 bg-white w-full border border-gray-400 rounded-lg"
                              />
                            </div>
                          )}
                        </form>
                        <div className="button__">
                          <button
                            className="w-full text-white bg-[#26a69a] p-2 rounded-xl mt-2 cursor-pointer"
                            onClick={() => setAdvanceModal(!advanceModal)}
                          >
                            Advance Section Formatting
                          </button>
                        </div>
                        <div className="dnd-text text-center mt-3">
                          <p className="text-slate-800">
                            <i> Drag and Drop to re-arrange section below</i>
                          </p>
                        </div>
                        {/* Render dropped items for this section */}
                        <div className="mt-4 bg-gray-50 p-3 rounded">
                          <h4 className="font-semibold">Dropped Items for this section</h4>
                          <div className="mt-2">
                            <div className="mb-2">
                              <strong>Questions:</strong>
                              <div className="space-y-2 mt-1">
                                {(droppedItems[e.id]?.questions || []).map((dq) => (
                                  <div key={dq.id} className="flex justify-between items-center p-2 bg-white border rounded">
                                    <span className="text-[#26a69a]">{stripHtml(dq.name || dq.title || `Q ${dq.id}`)}</span>
                                    <button onClick={() => { setActiveSectionId(e.id); handleRemoveDroppedQuestion(dq.id); }} className="px-2 py-1 bg-red-500 text-white rounded text-sm">Remove</button>
                                  </div>
                                ))}
                                {!(droppedItems[e.id]?.questions?.length) && (<div className="text-sm text-gray-500">No dropped questions</div>)}
                              </div>
                            </div>
                            <div>
                              <strong>Passages:</strong>
                              <div className="space-y-2 mt-1">
                                {(droppedItems[e.id]?.passages || []).map((dp) => (
                                  <div key={dp.id} className="flex justify-between items-center p-2 bg-white border rounded">
                                    <span className="text-[#26a69a]">{stripHtml(dp.name || dp.title || `P ${dp.id}`)}</span>
                                    <button onClick={() => { setActiveSectionId(e.id); handleRemoveDroppedPassage(dp.id); }} className="px-2 py-1 bg-red-500 text-white rounded text-sm">Remove</button>
                                  </div>
                                ))}
                                {!(droppedItems[e.id]?.passages?.length) && (<div className="text-sm text-gray-500">No dropped passages</div>)}
                              </div>
                            </div>
                          </div>
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
              <div className="heading  justify-between items-center">
                <div className="flex justify-end items-center mb-2 relative" >
                  {hasSelectedQuestions && (
                    <button
                      className="mb-2 px-4 py-2 bg-[#26a69a] text-end text-white rounded relative"
                      onClick={() => setFilterActive(prev => !prev)}
                    >
                      &#x2617;

                    </button>
                  )
                  }
                  {
                    filterActive && (
                      <div className="absolute top-10 right-10 shadow-lg text-black flex flex-col gap-2 bg-white rounded-lg p-2 z-10">
                        <div className="difficulty  ">
                          <select name="difficulty" id="difficulty" className="w-full p-2 outline-1 outline-slate-600 border border-gray-500 rounded-md">
                            <option value="">select difficulty</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                            <option value="6">6</option>
                            <option value="7">7</option>
                            <option value="8">8</option>
                            <option value="9">9</option>

                          </select>
                        </div>
                        <div className="difficulty">
                          <select name="difficulty" id="difficulty" className="w-full p-2 outline-1 outline-slate-600 border border-gray-500 rounded-md">
                            <option value="">Author</option>
                            <option value="Christian New">Christian New</option>
                            <option value="Cody Jackson">Cody Jackson</option>
                            <option value="Piqosity Official">Piqosity Official</option>
                            <option value="Conner Bowering">Conner Bowering</option>
                            <option value="Evan Pangra Sult">Evan Pangra Sult</option>
                            <option value="ela58 stutest ">ela58 stutest</option>
                            <option value="7">Andy Peters</option>
                            <option value="8">Andy T Teacher</option>

                          </select>
                        </div>
                        <div className="sub-topics">
                          <MultiSelect
                            // value={selectedQuestion[e.id] || []}
                            // onChange={(ev) => {
                            //   const selected = ev.value || [];
                            //   setSelectedQuestion((prev) => ({
                            //     ...prev,
                            //     [e.id]: selected,
                            //   }));
                            //   handleTopics(e.id, selected, formItem.multiTopics || e.courseVal);
                            // }}
                            options={fetchTopics}
                            optionLabel="title"
                            optionValue="id"
                            placeholder="Select Questions"
                            className="p-3 bg-white w-full border border-gray-400 rounded-lg"
                          />
                        </div>
                        <div className="multi--select">
                          <MultiSelect
                            // value={selectedQuestion[e.id] || []}
                            // onChange={(ev) => {
                            //   const selected = ev.value || [];
                            //   setSelectedQuestion((prev) => ({
                            //     ...prev,
                            //     [e.id]: selected,
                            //   }));
                            //   handleTopics(e.id, selected, formItem.multiTopics || e.courseVal);
                            // }}
                            options={courses_1}
                            optionLabel="title"
                            optionValue="id"
                            placeholder="Select Questions"
                            className="p-3 bg-white w-full border border-gray-400 rounded-lg"
                          />
                        </div>
                        <div className="buttons__ flex justify-between items-center mt-2">
                          <button onClick={checkAPI} className="border border-gray-300 rounded-md p-2 "> Reset </button>
                          <button onClick={() => console.log("apply")} className=" rounded-md p-2 text-white bg-[#26a69a] "> Apply</button>
                        </div>
                      </div>
                    )
                  }
                </div>
                <h3 className="font-bold text-gray-700 py-2">Questions</h3>
                {/* Tabs */}
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => handleTabChange("questions")}
                    className={`px-4 py-2 rounded ${activeTab === "questions" ? "bg-[#26a69a] text-white" : "bg-gray-200"}`}
                  >
                    Questions
                  </button>
                  <button
                    onClick={() => handleTabChange("passages")}
                    className={`px-4 py-2 rounded ${activeTab === "passages" ? "bg-[#26a69a] text-white" : "bg-gray-200"}`}
                  >
                    Passages
                  </button>
                </div>
                {/* This is the search box for the questions and passages  */}
                <div className="search_box flex items-center justify-between ">
                  <div className="show">
                    <label htmlFor="show">Show</label>
                    <select
                      name="show"
                      id="show"

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
                      className="bg-gray-200 outline-none p-1 text-[#26a69a] rounded-md" />

                  </div>
                </div>

                {activeTab === "questions" && (
                  <div>
                    {loading ? (
                      <div className="p-4 text-center">Loading questions...</div>
                    ) : (
                      <ul>
                        {(sectionData[activeSectionId]?.questions || []).length === 0 && (
                          <li className="p-2 text-gray-500">
                            No questions selected yet.
                            <br />
                          </li>
                        )}

                        {
                          Array.isArray(sectionData[activeSectionId]?.questions) &&
                          sectionData[activeSectionId].questions.map((q) => (
                            <li
                              key={q.id}
                              className="p-2 border border-gray-200 rounded-md mb-1 text-[#26a69a]"
                            >
                              <div className="flex justify-between items-center">
                                <span>{stripHtml(q.name)}</span>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleAddQuestion(q); }}
                                  className="ml-2 px-2 py-1 bg-[#26a69a] text-white rounded text-sm"
                                >
                                  Add
                                </button>
                              </div>
                            </li>
                          ))
                        }
                      </ul>
                    )}
                  </div>
                )}
                {/* Passages List  */}
                {activeTab === "passages" && (
                  <div>
                    {loading ? (
                      <div className="p-4 text-center">Loading passages...</div>
                    ) : (
                      <ul>
                        {(sectionData[activeSectionId].passages || []).length === 0 && (
                          <li className="p-2 text-gray-500">No passages available.</li>
                        )}
                        {Array.isArray(sectionData[activeSectionId]?.passages) && sectionData[activeSectionId].passages.map((p) => {
                          console.log("Rendering passage:", p);
                          console.log("Passage questions:", p.questions);
                          return (
                            <li
                              key={p.id}
                              className="p-2 border border-gray-200 rounded-md mb-1 text-[#26a69a]"
                              onClick={() => handlePassageToggle(p.id)}
                            >
                              <div className="flex justify-between items-center">
                                <span>{stripHtml(p.name)}</span>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleAddPassage(p); }}
                                  className="ml-2 px-2 py-1 bg-[#26a69a] text-white rounded text-sm"
                                >
                                  Add
                                </button>
                              </div>
                              {" "}
                              {passageOpen === p.id ? (
                                <span className="text-[#26a69a] flex items-start justify-end">⮝</span>
                              ) : (
                                <span className="text-[#26a69a] flex items-start justify-end">⮟</span>
                              )}
                              {passageOpen === p.id && (
                                <ul>
                                  {Array.isArray(p.questions) && p.questions.length > 0 ? (
                                    <>
                                      <h3 className="font-bold text-gray-900 mt-2">Questions</h3>
                                      {p.questions.map((pas) => (
                                        <li
                                          key={pas.id}
                                          className="text-[#26a69a] border border-gray-300 rounded-md my-2 p-2 "
                                        >
                                          {stripHtml(pas.name)}
                                        </li>
                                      ))}
                                    </>
                                  ) : (
                                    <div>
                                      <h3 className="font-bold text-gray-900 mt-2">Questions</h3>
                                      <h3 className="font-bold text-blue-800 bg-blue-300 rounded-lg border border-gray-400 mt-2 ">No Record Found</h3>
                                    </div>
                                  )}
                                </ul>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}

                  </div>
                )}
              </div>

            </div>
          )}
        </div>
        )
      </div>
    </div>
  )
}
export default TestBuilder
