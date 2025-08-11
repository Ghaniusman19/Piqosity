
import { useState, useEffect } from 'react';
import { MultiSelect } from 'primereact/multiselect';

const NewPage = () => {
    const [selectedQuestion, setSelectedQuestion] = useState(null)
    const [activeSection, setActiveSection] = useState(null); // For tab functionality
    const [sections, setSections] = useState([]); // Combined state for sections
    const [courses, setCourses] = useState([]);
    const [courses_1, setCourses_1] = useState([]); // For main form only
    // Section-specific API states - each section has its own data
    const [sectionCourses, setSectionCourses] = useState({}); // Store courses_1 for each section
    const [sectionTopics, setSectionTopics] = useState({}); // Store topics for each section
    const [sectionSelectedQuestions, setSectionSelectedQuestions] = useState({}); // Store selected questions for each section
    // Form state for adding new sections
    const [formData, setFormData] = useState({
        title: "",
        courseVal: "",
        publicVal: "public",
        locked: "locked",
    });
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(previous => ({ ...previous, [name]: value }));
    };
    // Function for adding a new section
    const AddSection = (e) => {
        if (e) e.preventDefault();
        console.log("Adding section", formData);
        if (!formData.title.trim()) {
            alert("Please enter a section title");
            return;
        }
        const newSection = {
            id: Date.now(), // Using timestamp for unique ID
            ...formData,
            // Each section has its own completely isolated form data
            sectionFormData: {
                id: crypto.randomUUID(),
                title: '',
                multiTopics: '',
                selectedQuestions: null
            }
        };
        setSections(prev => [...prev, newSection]);
        // Initialize empty states for this section
        setSectionSelectedQuestions(prev => ({
            ...prev,
            [newSection.id]: null
        }));
        // Set the newly created section as active
        setActiveSection(newSection.id);
        // Reset form
        setFormData({
            title: "",
            courseVal: "",
            publicVal: "public",
            locked: "locked",
        });
    };
    const removeSection = (sectionId) => {
        console.log('Removing section with ID:', sectionId);
        setSections(prev => prev.filter(section => section.id !== sectionId));
        // Clean up section-specific data
        setSectionCourses(prev => {
            const newState = { ...prev };
            delete newState[sectionId];
            return newState;
        });
        setSectionTopics(prev => {
            const newState = { ...prev };
            delete newState[sectionId];
            return newState;
        });
        setSectionSelectedQuestions(prev => {
            const newState = { ...prev };
            delete newState[sectionId];
            return newState;
        });
        // If the active section is being removed, set active to null
        if (activeSection === sectionId) {
            setActiveSection(null);
        }
    };
    // Handle form changes for individual section forms
    const handleSectionFormChange = (sectionId, fieldName, value) => {
        setSections(prev =>
            prev.map(section =>
                section.id === sectionId
                    ? {
                        ...section,
                        sectionFormData: {
                            ...section.sectionFormData,
                            [fieldName]: value
                        }
                    }
                    : section
            )
        );
    };
    // Your original API functions
    const getCoursesData = async () => {
        console.log("check getcoursedata");
        try {
            const response = await fetch("https://api.natsent.com/api/v1/commons/generics/get_course", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    authorization: "eyJhbGciOiJIUzI1NiJ9.eyJ0cnVlX3VzZXJfaWQiOm51bGwsInVzZXJfaWQiOiJiN2UyOGZjOS04YmExLTRjZWUtYWZlYS0yOTFjYTE1MmYyNmQiLCJleHAiOjE3ODU5MTk0MDd9.UI12IbbjeYpt3x6gJ2Z-nX3QRL9SoQLLvx4soiI4Hb8"
                }
            });
            const data = await response.json();
            setCourses(data.data);
            console.log("Courses loaded:", data.data);
        } catch (error) {
            console.log("getCoursesData error:", error);
        }
    };
    const handleCourseChange = async (id) => {
        console.log("Main form course change, ID:", id);
        try {
            const response = await fetch(
                `https://api.natsent.com/api/v1/commons/test_builders/get_course_topics?id=${id}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        authorization: "eyJhbGciOiJIUzI1NiJ9.eyJ0cnVlX3VzZXJfaWQiOm51bGwsInVzZXJfaWQiOiJiN2UyOGZjOS04YmExLTRjZWUtYWZlYS0yOTFjYTE1MmYyNmQiLCJleHAiOjE3ODU5MTk0MDd9.UI12IbbjeYpt3x6gJ2Z-nX3QRL9SoQLLvx4soiI4Hb8"
                    }
                }
            );
            const data = await response.json();
            console.log("Main form topics fetched:", data.data);
            setCourses_1(data.data);
        } catch (error) {
            console.log("handleCourseChange error:", error);
        }
    };
    // Section-specific course change handler
    const handleSectionCourseChange = async (sectionId, courseId) => {
        console.log("Section course change - Section:", sectionId, "Course:", courseId);
        try {
            const response = await fetch(
                `https://api.natsent.com/api/v1/commons/test_builders/get_course_topics?id=${courseId}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        authorization: "eyJhbGciOiJIUzI1NiJ9.eyJ0cnVlX3VzZXJfaWQiOm51bGwsInVzZXJfaWQiOiJiN2UyOGZjOS04YmExLTRjZWUtYWZlYS0yOTFjYTE1MmYyNmQiLCJleHAiOjE3ODU5MTk0MDd9.UI12IbbjeYpt3x6gJ2Z-nX3QRL9SoQLLvx4soiI4Hb8"
                    }
                }
            );
            const data = await response.json();
            console.log(`Section ${sectionId} topics fetched:`, data.data);
            // Store courses_1 data for this specific section
            setSectionCourses(prev => ({
                ...prev,
                [sectionId]: data.data
            }));
        } catch (error) {
            console.log("handleSectionCourseChange error:", error);
        }
    };
    const handleTopics = async (selectedIds, sectionId) => {
        console.log("handleTopics - IDs:", selectedIds, "Section:", sectionId);
        if (!selectedIds || (Array.isArray(selectedIds) && selectedIds.length === 0)) {
            console.log("No IDs selected, skipping API call");
            return;
        }
        // Ensure selectedIds is an array
        const idsArray = Array.isArray(selectedIds) ? selectedIds : [selectedIds];
        try {
            // Fetch passages
            const response1 = await fetch("https://api.natsent.com/api/v1/commons/test_builders/get_all_passages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    authorization: "eyJhbGciOiJIUzI1NiJ9.eyJ0cnVlX3VzZXJfaWQiOm51bGwsInVzZXJfaWQiOiJiN2UyOGZjOS04YmExLTRjZWUtYWZlYS0yOTFjYTE1MmYyNmQiLCJleHAiOjE3ODU5MTk0MDd9.UI12IbbjeYpt3x6gJ2Z-nX3QRL9SoQLLvx4soiI4Hb8"
                },
                body: JSON.stringify({ ids: idsArray })
            });
            const passagesData = await response1.json();
            console.log(`Section ${sectionId} - passages response:`, passagesData.data);
            // Fetch questions
            const response2 = await fetch("https://api.natsent.com/api/v1/commons/test_builders/get_all_questions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    authorization: "eyJhbGciOiJIUzI1NiJ9.eyJ0cnVlX3VzZXJfaWQiOm51bGwsInVzZXJfaWQiOiJiN2UyOGZjOS04YmExLTRjZWUtYWZlYS0yOTFjYTE1MmYyNmQiLCJleHAiOjE3ODU5MTk0MDd9.UI12IbbjeYpt3x6gJ2Z-nX3QRL9SoQLLvx4soiI4Hb8"
                },
                body: JSON.stringify({ ids: idsArray })
            });
            const questionsData = await response2.json();
            console.log(`Section ${sectionId} - Questions data:`, questionsData.data);
            const topicsData = {
                passages: passagesData.data || [],
                questions: questionsData.data || { total_count: 0 }
            };
            // Store topics for this specific section only
            setSectionTopics(prev => ({
                ...prev,
                [sectionId]: topicsData
            }));
        } catch (error) {
            console.log(`Topics error for section ${sectionId}:`, error);
        }
    };
    // Handle MultiSelect change for a specific section
    const handleSectionMultiSelectChange = (sectionId, selectedValues) => {
        console.log(`Section ${sectionId} MultiSelect change:`, selectedValues);
        // Store selected questions for this section
        setSectionSelectedQuestions(prev => ({
            ...prev,
            [sectionId]: selectedValues
        }));
        // Trigger API call if values are selected
        if (selectedValues && selectedValues.length > 0) {
            handleTopics(selectedValues, sectionId);
        } else {
            // Clear topics if nothing is selected
            setSectionTopics(prev => ({
                ...prev,
                [sectionId]: { passages: [], questions: { total_count: 0 } }
            }));
        }
    };
    useEffect(() => {
        getCoursesData();
    }, []);
    const getActiveSection = () => {
        return sections.find(section => section.id === activeSection);
    };
    return (
        <div className='main-container p-3 bg-gray-100 min-h-screen'>
            <div className="tb-header p-3 mb-3 rounded-xl bg-white w-full flex items-center justify-between">
                <h3 className='text-2xl font-semibold text-blue-950'>Test Builder</h3>
                <button className='bg-blue-950 text-white px-8 py-2 rounded-lg hover:bg-blue-800 transition-colors'>
                    Save
                </button>
            </div>
            <div className="tb-body-main flex gap-4">
                <div className="tb-body tb-left flex-1">
                    {/* Section Tabs */}
                    <div className="b-header flex items-center justify-between mb-4">
                        <div className='flex items-center bg-white p-2 rounded-xl'>
                            <span
                                className={`px-3 py-1 rounded cursor-pointer ${activeSection === null ? 'bg-blue-100 text-blue-800' : 'text-gray-600'}`}
                                onClick={() => setActiveSection(null)}
                            >
                                All Sections
                            </span>
                        </div>
                        <div className='flex gap-2'>
                            {sections.map((section) => (
                                <div key={section.id} className='bg-white rounded-lg p-2 relative'>
                                    <span
                                        className={`text-gray-600 block w-10 text-center cursor-pointer ${activeSection === section.id ? 'text-blue-600 font-bold' : ''}`}
                                        onClick={() => setActiveSection(section.id)}
                                    >
                                        {section.id}
                                        {/* {getActiveSection().title} */}
                                    </span>
                                    <span
                                        className="px-1 rounded-full bg-red-600 text-white text-xs absolute -top-2 -right-1 cursor-pointer hover:bg-red-700"
                                        onClick={() => removeSection(section.id)}
                                    >
                                        ×
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Main Form - Only show when no section is active */}
                    {activeSection === null && (
                        <div className="p-3 bg-white rounded-2xl mb-4">
                            <h4 className="text-lg font-semibold mb-3 text-gray-800">Add New Section</h4>
                            <div>
                                <input
                                    type="text"
                                    placeholder='Section Title'
                                    className='p-3 border border-gray-300 rounded-md w-full mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                    value={formData.title}
                                    onChange={handleChange}
                                    name='title'
                                    required
                                />
                                <select
                                    name="courseVal"
                                    value={formData.courseVal}
                                    onChange={(e) => {
                                        handleChange(e);
                                        if (e.target.value) {
                                            handleCourseChange(e.target.value);
                                        }
                                    }}
                                    className='p-3 border border-gray-300 rounded-md w-full mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                    required
                                >
                                    <option value="">Select Course</option>
                                    {courses.map((course, id) => (
                                        <option key={id} value={course.course.id}>
                                            {course.course.title}
                                        </option>
                                    ))}
                                </select>
                                <div className='flex gap-2 mb-3'>
                                    <select
                                        name="publicVal"
                                        value={formData.publicVal}
                                        onChange={handleChange}
                                        className='p-3 border border-gray-300 rounded-md w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                    >
                                        <option value="public">Public</option>
                                        <option value="private">Private</option>
                                    </select>
                                    <select
                                        name="locked"
                                        value={formData.locked}
                                        onChange={handleChange}
                                        className='p-3 border border-gray-300 rounded-md w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                    >
                                        <option value="locked">Locked</option>
                                        <option value="unlocked">Unlocked</option>
                                    </select>
                                </div>
                                <button
                                    type='button'
                                    onClick={AddSection}
                                    className="w-full py-3 px-4 rounded-xl bg-blue-950 text-white hover:bg-blue-800 transition-colors font-medium"
                                >
                                    Add Section
                                </button>
                            </div>
                        </div>
                    )}
                    {/* Active Section Form */}
                    {activeSection !== null && getActiveSection() && (
                        <div className="p-3 bg-white rounded-2xl mb-4">
                            <h4 className="text-lg font-semibold mb-3 text-gray-800">
                                Section: {getActiveSection().title}
                            </h4>
                            <div>
                                <input
                                    type="text"
                                    placeholder='Form Title'
                                    className='p-3 border border-gray-300 rounded-md w-full mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                    value={getActiveSection().sectionFormData.title}
                                    onChange={(e) => handleSectionFormChange(activeSection, 'title', e.target.value)}
                                />
                                {/* Question Sources Dropdown */}
                                <MultiSelect
                                    value={selectedQuestion}
                                    onChange={(e) => {
                                        handleTopics(e.target.value)
                                        setSelectedQuestion(e.value)
                                    }}
                                    options={courses_1}
                                    optionLabel="title"
                                    optionValue='id'
                                    placeholder="Select Questions"
                                    // maxSelectedLabels={3}
                                    className=" p-3 bg-white w-full border border-gray-400 rounded-lg" />
                                {/* MultiSelect - Shows only when course is selected for this section */}
                                {getActiveSection().sectionFormData.multiTopics && sectionCourses[activeSection] && (
                                    <div className="w-full mb-3">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Select Questions/Topics:
                                        </label>
                                        <MultiSelect
                                            value={selectedQuestion}
                                            onChange={(e) => {
                                                handleTopics(e.target.value)
                                                setSelectedQuestion(e.value)
                                            }}
                                            options={courses_1}
                                            optionLabel="title"
                                            optionValue='id'
                                            placeholder="Select Questions"
                                            // maxSelectedLabels={3}
                                            className=" p-3 bg-white w-full border border-gray-400 rounded-lg" />
                                    </div>
                                )}
                                {/* Show real-time API data for this specific section */}
                                {sectionTopics[activeSection] && (
                                    <div className="mt-3 p-3 bg-green-50 rounded border-l-4 border-green-400 mb-3">
                                        <p className="font-medium text-green-800">API Data Loaded:</p>
                                        <p className="text-sm text-green-700">
                                            Passages: {sectionTopics[activeSection].passages?.length || 0}
                                        </p>
                                        <p className="text-sm text-green-700">
                                            Questions: {sectionTopics[activeSection].questions?.total_count || 0}
                                        </p>
                                    </div>
                                )}
                                <button
                                    type='button'
                                    className='w-full text-white bg-teal-500 p-3 rounded-xl hover:bg-teal-600 transition-colors font-medium'
                                >
                                    Advanced Section Formatting
                                </button>
                            </div>
                        </div>
                    )}
                    {/* Section List */}
                    {sections.length > 0 && (
                        <div className="bg-white rounded-2xl p-3">
                            <h4 className="text-lg font-semibold mb-3 text-gray-800">Created Sections</h4>
                            <div className="space-y-2">
                                {sections.map((section) => (
                                    <div
                                        key={section.id}
                                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${activeSection === section.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        onClick={() => setActiveSection(section.id)}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <span className="font-medium text-teal-600">#{section.id}</span>
                                                <span className="ml-2 text-gray-800">{section.title}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm text-gray-500 block">
                                                    {section.courseVal ? `Course: ${section.courseVal}` : 'No course'}
                                                </span>
                                                {sectionTopics[section.id] && (
                                                    <span className="text-xs text-green-600">
                                                        {sectionTopics[section.id].passages?.length || 0}P, {sectionTopics[section.id].questions?.total_count || 0}Q
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="bg-white rounded-lg p-4 mt-4 text-center border border-gray-200">
                        <p className='font-bold text-gray-600'>
                            {sections.length} Sections, {Object.values(sectionTopics).reduce((acc, topic) => acc + (topic.passages?.length || 0), 0)} Passages, {Object.values(sectionTopics).reduce((acc, topic) => acc + (topic.questions?.total_count || 0), 0)} Questions, 0 Difficulty, 0 EVAD
                        </p>
                    </div>
                </div>
                <div className='tb-right w-64 bg-white rounded-2xl p-4'>
                    {/* Section Details with API Data */}
                    <h4 className="font-semibold text-gray-800 mb-2">Section Details</h4>
                    {activeSection ? (
                        <div className="text-sm text-gray-600 space-y-2">
                            <p><strong>Section:</strong> {getActiveSection()?.title}</p>
                            <p><strong>Course:</strong> {getActiveSection()?.courseVal}</p>
                            <p><strong>Status:</strong> {getActiveSection()?.publicVal}</p>
                            <p><strong>Lock:</strong> {getActiveSection()?.locked}</p>
                            {/* Show real-time API data for this specific section */}
                            {sectionTopics[activeSection] && (
                                <div className="mt-3 p-3 bg-green-50 rounded border-l-4 border-green-400">
                                    <p className="font-medium text-green-800">API Data:</p>
                                    <p className="text-sm text-green-700">
                                        Passages: {sectionTopics[activeSection].passages?.length || 0}
                                    </p>
                                    <p className="text-sm text-green-700">
                                        Questions: {sectionTopics[activeSection].questions?.total_count || 0}
                                    </p>
                                </div>
                            )}
                            {/* Show available course topics for this section */}
                            {sectionCourses[activeSection] && (
                                <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                                    <p className="font-medium text-blue-800">Available Topics:</p>
                                    <p className="text-sm text-blue-700">
                                        {sectionCourses[activeSection].length} topics loaded
                                    </p>
                                </div>
                            )}
                            {/* Show selected questions */}
                            {sectionSelectedQuestions[activeSection] && (
                                <div className="mt-3 p-3 bg-purple-50 rounded border-l-4 border-purple-400">
                                    <p className="font-medium text-purple-800">Selected:</p>
                                    <p className="text-sm text-purple-700">
                                        {sectionSelectedQuestions[activeSection]?.length || 0} questions selected
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">Select a section to view details</p>
                    )}
                </div>
            </div>
        </div>
    );
};
export default NewPage;
