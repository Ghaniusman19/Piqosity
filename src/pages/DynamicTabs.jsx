import { useEffect, useState } from "react";
import { MultiSelect } from "primereact/multiselect";

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
  // ---------- state ----------
  // Holds { [sectionId]: { questions: [], passages: [] } }
  const [sectionData, setSectionData] = useState({});
  // UI control for which section is currently shown in right panel
  const [activeSectionId, setActiveSectionId] = useState(null);
  // Right-panel tab: "questions" | "passages"
  const [activeTab, setActiveTab] = useState("questions");
  // MultiSelect selected values per section: { [sectionId]: [ids...] }
  const [selectedQuestion, setSelectedQuestion] = useState({});
  // Sections list and per-section small form states
  const [passageOpen, setpassageOpen] = useState(false)
  const handlePassageToggle = () => {
    setpassageOpen(!passageOpen)
  }
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

  // ---------- handlers ----------
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

    const newId = makeId(); // unique
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

    // initialize data containers for the new section
    setSectionData((prev) => ({
      ...prev,
      [newId]: { questions: [], passages: [] },
    }));
    setSelectedQuestion((prev) => ({ ...prev, [newId]: [] }));

    // make the newly added section active in right panel
    setActiveSectionId(newId);

    // reset the add form
    setformData({
      title: "",
      courseVal: "",
      publicVal: "",
      locked: "",
    });
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

    // 5. Reset active section if needed
    setActiveSectionId((prevActive) => {
      if (String(prevActive) === String(sectionIdToRemove)) {
        // choose first remaining section if any, else null
        return filteredSections.length > 0 ? filteredSections[0].id : null;
      }
      return prevActive;
    });
  };

  // ---------- API fetchers ----------
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

  // Fetch questions & passages for a specific section based on selected IDs
  // ...existing code...
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
      console.log(passagesData.data.data);
      console.log(passagesData.data.data)

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
          body: JSON.stringify({ ids: questionIds }),
        }
      );
      const questionsData = await responseQuestions.json();

      setSectionData((prev) => ({
        ...prev,
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
  useEffect(() => {
    getCoursesData();
  }, []);

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


            <ul className="flex">
              {addSection.map((sec) => (
                <li
                  key={sec.id}
                  className={`bg-white rounded-lg p-2 relative ml-2 cursor-pointer ${String(activeSectionId) === String(sec.id) ? "bg-blue-200" : ""}`}
                  onClick={() => {
                    setActiveSectionId(sec.id);
                    setActiveTab("questions"); // <-- ensure tab resets when switching section
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
              // onClick={AddSection} -- we already have form Add button below
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
                  handleChange(e);
                  handleCourseChange(e.target.value);
                }}
                className="p-2 outline-1 outline-slate-600 border border-gray-500 rounded-md w-full mb-1"
                required
              >
                <option value="">select courses</option>
                {courses.map((course, id) => (
                  <option key={id} className="text-black" value={course.course.id}>
                    {course.course.title} || {course.course.id}
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
                  <option value="">Select visibility</option>
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
                  <option value="">Select lock</option>
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

            <div className="dnd-text text-center">
              <p className="text-slate-800">
                <i> Drag and Drop to re-arrange section below</i>
              </p>
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
              <div className="grid grid-cols-2 gap-2">
                {addSection.map((e) => {
                  const formItem = formAdd.find((item) => item.id === e.id) || {};

                  return (
                    <div key={e.id} className="created_form p-2 bg-white rounded-lg">
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
                                // Pass topicId (formItem.multiTopics or e.courseVal)
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
              {/* Tabs */}
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setActiveTab("questions")}
                  className={`px-4 py-2 rounded ${activeTab === "questions" ? "bg-[#26a69a] text-white" : "bg-gray-200"}`}
                >
                  Questions
                </button>
                <button
                  onClick={() => setActiveTab("passages")}
                  className={`px-4 py-2 rounded ${activeTab === "passages" ? "bg-[#26a69a] text-white" : "bg-gray-200"}`}
                >
                  Passages
                </button>
              </div>

              {/* Data lists */}
              {activeTab === "questions" && (
                <ul>
                  {(sectionData[activeSectionId].questions || []).length === 0 && (
                    <li className="p-2 text-gray-500">No questions selected yet.</li>
                  )}
                  {(sectionData[activeSectionId].questions || []).map((q) => (
                    <li key={q.id} className="p-2 border border-gray-200 rounded-md mb-1">
                      {stripHtml(q.name)}

                    </li>
                  ))}
                </ul>
              )}
              {/* Passages List  */}
              {activeTab === "passages" && (
                <ul>
                  {(sectionData[activeSectionId].passages || []).length === 0 && (
                    <li className="p-2 text-gray-500">No passages available.</li>
                  )}
                  {(sectionData[activeSectionId].passages || []).map((p) => (
                    <li key={p.id} className="p-2 border border-gray-200 rounded-md mb-1  text-[#26a69a] cursor-pointer" onClick={() => handlePassageToggle(p.id)} >
                      {stripHtml(p.name)} {passageOpen ? <span className="text-[#26a69a] text-end " >⮟</span> : <span className="text-[#26a69a] text-end"> ⮟</span>}
                      {passageOpen && (
                        <ul type="disk" >
                          <h3 className="font-bold text-gray-900 mt-2" >Questions</h3>
                          {p.questions.map((pas) => (
                            <li key={pas.id} className="text-[#26a69a] border border-gray-300 rounded-md my-2 p-2 " >
                              {stripHtml(pas.name)}
                            </li>
                          ))}
                        </ul>
                      )}

                    </li>
                  ))}
                  {/* {(Array.isArray(sectionData[activeSectionId]?.passages)
                    ? sectionData[activeSectionId].passages
                    : []
                  ).map((p, idx) => (
                    <li key={p.id ?? idx} className="p-2 border border-gray-200 rounded-md mb-1">
                      {stripHtml(p.name)}
                    </li>
                  ))} */}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestBuilder;
