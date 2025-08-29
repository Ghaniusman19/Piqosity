import { useState, useEffect, useCallback } from 'react';
import { MultiSelect } from 'primereact/multiselect';
import { Paginator } from 'primereact/paginator';
// import Select from 'react-select';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
function TestDnd() {
    const stripHtml = (htmlString) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, "text/html");
        return doc.body.textContent || "";
    };
    //All States of the file 
    const [errors, setErrors] = useState({});
    const [showPage, setShowPage] = useState('')
    const [activeTab, setActiveTab] = useState(0);
    const [rightTabs, setRightTabs] = useState("questions")
    const [courses, setCourses] = useState([]);
    const [courses_1, setCourses_1] = useState([]);
    const [search, setSearch] = useState("")
    const [expandedPassage, setExpandedPassage] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [advanceModal, setAdvanceModal] = useState(false);
    const [tabList, setTabList] = useState([
        {
            id: 0,
            name: `Tab ${0}`,
            formData: {
                title: "",
                course: " ",
                private: " ",
                locked: " ",
                // tabName: " ",
                // multiTopics: " ",
                // QuestionSource: [],
                // break: " ",
                // questions: [],
                // passages: [],
                // droppedQuestions: [],
                // droppedPassages: []
            }
        }
    ]);
    const handleShowChange = (e) => {
        const value = e.target.value;
        setShowPage(value);

        const rows = Number(value) || 10;
        const tabId = Number(activeTab);
        const currentValues = tabList.find(t => t.id === tabId)?.formData?.QuestionSource || [];

        // Update per-tab pagination settings and reset to first page
        setTabList(prev => prev.map(tab =>
            tab.id === tabId
                ? { ...tab, formData: { ...tab.formData, questionsRows: rows, questionsFirst: 0 } }
                : tab
        ));

        // Fetch the first page with the new page size
        handleCourseData(currentValues, tabId, 0, rows);
    }
    const handlePassageShowChange = (e) => {
        const value = e.target.value;

        const rows = Number(value) || 10;
        const tabId = Number(activeTab);
        const currentValues = tabList.find(t => t.id === tabId)?.formData?.QuestionSource || [];

        // Update per-tab passage pagination settings and reset to first page
        setTabList(prev => prev.map(tab =>
            tab.id === tabId
                ? { ...tab, formData: { ...tab.formData, passageRows: rows, passageFirst: 0 } }
                : tab
        ));

        // Fetch the first page for passages with the new page size
        handleCourseData(currentValues, tabId, 0, rows);
    }
    //Code for Drag and Drop Functionality
    const LEFT = "left";
    const RIGHT = "right";
    // originType: 'questions' | 'dropped'
    const handleDragStart = (e, id, originTabId = null, originType = 'questions') => {
        const payload = { id: String(id), originTabId: originTabId == null ? null : String(originTabId), originType };
        e.dataTransfer.setData('text/plain', JSON.stringify(payload));
        try { e.dataTransfer.effectAllowed = 'move'; } catch { void 0; }
        console.log('dragstart ->', payload);
    };
    const allowDrop = (e) => {
        e.preventDefault(); // required to allow drop
    };
    const handleDrop = (e, targetTabId) => {
        e.preventDefault();
        const raw = e.dataTransfer.getData('text/plain');
        console.log('drop  dataTransfer:', raw, 'targetTabId:', targetTabId);
        if (!raw) return;
        let payload;
        try { payload = JSON.parse(raw); }
        catch { payload = { id: String(raw), originType: 'questions', originTabId: null }; }
        const idStr = String(payload.id);
        const originType = payload.originType || 'questions';
        const originTabId = payload.originTabId != null ? String(payload.originTabId) : null;
        setTabList(prevTabs => {
            let dragged = null;
            let removed = prevTabs.map(t => t);
            // Try removing from the origin tab first (if provided)
            if (originTabId != null) {
                removed = prevTabs.map(tab => {
                    if (String(tab.id) !== String(originTabId))
                        return tab;
                    // questions / droppedQuestions
                    if (originType === 'questions' || originType === 'dropped') {
                        const q = tab.formData?.questions || [];
                        const qi = q.findIndex(x => String(x.id) === idStr);
                        if (qi !== -1) {
                            dragged = q[qi];
                            return { ...tab, formData: { ...tab.formData, questions: q.filter(x => String(x.id) !== idStr) } };
                        }
                        const d = tab.formData?.droppedQuestions || [];
                        const di = d.findIndex(x => String(x.id) === idStr);
                        if (di !== -1) { dragged = d[di]; return { ...tab, formData: { ...tab.formData, droppedQuestions: d.filter(x => String(x.id) !== idStr) } }; }
                    }
                    // passages / droppedPassages
                    if (originType === 'passage' || originType === 'droppedPassage') {
                        const p = tab.formData?.passages || [];
                        const pi = p.findIndex(x => String(x.id) === idStr);
                        if (pi !== -1) { dragged = p[pi]; return { ...tab, formData: { ...tab.formData, passages: p.filter(x => String(x.id) !== idStr) } }; }
                        const dp = tab.formData?.droppedPassages || [];
                        const dpi = dp.findIndex(x => String(x.id) === idStr);
                        if (dpi !== -1) { dragged = dp[dpi]; return { ...tab, formData: { ...tab.formData, droppedPassages: dp.filter(x => String(x.id) !== idStr) } }; }
                    }
                    return tab;
                });
            }
            // Fallback: scan all tabs if not found
            if (!dragged) {
                removed = prevTabs.map(tab => {
                    // droppedQuestions
                    const d = tab.formData?.droppedQuestions || [];
                    const idx = d.findIndex(x => String(x.id) === idStr);
                    if (idx !== -1) {
                        dragged = d[idx];
                        return { ...tab, formData: { ...tab.formData, droppedQuestions: d.filter(x => String(x.id) !== idStr) } };
                    }

                    // questions
                    const q = tab.formData?.questions || [];
                    const qi = q.findIndex(x => String(x.id) === idStr);
                    if (qi !== -1) { dragged = q[qi]; return { ...tab, formData: { ...tab.formData, questions: q.filter(x => String(x.id) !== idStr) } }; }

                    // passages
                    const p = tab.formData?.passages || [];
                    const pi = p.findIndex(x => String(x.id) === idStr);
                    if (pi !== -1) { dragged = p[pi]; return { ...tab, formData: { ...tab.formData, passages: p.filter(x => String(x.id) !== idStr) } }; }

                    // droppedPassages
                    const dp = tab.formData?.droppedPassages || [];
                    const dpi = dp.findIndex(x => String(x.id) === idStr);
                    if (dpi !== -1) { dragged = dp[dpi]; return { ...tab, formData: { ...tab.formData, droppedPassages: dp.filter(x => String(x.id) !== idStr) } }; }

                    return tab;
                });
            }
            if (!dragged) {
                // debug: list ids in source arrays to help diagnose type/shape mismatches
                const summary = prevTabs.map(t => ({ tabId: t.id, questionIds: (t.formData?.questions || []).map(x => String(x.id)), droppedIds: (t.formData?.droppedQuestions || []).map(x => String(x.id)), passageIds: (t.formData?.passages || []).map(x => String(x.id)), droppedPassageIds: (t.formData?.droppedPassages || []).map(x => String(x.id)) }));
                console.warn('Dragged item not found in source arrays:', idStr, 'summary:', summary);
                return prevTabs;
            }
            // add to target: restore to original list if coming from dropped, otherwise add to dropped lists
            return removed.map(tab => {
                if (String(tab.id) !== String(targetTabId)) return tab;

                // questions
                if (originType === 'dropped' || originType === 'questions') {
                    if (originType === 'dropped') {
                        const existingQs = tab.formData?.questions || [];
                        if (existingQs.some(x => String(x.id) === idStr)) return tab;
                        return { ...tab, formData: { ...tab.formData, questions: [...existingQs, dragged] } };
                    } else {
                        const existingDropped = tab.formData?.droppedQuestions || [];
                        if (existingDropped.some(x => String(x.id) === idStr)) return tab;
                        return { ...tab, formData: { ...tab.formData, droppedQuestions: [...existingDropped, dragged] } };
                    }
                }

                // passages
                if (originType === 'droppedPassage' || originType === 'passage') {
                    if (originType === 'droppedPassage') {
                        const existingP = tab.formData?.passages || [];
                        if (existingP.some(x => String(x.id) === idStr)) return tab;
                        return { ...tab, formData: { ...tab.formData, passages: [...existingP, dragged] } };
                    } else {
                        const existingDroppedP = tab.formData?.droppedPassages || [];
                        if (existingDroppedP.some(x => String(x.id) === idStr)) return tab;
                        return { ...tab, formData: { ...tab.formData, droppedPassages: [...existingDroppedP, dragged] } };
                    }
                }

                return tab;
            });
        });
    };
    //Code for Add Tabs ...
    const addTab = () => {
        const newTab = {
            id: tabList.length,
            name: tabList.length,
            group: LEFT,
            formData: {
                tabName: " ", multiTopics: " ",
                QuestionSource: [],
                break: " ",
                questions: [],
                passages: [],
                droppedQuestions: [],
                droppedPassages: [],
                // inside newTab.formData
                questionsFirst: 0,    // first index (start)
                questionsRows: 10,    // page size (length)
                questionsTotal: 0,    // total records (filled by API)
                passageFirst: 0,
                passageRows: 10,
                passageTotal: 0,
                questions25: 25,
                passage25: 25,
            }
        }
        setTabList(prev => [...prev, newTab]);
        setActiveTab(newTab.id.toString()); // make it string for eventKey
    };
    //This is the remove functionality of whether the targeted id is equal to that id is not
    const removeTab = (id) => {
        setTabList(prev => prev.filter((i) => i.id !== id));
    }
    const handleInputChange = (id, fieldname, val) => {
        setTabList((prevTabs) =>
            prevTabs.map((tab) =>
                tab.id === id ? { ...tab, formData: { ...tab.formData, [fieldname]: val } } : tab
            )
        );
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(tabList);
    }
    // This is the button functionality on which whole tab data is to be submitted...
    const handleOverAllSubmit = (e) => {
        e.preventDefault();

        const firstTab = tabList?.[0];
        const firstTitle = firstTab?.formData?.title || "";
        const firstQuestionSource = firstTab?.formData?.QuestionSource || [];

        const newErrors = {};

        if (!firstTitle.trim()) {
            newErrors.title = "Title for first tab is required";
        }

        // If multiTopics is not Break, QuestionSource must be selected
        if ((firstTab?.formData?.multiTopics || "") !== "Break" && (!Array.isArray(firstQuestionSource) || firstQuestionSource.length === 0)) {
            newErrors.questionSource = "Please select at least one Question Source";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return; // block submit
        }

        setErrors({});
        // continue with submit
        console.log(tabList);
    };
    // This is the function which fetches the course data from the API...
    const getCourse = async () => {
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
            console.log(data.data)
            setCourses(data.data || []);
        } catch (error) {
            console.error("getCoursesData error:", error);
        }
    }
    //This is the function which fetches the course topics based on the course id...
    const handleCourseChange = async (id) => {
        console.log('handleCourseChange called with id:', id, 'activeTab:', activeTab, 'current tabList length:', tabList.length);
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
            console.log(data.data)
            setCourses_1(data.data || []);
            console.log('courses_1 fetched:', data.data ? data.data.length : 0);

            // If course changed while on the first tab, clear all other tabs so user must recreate them
            const tabId = Number(activeTab);
            if (tabId === 0) {
                setTabList(prev => {
                    const first = prev[0] || { id: 0, name: 'Tab 0', formData: {} };
                    const updatedFirst = { ...first, formData: { ...first.formData, course: id } };
                    return [updatedFirst];
                });
                setActiveTab(0);
            } else {
                // Otherwise update only the current tab's course
                setTabList(prev => prev.map(tab => tab.id === tabId ? { ...tab, formData: { ...tab.formData, course: id } } : tab));
            }
        } catch (error) {
            console.error("handleCourseChange error:", error);
        }
    };

    // Debug: log tabList when it changes to trace unexpected removals
    useEffect(() => {
        console.log('tabList updated (debug):', tabList.map(t => ({ id: t.id, name: t.name, course: t.formData?.course })));
    }, [tabList]);
    const onQuestionsPageChange = (event, tabId) => {
        // event.first (start) and event.rows (page size)
        const values = tabList.find(t => t.id === tabId)?.formData?.QuestionSource || [];
        handleCourseData(values, tabId, event.first, event.rows, search);
    };
    const onPassagePageChange = (event, tabId) => {
        // event.first (start) and event.rows (page size)
        const values = tabList.find(t => t.id === tabId)?.formData?.QuestionSource || [];
        handleCourseData(values, tabId, event.first, event.rows, search);
    };
    //This is the function used to fetch the question data based on the selected question source and renders at the right div of the each tab...
    const handleCourseData = useCallback(async (values, tabId, start = 0, length = 10, searchStr = "") => {
        console.log("selected values");
        try {
            console.log("question try code");
            const response = await fetch(
                "https://api.natsent.com/api/v1/commons/test_builders/get_all_questions",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        authorization:
                            "eyJhbGciOiJIUzI1NiJ9.eyJ0cnVlX3VzZXJfaWQiOm51bGwsInVzZXJfaWQiOiJiN2UyOGZjOS04YmExLTRjZWUtYWZlYS0yOTFjYTE1MmYyNmQiLCJleHAiOjE3ODU5MTk0MDd9.UI12IbbjeYpt3x6gJ2Z-nX3QRL9SoQLLvx4soiI4Hb8",
                    },
                    body: JSON.stringify({ ids: values, length, start, search: searchStr }),
                }
            );
            const data = await response.json();
            const items = data.data.data || [];
            const total = data.data.total_count || data?.data?.count || items.length;

            console.log(data.data)
            setTabList(prevTabs =>
                prevTabs.map(tab =>
                    tab.id === tabId
                        ? {
                            ...tab,
                            formData: {
                                ...tab.formData,
                                questions: items,
                                questionsFirst: start,
                                questionsRows: length,
                                questionsTotal: total,
                                lastSearch: searchStr,
                            }
                        }
                        : tab
                )
            );
            console.log(tabList, "new date picked")
        } catch (error) {
            console.log(error)
        }
        try {
            console.log("passage try code");
            const response = await fetch(
                "https://api.natsent.com/api/v1/commons/test_builders/get_all_passages",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        authorization:
                            "eyJhbGciOiJIUzI1NiJ9.eyJ0cnVlX3VzZXJfaWQiOm51bGwsInVzZXJfaWQiOiJiN2UyOGZjOS04YmExLTRjZWUtYWZlYS0yOTFjYTE1MmYyNmQiLCJleHAiOjE3ODU5MTk0MDd9.UI12IbbjeYpt3x6gJ2Z-nX3QRL9SoQLLvx4soiI4Hb8",
                    },
                    body: JSON.stringify({ ids: values, length, start, search: searchStr }),
                }
            );
            const data = await response.json();
            const items = data.data.data || [];
            const total = data.data.total_count || data?.data?.count || items.length;
            console.log(data.data)
            setTabList(prevTabs =>
                prevTabs.map(tab =>
                    tab.id === tabId
                        ? {
                            ...tab, formData:
                            {
                                ...tab.formData,
                                passages: items,
                                passageFirst: start,
                                passageRows: length,
                                passageTotal: total,
                                lastSearch: searchStr,
                            }
                        }
                        : tab
                )
            );
        } catch (error) {
            console.log(error)
        }
        try {
            const response = await fetch(
                `https://api.natsent.com/api/v1/commons/test_builders/get_sub_topics_of_topics?ids=${values}`,
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
            console.log(data)
        } catch (error) {
            console.log(error)
        }
    }, [tabList]);
    // const searchQuestions = async (search, values, tabId) => {
    //     console.log("searched....")
    //     try {
    //         console.log("question try code");
    //         const response = await fetch(
    //             "https://api.natsent.com/api/v1/commons/test_builders/get_all_questions",
    //             {
    //                 method: "POST",
    //                 headers: {
    //                     "Content-Type": "application/json",
    //                     authorization:
    //                         "eyJhbGciOiJIUzI1NiJ9.eyJ0cnVlX3VzZXJfaWQiOm51bGwsInVzZXJfaWQiOiJiN2UyOGZjOS04YmExLTRjZWUtYWZlYS0yOTFjYTE1MmYyNmQiLCJleHAiOjE3ODU5MTk0MDd9.UI12IbbjeYpt3x6gJ2Z-nX3QRL9SoQLLvx4soiI4Hb8",
    //                 },
    //                 body: JSON.stringify({ search: search, ids: values }),
    //             }
    //         );
    //         const data = await response.json();
    //         console.log(data.data)
    //         setTabList(prevTabs =>
    //             prevTabs.map(tab =>
    //                 tab.id === tabId
    //                     ? { ...tab, formData: { ...tab.formData, questions: data.data.data } }
    //                     : tab
    //             )
    //         );
    //         console.log(tabList, "new date picked")

    //     } catch (error) {
    //         console.log(error)
    //     }

    // }

    //This is the Function which is used to toggle the passage and shows the questions in that passage ...
    const togglePassage = (id) => {
        setExpandedPassage(expandedPassage === id ? null : id);
    };
    useEffect(() => {
        getCourse();
    }, [])
    // Debounced search: when `search` or `activeTab` changes, fetch filtered results
    useEffect(() => {
        const tabId = Number(activeTab);
        const values = tabList.find(t => t.id === tabId)?.formData?.QuestionSource || [];
        const rows = tabList.find(t => t.id === tabId)?.formData?.questionsRows || 10;

        // reset paging to first page for this tab
        setTabList(prev => prev.map(tab => tab.id === tabId ? { ...tab, formData: { ...tab.formData, questionsFirst: 0, passageFirst: 0 } } : tab));

        const term = (search || "").trim();
        const timer = setTimeout(() => {
            handleCourseData(values, tabId, 0, rows, term);
        }, 400);
        return () => clearTimeout(timer);
    }, [search, activeTab, handleCourseData, tabList]);
    // This is the Code / Function which is used to handle the contributor data fetch....
    const handleContributer = async () => {
        console.log("handle Contributer")
    }
    //ye line ya find method hame array me se pehle object return krta hai jo condition ko match krta hai..
    const activeTabData = tabList.find((t) => t.id.toString() === activeTab);
    // client-side filtered lists for instant search UX
    const filterBySearch = (items = [], term = "") => {
        const s = (term || "").toLowerCase().trim();
        if (!s) return items;
        return items.filter(it => (it.name || "").toLowerCase().includes(s));
    };
    const filteredQuestions = filterBySearch(activeTabData?.formData?.questions || [], search);
    const filteredPassages = filterBySearch(activeTabData?.formData?.passages || [], search);
    const difficulty = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    const BreakMinutes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
    return (
        <>
            {advanceModal && (
                <div className="absolute w-full h-full z-10 ">
                    <div className='absolute z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white shadow-xl p-2 rounded-md ' >Lorem, ipsum dolor sit amet consectetur adipisicing elit. Inventore, explicabo.
                        <button className='bg-gray-800 text-white rounded-lg border border-gray-800 p-2 '
                            onClick={() => setAdvanceModal(false)}
                        >close</button>
                    </div>
                </div>
            )}
            <div className="main__container">
                <div className="w-full flex items-center justify-between bg-white shadow-md px-6 mb-3 py-4 ">
                    <h1 className="text-2xl font-bold text-blue-900 tracking-wide">
                        Test Builder
                    </h1>
                    <button
                        // onClick={() => console.log("submit")}
                        onClick={handleOverAllSubmit}
                        className="bg-blue-900 text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-blue-800 transition-all duration-300"
                    >
                        Save
                    </button>
                </div>
                <div className='p-1 text-[#26a29a] rounded-xl border  border-gray-500 ' >
                    {errors.title && <p className="font-semibold text-sm mt-1">{errors.title}</p>}
                    {errors.questionSource && <p className="font-semibold text-sm mt-1">{errors.questionSource}</p>}
                </div>

                <div className='m-3 flex gap-2'>
                    <div className="left__div w-[50%] relative  ">
                        <button
                            className="bg-blue-900 hover:bg-blue-800 text-white w-10 h-10 flex items-center justify-center 
             rounded-full shadow-md absolute right-4 top-4 transition duration-300"
                            onClick={addTab}
                        >
                            +
                        </button>
                        <Tabs
                            id="controlled-tab-example"
                            activeKey={activeTab}
                            onSelect={(k) => setActiveTab(k)}
                            className="mb-3 bg-green-100"
                        >
                            {tabList.map((tab) => (
                                <Tab className='relative bg-none bg-green-200' eventKey={tab.id.toString()} title={tab.id} key={tab.id}>
                                    {tabList.length > 1 && (
                                        <button
                                            onClick={() => removeTab(tab.id)}
                                            className="  flex items-center gap-2 px-3 py-1.5  text-sm font-medium text-white bg-[#26a69a] rounded-lg shadow-md  hover:bg-[#10868f]  hover:shadow-lg  transition-all  duration-200 cursor-pointer"
                                        >
                                            Close {tab.id}
                                        </button>
                                    )}
                                    <div className="p-3 bg-white shadow-lg">
                                        {/* <h4 >Content of {tab.name}</h4> */}
                                        <form onSubmit={handleSubmit}
                                            className="bg-white shadow-md rounded-xl p-6 space-y-5 border border-gray-200">
                                            {activeTab == 0 ? (
                                                <div className="flex flex-col gap-4">
                                                    <div>
                                                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                                        <input
                                                            type="text"
                                                            id="title"
                                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                                            value={tab.formData.title}
                                                            placeholder="Enter title"
                                                            onChange={(e) => {
                                                                handleInputChange(tab.id, "title", e.target.value);
                                                                if (errors.title) setErrors(prev => ({ ...prev, title: null }));
                                                            }}
                                                        />
                                                    </div>
                                                    {/* Courses */}
                                                    <div>
                                                        <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">Courses</label>
                                                        <select
                                                            id="course"
                                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"

                                                            value={tab.formData.course}
                                                            onChange={(e) => {
                                                                handleInputChange(tab.id, "course", e.target.value);
                                                                handleCourseChange(e.target.value);
                                                            }}
                                                        > <option value="" className="text-gray-400">Select course</option>
                                                            {courses.map((course, id) => (
                                                                <option
                                                                    key={id}
                                                                    className="bg-white  font-medium hover:bg-blue-100"
                                                                    value={course.course.id}
                                                                >
                                                                    {course.course.title}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    {/* Private / Locked */}
                                                    <div className="flex gap-3">
                                                        <select
                                                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                                            value={tab.formData.private}
                                                            onChange={(e) => handleInputChange(tab.id, "private", e.target.value)}
                                                        >
                                                            <option value="private">Private</option>
                                                            <option value="public">Public</option>
                                                        </select>
                                                        <select
                                                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                                            value={tab.formData.locked}
                                                            onChange={(e) => handleInputChange(tab.id, "locked", e.target.value)}
                                                        >
                                                            <option value="locked">Locked</option>
                                                            <option value="unlocked">Unlocked</option>
                                                        </select>
                                                    </div>
                                                    {/* Tab List */}
                                                    <div className="section__added">
                                                        {tabList.length > 1 && (
                                                            <ul className="list-disc pl-6 mt-3 space-y-2 text-blue-600">
                                                                {tabList.map((tab) => (
                                                                    <li
                                                                        key={tab.id}
                                                                        className="px-3 py-2 text-blue-600 bg-blue-50 rounded-lg shadow-sm hover:bg-blue-100 transition duration-200 cursor-pointer"
                                                                    >
                                                                        <span className="font-medium">{tab.name}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <input
                                                        type="text"
                                                        className="border border-gray-300 rounded-lg px-3 py-2 w-full mb-3 text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                                        value={tab.formData.tabName}
                                                        onChange={(e) => handleInputChange(tab.id, "tabName", e.target.value)}
                                                    />
                                                    <select
                                                        className="border border-gray-300 rounded-lg px-3 py-2 w-full mb-3 text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                                        value={tab.formData.multiTopics}
                                                        onChange={(e) => handleInputChange(tab.id, "multiTopics", e.target.value)}
                                                    >
                                                        <option value="multiTopics">Multi Topics</option>
                                                        <option value="Break">Break</option>
                                                    </select>
                                                    {tab.formData.multiTopics !== "Break" ? (
                                                        <MultiSelect
                                                            value={tab.formData.QuestionSource || []}
                                                            onChange={(e) => {
                                                                const values = Array.isArray(e.value) ? e.value : [];
                                                                handleInputChange(tab.id, "QuestionSource", values);
                                                                // fetch first page
                                                                const rows = tab.formData.questionsRows || 10;
                                                                handleCourseData(values, tab.id, 0, rows);
                                                                if (errors.questionSource)
                                                                    setErrors(prev => ({ ...prev, questionSource: null }));
                                                            }}
                                                            options={courses_1}
                                                            optionLabel="title"
                                                            //This optionValue is used to get id and id go in to the array ..
                                                            optionValue="id"
                                                            filter
                                                            filterDelay={400}
                                                            placeholder="Questions Source"
                                                            className="w-full md:w-20rem text-gray-600" />

                                                    ) : (
                                                        <select
                                                            className="border border-gray-300 rounded-lg px-3 py-2 w-full mb-3 text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                                            value={tab.formData.break}
                                                            onChange={(e) => handleInputChange(tab.id, "break", e.target.value)}
                                                        >
                                                            <option value="">Duration in Minutes</option>
                                                            {BreakMinutes.map((br, i) => (
                                                                <option key={i} value={br}>
                                                                    {br}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </>
                                            )}
                                            <button
                                                type="submit"
                                                className="w-full bg-[#26a69a] hover:bg-[#47bbab] text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200"
                                            >
                                                Submit
                                            </button>
                                        </form>
                                        <div className="advance_section_format p-2 ">
                                            <button
                                                className="w-full bg-[#26a69a] hover:bg-[#47bbab] text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200"
                                                onClick={() => setAdvanceModal(!advanceModal)}
                                            > Advance Section Formatting
                                            </button>

                                        </div>
                                        <div
                                            className="drag__drop w-full  border-2  mt-2 border-blue-200  rounded-2xl  bg-white hover:bg-blue-50 transition-all shadow-sm "
                                            onDragOver={allowDrop}
                                            onDrop={(e) => handleDrop(e, tab.id)}
                                        >
                                            <div className="text-center">
                                                <p className="font-medium mb-2">Drop items here for tab {tab.id}</p>
                                                <div className="inline-flex items-center gap-3">
                                                    <div className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                                                        <span className="text-sm text-gray-600">Number of Questions</span>
                                                        <span className="bg-[#26a69a] text-white text-sm font-semibold px-2 py-0.5 rounded-full">{(tab.formData?.droppedQuestions || []).length}</span>
                                                    </div>
                                                    <div className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                                                        <span className="text-sm text-gray-600">Number of Passages</span>
                                                        <span className="bg-[#26a69a] text-white text-sm font-semibold px-2 py-0.5 rounded-full">{(tab.formData?.droppedPassages || []).length}</span>
                                                    </div>
                                                </div>

                                                {tabList.length > 1 &&
                                                    <div className="mt-3">
                                                        <p className="font-medium mb-2">Dropped items for tab {tab.id}:</p>
                                                        {tab.formData?.droppedQuestions && tab.formData.droppedQuestions.length > 0 ? (
                                                            <ul className="space-y-2">
                                                                {tab.formData.droppedQuestions.map((dq) => (
                                                                    <li
                                                                        key={dq.id}
                                                                        draggable
                                                                        onDragStart={(e) => handleDragStart(e, dq.id, tab.id, 'dropped')}
                                                                        className="p-2 bg-gray-50 rounded-md border border-gray-200"
                                                                    >
                                                                        <div
                                                                            className="flex justify-between items-center">

                                                                            <div className="text-sm text-gray-700">{stripHtml(dq.name)}</div>
                                                                            <div className="text-xs text-gray-500">
                                                                                <span className='text-[#26a69a] border border-gray-200 rounded-full p-2'>{dq.difficulty} &#9878; </span> <span className='text-[#26a69a] border border-gray-200 rounded-full p-2'>{dq.evad} &#9878; </span>  </div>
                                                                        </div>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <p className="text-sm text-gray-400">No dropped questions</p>
                                                        )}

                                                        <div className="mt-4">
                                                            <p className="font-medium mb-2">Dropped Passages</p>
                                                            {tab.formData?.droppedPassages && tab.formData.droppedPassages.length > 0 ? (
                                                                <ul className="space-y-2">
                                                                    {tab.formData.droppedPassages.map((dp) => (
                                                                        <li key={dp.id} draggable onDragStart={(e) => handleDragStart(e, dp.id, tab.id, 'droppedPassage')} className="p-2 bg-gray-50 rounded-md border border-gray-200">
                                                                            <div className="flex justify-between items-center">
                                                                                <div className="text-sm text-gray-700 font-medium">{stripHtml(dp.name)}</div>
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className="text-xs  border border-gray-600 rounded-lg p-2 text-[#26a69a] ">{dp.questions?.length || 0} Qs</div>
                                                                                    <button className="text-sm text-gray-400" onClick={() => togglePassage(dp.id)}>{expandedPassage === dp.id ? "▲" : "▼"}</button>
                                                                                </div>
                                                                            </div>
                                                                            {expandedPassage === dp.id && (
                                                                                <ul className="mt-2 ml-4 space-y-2">
                                                                                    {dp.questions?.length > 0 ? dp.questions.map((q) => (
                                                                                        <li key={q.id} className="text-gray-600 bg-gray-50 p-2 rounded-md shadow-sm flex items-center justify-between">
                                                                                            <p>{stripHtml(q.name)}</p>
                                                                                            <p><span className='text-[#26a69a] border border-gray-200 rounded-full p-2'>{q.difficulty}&#9878; </span>
                                                                                                <span className='text-[#26a69a] border border-gray-200 rounded-full p-2'>{q.evad}&#9878; </span></p>
                                                                                        </li>
                                                                                    )) : <li className="text-gray-400 italic">No questions in passage</li>}
                                                                                </ul>
                                                                            )}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            ) : (
                                                                <p className="text-sm text-gray-400">No dropped passages</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                }

                                            </div>
                                        </div>
                                    </div>
                                </Tab>
                            ))}
                        </Tabs>
                    </div>
                    {tabList.length > 1 && activeTab != 0 && (
                        <div className='bg-emerald-100 w-[50%]'>
                            <div className="header flex justify-between items-center p-2">
                                <p className="name font-semibold text-2xl">
                                    Question
                                </p>
                                <button
                                    onClick={() => setIsOpen(!isOpen)}
                                    className="flex items-center gap-2 px-4 py-2 relative rounded-xl bg-gray-100 text-[#26a69a] font-medium shadow-sm hover:bg-[#26a69a] hover:text-white transition duration-200">
                                    <span className='text-2xl'> &#x2617;</span>
                                </button>
                                {isOpen && (
                                    <div className="absolute right-0 top-20 mt-2 w-72 rounded-xl shadow-lg bg-white border border-gray-200 z-50 p-4">

                                        <div className="mb-4">
                                            <select
                                                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                name="difficulty"
                                            >
                                                <option value="">Select Difficulty</option>
                                                {difficulty.map(d => (
                                                    <option value={d}>{d} </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="mb-4">
                                            <select
                                                className="w-full border rounded-lg px-3 py-2 text-sm text-gray-700 shadow-sm focus:ring-2 focus:ring-[#26169a] focus:outline-none"
                                            >
                                                <option value="">Select a Subtopic...</option>
                                                <option value="option1">Subtopic 1</option>
                                                <option value="option2">Subtopic 2</option>
                                            </select>
                                        </div>
                                        <div className="mb-4">
                                            <select
                                                className="w-full border rounded-lg px-3 py-2 text-sm text-gray-700 shadow-sm focus:ring-2 focus:ring-[#26169a] focus:outline-none"
                                            >
                                                <option value="">Author</option>
                                                <option value="option1">author 1</option>
                                                <option value="option2">author 2 </option>
                                            </select>
                                        </div>
                                        {/* Footer buttons */}
                                        <div className="flex justify-between items-center">
                                            <button className="text-gray-400 text-sm hover:text-gray-600"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                Reset
                                            </button>
                                            <button className="bg-[#26a69a] text-white px-4 py-2 rounded-lg text-sm font-medium shadow hover:bg-[#0a5a52]"
                                                onClick={handleContributer}
                                            >
                                                Apply
                                            </button>
                                        </div>
                                    </div>
                                )}

                            </div>
                            {activeTabData ? <Tabs
                                id="controlled-tab-example"
                                activeKey={rightTabs}
                                onSelect={(k) => setRightTabs(k)}
                                className="mb-3"
                            >
                                <Tab eventKey="questions" title="questions">
                                    {filteredQuestions?.length > 0 ? (
                                        <div className="question_main">
                                            <div className="flex justify-between items-center bg-white shadow-md rounded-xl p-4">
                                                {/* Show dropdown */}
                                                <div className="flex items-center gap-2">
                                                    <label htmlFor="show" className="text-sm font-medium text-gray-600">
                                                        Show
                                                    </label>
                                                    <select
                                                        name="show"
                                                        id="show"
                                                        value={showPage}
                                                        onChange={handleShowChange}
                                                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    >
                                                        <option value="10">10</option>
                                                        <option value="25">25</option>
                                                        <option value="50">50</option>
                                                        <option value="100">100</option>
                                                    </select>
                                                    <span>entries</span>
                                                </div>

                                                {/* Search box */}
                                                <div className="flex items-center gap-2">
                                                    <label htmlFor="search" className="text-sm font-medium text-gray-600">
                                                        Search {search}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="search"
                                                        value={search}
                                                        onChange={(e) => {
                                                            // searchQuestions(e.target.value, activeTabData, tabList.formData.questions)
                                                            setSearch(e.target.value)
                                                        }}
                                                        placeholder="Type to search..."
                                                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-52"
                                                    />
                                                </div>
                                            </div>
                                            <ul className="space-y-3 mt-4"

                                                onDragOver={allowDrop}
                                                onDrop={(e) => handleDrop(e, activeTab)}

                                            >
                                                {filteredQuestions.map((q, index) => (
                                                    <li
                                                        key={q.id}
                                                        draggable
                                                        onDragStart={(e) => handleDragStart(e, q.id, activeTab, 'questions')}
                                                        className="flex items-center justify-between text-[#26a69a] gap-3 p-3 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all bg-white"
                                                    >
                                                        <div className="flex justify-between gap-2 items-center">
                                                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-[#26a69a] font-semibold">
                                                                {index + 1}
                                                            </span>
                                                            <p className="text-[#26a69a] font-medium">

                                                                {stripHtml(q.name)}  </p>
                                                        </div>

                                                        <p><span className='text-[#26a69a] border border-gray-200 rounded-full p-2'>{q.difficulty} &#9878; </span> <span className='text-[#26a69a] border border-gray-200 rounded-full p-2'>{q.evad} <span className='text-amber-400'>&#63;</span> </span> </p>
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className="card">
                                                <Paginator
                                                    first={activeTabData.formData.questionsFirst || 0}
                                                    rows={activeTabData.formData.questionsRows || 10}
                                                    totalRecords={activeTabData.formData.questionsTotal || 0}
                                                    onPageChange={(e) => onQuestionsPageChange(e, activeTabData.id)}
                                                // template="PrevPageLink PageLinks NextPageLink RowsPerPageDropdown"
                                                // rowsPerPageOptions={[5, 10, 20]}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="mt-3 text-center text-sm text-[#26a69a] italic bg-gray-50 border border-dashed border-gray-300 rounded-lg py-2 px-3 shadow-sm">
                                            No Record Found
                                        </p>)}

                                </Tab>
                                <Tab eventKey="passage" title="passage">
                                    {filteredPassages?.length > 0 ? (
                                        <div className="passage_main">
                                            <div className="flex justify-between items-center bg-white shadow-md rounded-xl p-4">
                                                {/* Show dropdown */}
                                                <div className="flex items-center gap-2">
                                                    <label htmlFor="show" className="text-sm font-medium text-gray-600">
                                                        Show
                                                    </label>
                                                    <select
                                                        name="show"
                                                        id="show"
                                                        onChange={handlePassageShowChange}
                                                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    >
                                                        <option value="10">10</option>
                                                        <option value="25">25</option>
                                                        <option value="50">50</option>
                                                        <option value="100">100</option>
                                                    </select>
                                                    <span>entries</span>
                                                </div>

                                                {/* Search box */}
                                                <div className="flex items-center gap-2">
                                                    <label htmlFor="search" className="text-sm font-medium text-gray-600">
                                                        Search {search}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="search"
                                                        value={search}
                                                        onChange={(e) => {
                                                            // searchQuestions(e.target.value, activeTabData, tabList.formData.questions)
                                                            setSearch(e.target.value)
                                                        }}
                                                        placeholder="Type to search..."
                                                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-52"
                                                    />
                                                </div>
                                            </div>
                                            <ul className="space-y-3 mt-4">
                                                {filteredPassages.map((p, index) => (
                                                    <li
                                                        key={p.id}
                                                        draggable
                                                        onDragStart={(e) => handleDragStart(e, p.id, activeTab, 'passage')}
                                                        className="p-3 rounded-xl shadow-sm border border-gray-200 bg-white transition-all"
                                                    >
                                                        <div
                                                            className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2"
                                                            onClick={() => togglePassage(p.id)}
                                                        >
                                                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-[#26a69a] font-semibold">
                                                                {index + 1}
                                                            </span>
                                                            <p className="text-gray-700 font-medium">
                                                                {stripHtml(p.name)}
                                                            </p>
                                                            <span className="ml-auto text-gray-500 text-sm">
                                                                {expandedPassage === p.id ? "▲" : "▼"}
                                                            </span>
                                                        </div>

                                                        {/* Questions (expandable) */}
                                                        {expandedPassage === p.id && (
                                                            <ul className="mt-2 ml-10 space-y-2 border-l-2 border-blue-200 pl-4">
                                                                {p.questions?.length > 0 ? (
                                                                    p.questions.map((q) => (
                                                                        <li
                                                                            key={q.id}
                                                                            className="text-gray-600 bg-gray-50 p-2 rounded-md shadow-sm flex items-center justify-between"
                                                                        >
                                                                            <p>{stripHtml(q.name)}</p>
                                                                            <p  >

                                                                                <span className='text-[#26a69a] border border-gray-200 rounded-full p-2'>{q.difficulty}</span>
                                                                                <span className='text-[#26a69a] border border-gray-200 rounded-full p-2'>{q.evad}</span>
                                                                            </p>

                                                                        </li>
                                                                    ))
                                                                ) : (
                                                                    <li className="text-gray-400 italic">
                                                                        No questions available
                                                                    </li>
                                                                )}
                                                            </ul>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className="card">
                                                <Paginator
                                                    first={activeTabData.formData.passageFirst || 0}
                                                    rows={activeTabData.formData.passageRows || 10}
                                                    totalRecords={activeTabData.formData.passageTotal || 0}
                                                    onPageChange={(e) => onPassagePageChange(e, activeTabData.id)}
                                                // template="PrevPageLink PageLinks NextPageLink RowsPerPageDropdown"
                                                // rowsPerPageOptions={[5, 10, 20]}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="mt-3 text-center text-sm text-[#26a69a] italic bg-gray-50 border border-dashed border-gray-300 rounded-lg py-2 px-3 shadow-sm">
                                            No Record Found
                                        </p>
                                    )}

                                </Tab>
                            </Tabs>
                                : "No input yet"
                            }

                        </div>
                    )
                    }

                </div >

            </div>
        </>
    );
}
export default TestDnd;


