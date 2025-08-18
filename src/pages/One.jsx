import { useEffect, useState } from "react";
import { MultiSelect } from "primereact/multiselect";
const One = () => {
  const stripHtml = (htmlString) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    return doc.body.textContent || "";
  };

  // Helper to pick a human-friendly label for items
  // const getDisplayLabel = (item, prefix = '') => {
  //   if (!item) return prefix ? `${prefix} ?` : 'Unknown';
  //   const name = item.name || item.title || item.question || item.question_text || item.text || item.body;
  //   const id = item.id || item._id || item.question_id || item.passage_id;
  //   if (name && typeof name === 'string' && name.trim() !== '') return stripHtml(name);
  //   if (id) return `${prefix ? prefix + ' ' : ''}${id}`;
  //   return prefix ? `${prefix} ?` : 'Unknown';
  // };

  const [sectionData, setSectionData] = useState({});
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [activeTab, setActiveTab] = useState("questions");
  const [selectedQuestion, setSelectedQuestion] = useState({});
  const [passageOpen, setpassageOpen] = useState(null)
  const [search, setSearch] = useState('')
  const [addSection, setAddsection] = useState([]);
  const [formAdd, setFormAdd] = useState([]);
  const [courses, setCourses] = useState([]);
  const [courses_1, setCourses_1] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterData, setFilterData] = useState({});  // Per section filter data
  const [filterSubTopics, setFilterSubTopics] = useState({}); // Per section sub-topics
  const [advanceModal, setAdvanceModal] = useState(false);
  const [filterActive, setFilterActive] = useState(false);
  const [fetchTopics, setfetchTopics] = useState([]);
  const [searchLoading, setSearchLoading] = useState({});  // Per section search loading
  const [originalSectionData, setOriginalSectionData] = useState({});
  const [advancedFormattingData, setAdvancedFormattingData] = useState({}); // Store original data
  const [hoveredId, setHoveredId] = useState(null);
  const [droppedItems, setDroppedItems] = useState({});

  const [formData, setformData] = useState({
    id: -1,
    title: "",
    courseVal: "",
    publicVal: "",
    locked: "",
  });
  const hasSelectedQuestions = selectedQuestion[activeSectionId] && selectedQuestion[activeSectionId].length > 0;

  const makeId = () =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.floor(Math.random() * 10000)}`;



  const handlePassageToggle = (id) => {
    console.log("Passage toggle clicked for ID:", id);
    console.log("Current passageOpen state:", passageOpen);
    setpassageOpen(prev => {
      const newState = prev === id ? null : id;
      console.log("New passageOpen state:", newState);
      return newState;
    });
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

  const fetchSubTopicsForFilter = async (sectionId, topicIds) => {
    if (!topicIds || topicIds.length === 0) {
      setFilterSubTopics(prev => ({
        ...prev,
        [sectionId]: []
      }));
      return;
    }

    console.log(`Fetching sub-topics for section ${sectionId} with topic IDs:`, topicIds);

    try {
      // Use the SAME IDs that were sent to backend in handleTopics
      const idsParam = encodeURIComponent(JSON.stringify(topicIds));
      const response = await fetch(
        `https://api.natsent.com/api/v1/commons/test_builders/get_sub_topics_of_topics?ids=${idsParam}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            authorization: "eyJhbGciOiJIUzI1NiJ9.eyJ0cnVlX3VzZXJfaWQiOm51bGwsInVzZXJfaWQiOiJiN2UyOGZjOS04YmExLTRjZWUtYWZlYS0yOTFjYTE1MmYyNmQiLCJleHAiOjE3ODU5MTk0MDd9.UI12IbbjeYpt3x6gJ2Z-nX3QRL9SoQLLvx4soiI4Hb8"
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Sub-topics API failed: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Sub-topics API response for section ${sectionId}:`, data);

      setFilterSubTopics(prev => ({
        ...prev,
        [sectionId]: data.data || []
      }));

    } catch (error) {
      console.error(`fetchSubTopicsForFilter error for section ${sectionId}:`, error);
      setFilterSubTopics(prev => ({
        ...prev,
        [sectionId]: []
      }));
    }
  };

  // Initialize filter data for a section with pre-filled topics
  const initializeFilterForSection = (sectionId) => {
    // Get the currently selected topics from main multiselect
    const selectedTopicIds = selectedQuestion[sectionId] || [];

    if (!filterData[sectionId]) {
      setFilterData(prev => ({
        ...prev,
        [sectionId]: {
          difficulty: '',
          author: '',
          subTopics: [],
          topics: selectedTopicIds // PRE-FILL with main multiselect selections
        }
      }));
    } else {
      // If filter data exists but topics array might be outdated, sync it
      setFilterData(prev => ({
        ...prev,
        [sectionId]: {
          ...prev[sectionId],
          topics: selectedTopicIds // Always sync with main multiselect
        }
      }));
    }
  };

  // Filter reset function for specific section - keeps topics pre-filled
  const resetFiltersForSection = (sectionId) => {
    // Get the currently selected topics from main multiselect
    const selectedTopicIds = selectedQuestion[sectionId] || [];

    setFilterData(prev => ({
      ...prev,
      [sectionId]: {
        difficulty: '',
        author: '',
        subTopics: [],
        topics: selectedTopicIds // RESET to main multiselect selections (pre-filled)
      }
    }));

    // Don't reset sub-topics, let them stay as they were fetched
    // setFilterSubTopics(prev => ({
    //   ...prev,
    //   [sectionId]: []
    // }));
  };

  // Filter apply function for specific section
  const applyFiltersForSection = (sectionId) => {
    console.log(`Applying filters for section ${sectionId}:`, filterData[sectionId]);

    if (!sectionData[sectionId]) {
      console.log(`No data available for section ${sectionId}`);
      return;
    }

    // Here you would implement your filtering logic
    // For now, just close the filter modal
    setFilterActive(false);

    console.log(`Filters applied for section ${sectionId}`);
  };

  // Updated filter button click handler
  const handleFilterClick = () => {
    const currentSectionId = activeSectionId;

    if (!currentSectionId) {
      console.log("No active section");
      return;
    }

    // Initialize filter data for this section if not exists
    initializeFilterForSection(currentSectionId);

    // Get the topic IDs that were used in the backend call for this section
    const selectedTopicIds = selectedQuestion[currentSectionId] || [];

    // Toggle filter modal
    setFilterActive(prev => !prev);

    // Fetch sub-topics based on the IDs that were sent to backend
    if (selectedTopicIds.length > 0) {
      fetchSubTopicsForFilter(currentSectionId, selectedTopicIds);
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
      storeOriginalData(sectionId, finalQuestions, finalPassages);

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

  const handleSearch = (e) => {
    const searchText = e.target.value;
    console.log("Search text:", searchText);
    console.log("Current active tab:", activeTab);
    console.log("Current section ID:", activeSectionId);

    // Use debounced search to avoid too many API calls
    handleSearchWithDebounce(searchText);
  };

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
  };

  // Store original data when first loaded (modify your existing handleTopics function)
  const storeOriginalData = (sectionId, questions, passages) => {
    setOriginalSectionData(prev => ({
      ...prev,
      [sectionId]: {
        questions: questions || [],
        passages: passages || []
      }
    }));
  };

  // Search questions API call
  const searchQuestions = async (sectionId, searchText, originalQuestionIds) => {
    if (!searchText.trim()) {
      // If search is empty, restore original data
      const original = originalSectionData[sectionId];
      if (original) {
        setSectionData(prev => ({
          ...prev,
          [sectionId]: {
            ...prev[sectionId],
            questions: original.questions
          }
        }));
      }
      return;
    }

    setSearchLoading(prev => ({ ...prev, [sectionId]: true }));

    try {
      const response = await fetch(
        "https://api.natsent.com/api/v1/commons/test_builders/search_questions", // Adjust endpoint as needed
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: "eyJhbGciOiJIUzI1NiJ9.eyJ0cnVlX3VzZXJfaWQiOm51bGwsInVzZXJfaWQiOiJiN2UyOGZjOS04YmExLTRjZWUtYWZlYS0yOTFjYTE1MmYyNmQiLCJleHAiOjE3ODU5MTk0MDd9.UI12IbbjeYpt3x6gJ2Z-nX3QRL9SoQLLvx4soiI4Hb8",
          },
          body: JSON.stringify({
            search_text: searchText,
            topic_ids: originalQuestionIds, // Search within the original selected topics
            // You might need to adjust these parameters based on your API
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Search questions API failed: ${response.status}`);
      }

      const searchData = await response.json();
      console.log(`Search questions API response for section ${sectionId}:`, searchData);

      // Update section data with search results
      setSectionData(prev => ({
        ...prev,
        [sectionId]: {
          ...prev[sectionId],
          questions: searchData?.data?.data || searchData?.data || searchData || []
        }
      }));

    } catch (error) {
      console.error(`Search questions error for section ${sectionId}:`, error);
      // On error, show original data
      const original = originalSectionData[sectionId];
      if (original) {
        setSectionData(prev => ({
          ...prev,
          [sectionId]: {
            ...prev[sectionId],
            questions: original.questions
          }
        }));
      }
    } finally {
      setSearchLoading(prev => ({ ...prev, [sectionId]: false }));
    }
  };
  // Search passages API call
  const searchPassages = async (sectionId, searchText, originalTopicIds) => {
    if (!searchText.trim()) {
      // If search is empty, restore original data
      const original = originalSectionData[sectionId];
      if (original) {
        setSectionData(prev => ({
          ...prev,
          [sectionId]: {
            ...prev[sectionId],
            passages: original.passages
          }
        }));
      }
      return;
    }

    setSearchLoading(prev => ({ ...prev, [sectionId]: true }));

    try {
      const response = await fetch(
        "https://api.natsent.com/api/v1/commons/test_builders/get_all_passages", // Adjust endpoint as needed
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: "eyJhbGciOiJIUzI1NiJ9.eyJ0cnVlX3VzZXJfaWQiOm51bGwsInVzZXJfaWQiOiJiN2UyOGZjOS04YmExLTRjZWUtYWZlYS0yOTFjYTE1MmYyNmQiLCJleHAiOjE3ODU5MTk0MDd9.UI12IbbjeYpt3x6gJ2Z-nX3QRL9SoQLLvx4soiI4Hb8",
          },
          body: JSON.stringify({
            search_text: searchText,
            topic_ids: originalTopicIds, // Search within the original selected topics
            // You might need to adjust these parameters based on your API
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Search passages API failed: ${response.status}`);
      }

      const searchData = await response.json();
      console.log(`Search passages API response for section ${sectionId}:`, searchData);

      // Update section data with search results
      setSectionData(prev => ({
        ...prev,
        [sectionId]: {
          ...prev[sectionId],
          passages: searchData?.data?.data || searchData?.data || searchData || []
        }
      }));

    } catch (error) {
      console.error(`Search passages error for section ${sectionId}:`, error);
      // On error, show original data
      const original = originalSectionData[sectionId];
      if (original) {
        setSectionData(prev => ({
          ...prev,
          [sectionId]: {
            ...prev[sectionId],
            passages: original.passages
          }
        }));
      }
    } finally {
      setSearchLoading(prev => ({ ...prev, [sectionId]: false }));
    }
  };

  // Debounced search handler to avoid too many API calls
  let searchTimeout;
  const handleSearchWithDebounce = (searchText) => {
    const currentSectionId = activeSectionId;
    if (!currentSectionId) return;

    // Update search state immediately for UI feedback
    setSearch(searchText);

    // Clear previous timeout
    clearTimeout(searchTimeout);

    // Set new timeout for API call
    searchTimeout = setTimeout(() => {
      const originalTopicIds = selectedQuestion[currentSectionId] || [];

      if (activeTab === "questions") {
        searchQuestions(currentSectionId, searchText, originalTopicIds);
      } else if (activeTab === "passages") {
        searchPassages(currentSectionId, searchText, originalTopicIds);
      }
    }, 500); // 500ms delay to avoid too many API calls
  };

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
  const handleRemoveDroppedQuestion = (questionId) => {
    if (!activeSectionId) return;
    setDroppedItems(prev => {
      const copy = { ...prev };
      if (!copy[activeSectionId]) return prev;
      copy[activeSectionId].questions = copy[activeSectionId].questions.filter(q => q.id !== questionId);
      copy[activeSectionId].questionIds = copy[activeSectionId].questionIds.filter(id => id !== questionId);
      console.log('Dropped questionIds after remove for', activeSectionId, copy[activeSectionId].questionIds);
      return copy;
    });
    // restore to sectionData
    // Try to pull the full object from droppedItems (if available) and restore it; otherwise create a normalized placeholder
    let restored = null;
    if (droppedItems[activeSectionId] && Array.isArray(droppedItems[activeSectionId].questions)) {
      restored = droppedItems[activeSectionId].questions.find(q => q.id === questionId) || null;
    }
    const placeholder = { id: questionId, name: `Question ${questionId}` };
    const toRestore = restored ? { ...restored, name: restored.name || restored.title || placeholder.name } : placeholder;
    setSectionData(prev => {
      const copy = { ...prev };
      if (!copy[activeSectionId]) copy[activeSectionId] = { questions: [], passages: [] };
      copy[activeSectionId].questions = [...(copy[activeSectionId].questions || []), toRestore];
      return copy;
    });
  };

  const handleRemoveDroppedPassage = (passageId) => {
    if (!activeSectionId) return;
    setDroppedItems(prev => {
      const copy = { ...prev };
      if (!copy[activeSectionId]) return prev;
      copy[activeSectionId].passages = copy[activeSectionId].passages.filter(p => p.id !== passageId);
      copy[activeSectionId].passageIds = copy[activeSectionId].passageIds.filter(id => id !== passageId);
      console.log('Dropped passageIds after remove for', activeSectionId, copy[activeSectionId].passageIds);
      return copy;
    });
    let restored = null;
    if (droppedItems[activeSectionId] && Array.isArray(droppedItems[activeSectionId].passages)) {
      restored = droppedItems[activeSectionId].passages.find(p => p.id === passageId) || null;
    }
    const placeholder = { id: passageId, name: `Passage ${passageId}` };
    const toRestore = restored ? { ...restored, name: restored.name || restored.title || placeholder.name } : placeholder;
    setSectionData(prev => {
      const copy = { ...prev };
      if (!copy[activeSectionId]) copy[activeSectionId] = { questions: [], passages: [] };
      copy[activeSectionId].passages = [...(copy[activeSectionId].passages || []), toRestore];
      return copy;
    });
  };
  const handleAdvancedFormattingChange = (sectionId, fieldName, value) => {
    setAdvancedFormattingData(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        [fieldName]: value
      }
    }));

    // Log to console for debugging
    console.log('Advanced Formatting Data Updated:', {
      sectionId,
      fieldName,
      value,
      allData: {
        ...advancedFormattingData,
        [sectionId]: {
          ...advancedFormattingData[sectionId],
          [fieldName]: value
        }
      }
    });
  };
  // Add this function to get current section's advanced formatting data
  const getCurrentAdvancedData = (sectionId) => {
    return advancedFormattingData[sectionId] || {
      directions: '',
      singleQuestionLayout: 'Single Column',
      passageQuestionLayout: 'Single Column',
      calculator: 'No Calculator',
      referenceSheet: 'No Reference Sheet',
      allottedTime: 'Default'
    };
  };
  useEffect(() => {
    getCoursesData();
    checkAPI();
    setpassageOpen(null);
    if (activeSectionId && sectionData[activeSectionId]) {
      console.log("Current section questions:", sectionData[activeSectionId].questions);
      console.log("Current section passages:", sectionData[activeSectionId].passages);
    }
  }, [sectionData, activeSectionId]);
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
                  className={`bg-white rounded-lg p-2 relative ml-2 cursor-pointer ${String(activeSectionId) === String(sec.id) ? "bg-[#7ddbd0]  " : " "}`}
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

                          {/* Advanced Section Formatting Modal */}
                          {advanceModal && activeSectionId && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                              <div className="bg-white rounded-lg w-[500px] max-h-[90vh] overflow-y-auto">
                                {/* Modal Header */}
                                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                                  <h2 className="text-lg font-semibold text-gray-800">Advanced Section Formatting</h2>
                                  <button
                                    onClick={() => setAdvanceModal(false)}
                                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                                  >
                                    &times;
                                  </button>
                                </div>

                                {/* Modal Body */}
                                <div className="p-4">
                                  <form onSubmit={(e) => e.preventDefault()}>
                                    {/* Directions Section */}
                                    <div className="mb-6">
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Directions
                                      </label>

                                      {/* Toolbar */}
                                      <div className="flex items-center gap-1 p-2 border border-gray-300 rounded-t-md bg-gray-50">
                                        <button type="button" className="p-1 hover:bg-gray-200 rounded" title="Bold">
                                          <strong>B</strong>
                                        </button>
                                        <button type="button" className="p-1 hover:bg-gray-200 rounded" title="Italic">
                                          <em>I</em>
                                        </button>
                                        <button type="button" className="p-1 hover:bg-gray-200 rounded" title="Underline">
                                          <u>U</u>
                                        </button>
                                        <button type="button" className="p-1 hover:bg-gray-200 rounded" title="Strikethrough">
                                          <s>S</s>
                                        </button>
                                        <span className="border-l border-gray-400 h-6 mx-1"></span>
                                        <button type="button" className="p-1 hover:bg-gray-200 rounded" title="Font Size">
                                          &darr;
                                        </button>
                                        <button type="button" className="p-1 hover:bg-gray-200 rounded" title="Align Left">
                                          &#8676;
                                        </button>
                                        <button type="button" className="p-1 hover:bg-gray-200 rounded" title="Align Center">
                                          &#8801;
                                        </button>
                                        <button type="button" className="p-1 hover:bg-gray-200 rounded" title="Align Right">
                                          &#8677;
                                        </button>
                                        <button type="button" className="p-1 hover:bg-gray-200 rounded" title="Bullet List">
                                          &#8226;
                                        </button>
                                        <button type="button" className="p-1 hover:bg-gray-200 rounded" title="Numbered List">
                                          1.
                                        </button>
                                        <button type="button" className="p-1 hover:bg-gray-200 rounded" title="Indent">
                                          &#8614;
                                        </button>
                                        <button type="button" className="p-1 hover:bg-gray-200 rounded" title="Link">
                                          &#128279;
                                        </button>
                                        <button type="button" className="p-1 hover:bg-gray-200 rounded" title="Image">
                                          &#128247;
                                        </button>
                                        <button type="button" className="p-1 hover:bg-gray-200 rounded" title="Table">
                                          &#9638;
                                        </button>
                                        <button type="button" className="p-1 hover:bg-gray-200 rounded" title="More">
                                          &#8230;
                                        </button>
                                      </div>

                                      {/* Text Area */}
                                      <textarea
                                        value={getCurrentAdvancedData(activeSectionId).directions}
                                        onChange={(e) => handleAdvancedFormattingChange(activeSectionId, 'directions', e.target.value)}
                                        placeholder="Type something..."
                                        className="w-full h-32 p-3 border border-gray-300 border-t-0 rounded-b-md resize-none focus:outline-none focus:ring-2 focus:ring-[#26a69a]"
                                      />

                                      {/* Footer Info */}
                                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>Powered by Froala</span>
                                        <div className="flex gap-4">
                                          <span>Words: 0</span>
                                          <span>Characters: 0</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Single Question Layout */}
                                    <div className="mb-4">
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Single Question Layout
                                      </label>
                                      <select
                                        value={getCurrentAdvancedData(activeSectionId).singleQuestionLayout}
                                        onChange={(e) => handleAdvancedFormattingChange(activeSectionId, 'singleQuestionLayout', e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#26a69a]"
                                      >
                                        <option value="Single Column">Single Column</option>
                                        <option value="dual Column">Dual Column</option>
                                      </select>
                                    </div>

                                    {/* Passage Question Layout */}
                                    <div className="mb-4">
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Passage Question Layout
                                      </label>
                                      <select
                                        value={getCurrentAdvancedData(activeSectionId).passageQuestionLayout}
                                        onChange={(e) => handleAdvancedFormattingChange(activeSectionId, 'passageQuestionLayout', e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#26a69a]"
                                      >
                                        <option value="Single Column">Single Column</option>
                                        <option value="dual Column">Dual Column</option>
                                      </select>
                                    </div>

                                    {/* Calculator */}
                                    <div className="mb-4">
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Calculator
                                      </label>
                                      <select
                                        value={getCurrentAdvancedData(activeSectionId).calculator}
                                        onChange={(e) => handleAdvancedFormattingChange(activeSectionId, 'calculator', e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#26a69a]"
                                      >
                                        <option value="No Calculator">No Calculator</option>
                                        <option value="Scientific Calculator">Scientific Calculator</option>
                                        <option value="Graphing Calculator">Graphing Calculator</option>
                                      </select>
                                    </div>

                                    {/* Reference Sheet */}
                                    <div className="mb-4">
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Reference Sheet
                                      </label>
                                      <select
                                        value={getCurrentAdvancedData(activeSectionId).referenceSheet}
                                        onChange={(e) => handleAdvancedFormattingChange(activeSectionId, 'referenceSheet', e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#26a69a]"
                                      >
                                        <option value="No Reference Sheet">No Reference Sheet</option>
                                        <option value=" Reference Sheet">Reference Sheet</option>

                                      </select>
                                    </div>

                                    {/* Allotted Time */}
                                    <div className="mb-6">
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Allotted Time
                                      </label>
                                      <select
                                        value={getCurrentAdvancedData(activeSectionId).allottedTime}
                                        onChange={(e) => handleAdvancedFormattingChange(activeSectionId, 'allottedTime', e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#26a69a]"
                                      >
                                        <option value="Default">Default</option>
                                        <option value="15 minutes">15 minutes</option>
                                        <option value="30 minutes">30 minutes</option>
                                        <option value="45 minutes">45 minutes</option>
                                        <option value="60 minutes">60 minutes</option>
                                        <option value="90 minutes">90 minutes</option>
                                        <option value="120 minutes">120 minutes</option>
                                        <option value="Custom">Custom</option>
                                      </select>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex justify-end">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          console.log('Advanced Section Formatting Submitted for Section:', activeSectionId);
                                          console.log('Form Data:', getCurrentAdvancedData(activeSectionId));
                                          console.log('All Advanced Formatting Data:', advancedFormattingData);
                                          setAdvanceModal(false);
                                        }}
                                        className="bg-[#26a69a] hover:bg-[#229a8d] text-white px-6 py-2 rounded-md transition-colors"
                                      >
                                        Submit form
                                      </button>
                                    </div>
                                  </form>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="dnd-text text-center mt-3">
                          <p className="text-slate-800">
                            <i> Drag and Drop to re-arrange section below</i>
                          </p>
                        </div>
                        {/* rquestions and passage to be dropped */}
                        <div className="mt-4 bg-gray-50 p-3 rounded">
                          <h4 className="font-semibold">Dropped Items for this section</h4>
                          <h4 className="font-semibold"> <span className="font-bold text-[#26a69a] text-xl"> {droppedItems[e.id]?.questions.length} </span> Questions  <span className="font-bold text-[#26a69a] text-xl" > {droppedItems[e.id]?.passages.length}</span>   Passages
                            Difficulty
                          </h4>
                          <div className="mt-2">
                            <div className="mb-2">
                              <strong>Questions:</strong>
                              <div className="space-y-2 mt-1">
                                {(droppedItems[e.id]?.questions || []).map((dq) => (
                                  <div key={dq.id} className="flex justify-between items-center p-2 bg-white border rounded">
                                    <span className="text-[#26a69a]">{stripHtml(dq.name || dq.title || `Q ${dq.id}`)}</span>
                                    <button onClick={() => {
                                      setActiveSectionId(e.id);
                                      handleRemoveDroppedQuestion(dq.id);
                                    }}
                                      className="px-2 py-1  text-white bg-[#26a69a] rounded-full  text-sm">&times; </button>
                                  </div>
                                ))}
                                {!(droppedItems[e.id]?.questions?.length) && (<div className="text-sm text-gray-500">No dropped questions</div>)}
                              </div>
                            </div>
                            <div>
                              <strong>Passages:</strong>
                              <div className="space-y-2 mt-1">
                                {(droppedItems[e.id]?.passages || []).map((dp) => (
                                  <div
                                    key={dp.id}
                                    className="p-2 bg-white border rounded"
                                  >
                                    <div
                                      className="flex justify-between items-center cursor-pointer"
                                      onClick={() => handlePassageToggle(dp.id)}
                                    >
                                      <span className="text-[#26a69a]">{stripHtml(dp.name || dp.title || `P ${dp.id}`)}</span>
                                      <div className="flex items-center gap-2">
                                        {passageOpen === dp.id ? (
                                          <span className="text-[#26a69a]">⮝</span>
                                        ) : (
                                          <span className="text-[#26a69a]">⮟</span>
                                        )}
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveSectionId(e.id);
                                            handleRemoveDroppedPassage(dp.id);
                                          }}
                                          className="px-2 py-1 text-white bg-[#26a69a] rounded-full text-sm"
                                        >
                                          &times;
                                        </button>
                                      </div>
                                    </div>

                                    {passageOpen === dp.id && (
                                      <ul className="mt-2">
                                        {Array.isArray(dp.questions) && dp.questions.length > 0 ? (
                                          <>
                                            <h3 className="font-bold text-gray-900 mt-2">Questions</h3>
                                            {dp.questions.map((pas) => (
                                              <li key={pas.id} className="text-[#26a69a] border border-gray-300 rounded-md my-2 p-2 ">
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
                      className="mb-2 px-4 py-2 bg-[#26a69a] text-white rounded hover:bg-[#229a8d] transition-colors flex items-center gap-1"
                      onClick={handleFilterClick}
                    >
                      &#x2617;
                    </button>
                  )}
                  {
                    filterActive && activeSectionId && (() => {
                      const currentSectionId = activeSectionId;
                      const selectedTopicIds = selectedQuestion[currentSectionId] || [];

                      const sectionFilterData = filterData[currentSectionId] || {
                        difficulty: '',
                        author: '',
                        subTopics: [],
                        topics: selectedTopicIds
                      };
                      const sectionSubTopics = filterSubTopics[currentSectionId] || [];

                      return (
                        <div className="absolute top-10 right-0 shadow-2xl text-black flex flex-col gap-3 bg-white rounded-lg p-4 z-50 w-60 border border-gray-300">
                          <div className="flex justify-between items-center">
                            <h4 className="font-semibold text-gray-800">Filter Section: {currentSectionId}</h4>
                            <button
                              onClick={() => setFilterActive(false)}
                              className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                            >
                              ×
                            </button>
                          </div>

                          {/* Show info about current selection */}
                          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                            Based on {selectedTopicIds.length} selected topics from Multi select  dropdown of section
                          </div>
                          {/* Difficulty Filter */}
                          <div className="difficulty">
                            <label className="block text-sm font-medium mb-1">Difficulty Level</label>
                            <select
                              name="difficulty"
                              value={sectionFilterData.difficulty}
                              onChange={(e) => setFilterData(prev => ({
                                ...prev,
                                [currentSectionId]: {
                                  ...prev[currentSectionId],
                                  difficulty: e.target.value
                                }
                              }))}
                              className="w-full p-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#26a69a]"
                            >
                              <option value="">Select difficulty</option>
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => (
                                <option key={level} value={level}>{level}</option>
                              ))}
                            </select>
                          </div>

                          {/* Author Filter */}
                          <div className="author">
                            <label className="block text-sm font-medium mb-1">Author</label>
                            <select
                              name="author"
                              value={sectionFilterData.author}
                              onChange={(e) => setFilterData(prev => ({
                                ...prev,
                                [currentSectionId]: {
                                  ...prev[currentSectionId],
                                  author: e.target.value
                                }
                              }))}
                              className="w-full p-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#26a69a]"
                            >
                              <option value="">Select Author</option>
                              <option value="Christian New">Christian New</option>
                              <option value="Cody Jackson">Cody Jackson</option>
                              <option value="Piqosity Official">Piqosity Official</option>
                              <option value="Conner Bowering">Conner Bowering</option>
                              <option value="Evan Pangra Sult">Evan Pangra Sult</option>
                              <option value="ela58 stutest">ela58 stutest</option>
                              <option value="Andy Peters">Andy Peters</option>
                              <option value="Andy T Teacher">Andy T Teacher</option>
                            </select>
                          </div>

                          {/* Sub-topics Filter - Based on backend payload IDs */}
                          <div className="sub-topics">
                            <label className="block text-sm font-medium mb-1">
                              Sub-topics
                              <span className="text-xs text-gray-500 ml-1">
                                ({sectionSubTopics.length} available)
                              </span>
                            </label>
                            <MultiSelect
                              value={sectionFilterData.subTopics}
                              onChange={(e) => setFilterData(prev => ({
                                ...prev,
                                [currentSectionId]: {
                                  ...prev[currentSectionId],
                                  subTopics: e.value || []
                                }
                              }))}
                              options={sectionSubTopics}
                              optionLabel="title"
                              optionValue="id"
                              placeholder={
                                selectedTopicIds.length === 0
                                  ? "No topics selected"
                                  : sectionSubTopics.length === 0
                                    ? "Loading sub-topics..."
                                    : "Select Sub-topics"
                              }
                              disabled={selectedTopicIds.length === 0}
                              className="w-full border border-gray-400 rounded-md"
                            />
                          </div>

                          {/* Main Topics Filter - Same options as main dropdown */}
                          <div className="topics">
                            <label className="block text-sm font-medium mb-1">Additional Topics</label>
                            <MultiSelect
                              value={sectionFilterData.topics}
                              onChange={(e) => setFilterData(prev => ({
                                ...prev,
                                [currentSectionId]: {
                                  ...prev[currentSectionId],
                                  topics: e.value || []
                                }
                              }))}
                              options={courses_1}
                              optionLabel="title"
                              optionValue="id"
                              placeholder="Select Additional Topics"
                              className="w-full border border-gray-400 rounded-md"
                            />
                          </div>

                          {/* Action Buttons */}
                          <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                            <button
                              onClick={() => resetFiltersForSection(currentSectionId)}
                              className="border border-gray-400 rounded-md px-4 py-2 hover:bg-gray-50 transition-colors text-sm"
                            >
                              Reset
                            </button>
                            <button
                              onClick={() => applyFiltersForSection(currentSectionId)}
                              className="rounded-md px-4 py-2 text-white bg-[#26a69a] hover:bg-[#229a8d] transition-colors text-sm"
                            >
                              Apply Filters
                            </button>
                          </div>
                        </div>
                      );
                    })()
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
                  {/* REPLACE your existing search input section with this enhanced version: */}

                  <div className="search__ flex items-center gap-2">
                    <label htmlFor="search">Search:</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="search"
                        id="search"
                        value={search}
                        onChange={handleSearch}
                        placeholder={activeTab === "questions" ? "Search questions..." : "Search passages..."}
                        className="bg-gray-200 outline-none p-1 text-[#26a69a] rounded-md pr-8"
                      />
                      {search && (
                        <button
                          onClick={() => {
                            setSearch('');
                            // Restore original data
                            const original = originalSectionData[activeSectionId];
                            if (original && activeSectionId) {
                              setSectionData(prev => ({
                                ...prev,
                                [activeSectionId]: {
                                  questions: original.questions,
                                  passages: original.passages
                                }
                              }));
                            }
                          }}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          title="Clear search"
                        >
                          ×
                        </button>
                      )}
                      {searchLoading[activeSectionId] && (
                        <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                          <div className="w-3 h-3 border-2 border-[#26a69a] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>


                {activeTab === "questions" && (
                  <div>
                    {loading || searchLoading[activeSectionId] ? (
                      <div className="p-4 text-center">
                        {searchLoading[activeSectionId] ? "Searching questions..." : <span className="w-full p-2 bg-gray-300 text-gray-800 font-semibold text-center rounded-lg" >Loading Questions....</span>}
                      </div>
                    ) : (
                      <>
                        {/* Show search results count */}
                        {search && (
                          <div className="mb-2 text-sm text-gray-600 bg-blue-50 p-2 rounded">
                            {(sectionData[activeSectionId]?.questions || []).length} questions found for "{search}"
                          </div>
                        )}

                        <ul>
                          {(sectionData[activeSectionId]?.questions || []).length === 0 && (
                            <li className="p-2 text-gray-500">
                              {search ? `No questions found for "${search}"` : "No questions selected yet."}
                              <br />
                            </li>
                          )}

                          {Array.isArray(sectionData[activeSectionId]?.questions) &&
                            sectionData[activeSectionId].questions.map((q) => (
                              <li
                                key={q.id}
                                className="relative  p-2 border border-gray-200 rounded-md mb-1 text-[#26a69a] cursor-pointer"
                                onClick={() => console.log("list clicked", q.id)}
                                onMouseEnter={() => setHoveredId(q.id)}
                                onMouseLeave={() => setHoveredId(null)}
                              >
                                {stripHtml(q.name)}
                                {
                                  hoveredId === q.id && (
                                    <>
                                      {/* <span className="absolute bg-gray-300 rounded-lg shadow-lg w-full font-bold p-2 left-0" >{stripHtml(q.name)}</span> */}
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleAddQuestion(q); }}
                                        className="ml-2 px-2 py-1 bg-[#26a69a] text-white rounded text-sm"
                                      >
                                        Add
                                      </button>
                                    </>
                                  )
                                }
                              </li>
                            ))
                          }
                        </ul>
                      </>
                    )}
                  </div>
                )}
                {/* Passages List  */}
                {/* REPLACE your existing passages tab content with this: */}

                {activeTab === "passages" && (
                  <div>
                    {loading || searchLoading[activeSectionId] ? (
                      <div className="p-4 text-center">
                        {searchLoading[activeSectionId] ? "Searching passages..." : <span className="w-full p-2 bg-gray-300 text-gray-800 font-semibold text-center rounded-lg" >Loading Passages....</span>}
                      </div>
                    ) : (
                      <>
                        {/* Show search results count */}
                        {search && (
                          <div className="mb-2 text-sm text-gray-600 bg-blue-50 p-2 rounded">
                            {(sectionData[activeSectionId]?.passages || []).length} passages found for "{search}"
                          </div>
                        )}

                        <ul>
                          {(sectionData[activeSectionId].passages || []).length === 0 && (
                            <li className="p-2 text-gray-500">
                              {search ? `No passages found for "${search}"` : "No passages available."}
                            </li>
                          )}

                          {Array.isArray(sectionData[activeSectionId]?.passages) &&
                            sectionData[activeSectionId].passages.map((p) => {
                              console.log("Rendering passage:", p);
                              console.log("Passage questions:", p.questions);
                              return (
                                <li
                                  key={p.id}
                                  className="p-2 border border-gray-200 rounded-md mb-1 text-[#26a69a] cursor-pointer"
                                  onClick={() => handlePassageToggle(p.id)}
                                >
                                  {stripHtml(p.name)}{" "}
                                  {passageOpen === p.id ? (
                                    <span className="text-[#26a69a] flex items-start justify-end">⮝</span>
                                  ) : (
                                    <>
                                      <span className="text-[#26a69a] flex items-start justify-end">⮟</span>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleAddPassage(p); }}
                                        className="ml-2 px-2 py-1 bg-[#26a69a] text-white rounded text-sm"
                                      >
                                        Add
                                      </button>
                                    </>
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
                      </>
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
export default One








