
import { useState, useEffect } from 'react'
import { MultiSelect } from 'primereact/multiselect';


const TestBuilder = () => {
    const stripHtml = (htmlString) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');
        return doc.body.textContent || "";
    };
    const [selectedQuestion, setSelectedQuestion] = useState({});
    const [addSection, setAddsection] = useState([]);
    const [formAdd, setFormAdd] = useState([])
    const handleFormAdd = (id, e) => {
        const { name, value } = e.target;
        setFormAdd(prev =>
            prev.map(item =>
                item.id === id ? { ...item, [name]: value } : item
            )
        );
    };

    // const [formAddData, setFormAddData] = useState({
    //     id: crypto.randomUUID(),
    //     title: '',
    //     multiTopics: '',
    // })
    const [courses, setCourses] = useState([]);
    const [courses_1, setCourses_1] = useState([]);
    const [passage, setPassage] = useState([])
    const [topics, setTopics] = useState([])
    const [formData, setformData] = useState({
        id: -1,
        title: "",
        courseVal: "",
        publicVal: "",
        locked: "",
    })
    const handleChange = (e) => {
        const { name, value } = e.target;
        //yaha pe hum ne name [] ke index ko arrays me rakha hai or key value ka pair banaya hai...
        setformData(previous => ({ ...previous, [name]: value }))
    }
    //function for the adding section by clicking button
    // const AddSection = (e) => {
    //     e.preventDefault();
    //     console.log("add section")
    //     console.log("our form data is", formData)
    //     const newItem1 = formData
    //     const newItem = formData;
    //     setFormAdd(prev => {
    //         const lastId = prev.length > 0 ? prev[prev.length - 1].id : 0;
    //         const newItemWithId = {
    //             ...newItem1,
    //             id: lastId + 1,
    //         };
    //         return [...prev, newItemWithId];
    //     })
    //     console.log(formAdd, "11100-----")
    //     //is se hamare pas us ar ray k andr new items add ho rhi hain yaha spread operator laga ahi jsi se hum previous array ki 1 shallow copy banaye gay jis se us me koi farq nahi aye ga lekin new item uske andr add  ho jae gi..
    //     setAddsection(prev => {
    //         const lastId = prev.length > 0 ? prev[prev.length - 1].id : 0;
    //         const newItemWithId = {
    //             ...newItem,
    //             id: lastId + 1,
    //         };
    //         return [...prev, newItemWithId];
    //     });
    //     setformData({
    //         title: "",
    //         courseVal: "",
    //         publicVal: "",
    //         locked: "",
    //     })
    // }

    const AddSection = (e) => {
        e.preventDefault();

        const newId = formAdd.length > 0 ? formAdd[formAdd.length - 1].id + 1 : 1;
        const newFormData = {
            id: newId,
            title: "",
            multiTopics: "",
        };

        const newSection = {
            ...formData,
            id: newId,
        };

        setAddsection(prev => [...prev, newSection]);
        setFormAdd(prev => [...prev, newFormData]);

        setformData({
            title: "",
            courseVal: "",
            publicVal: "",
            locked: "",
        });
    };

    const removeSection = (indexRemove) => {
        console.log('I am index to be removed', indexRemove)
        console.log("check")
        console.log('Hey this is add section', addSection)
        const filter = addSection.filter(id => id.id !== indexRemove);
        setAddsection(filter)
    }
    const getCoursesData = async () => {
        console.log("check getcoursedata")
        try {
            const response = await fetch("https://api.natsent.com/api/v1/commons/generics/get_course",
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        authorization: "eyJhbGciOiJIUzI1NiJ9.eyJ0cnVlX3VzZXJfaWQiOm51bGwsInVzZXJfaWQiOiJiN2UyOGZjOS04YmExLTRjZWUtYWZlYS0yOTFjYTE1MmYyNmQiLCJleHAiOjE3ODU5MTk0MDd9.UI12IbbjeYpt3x6gJ2Z-nX3QRL9SoQLLvx4soiI4Hb8"
                    }
                }
            )
            const data = await response.json();
            setCourses(data.data)
            console.log(data.data)
            console.log("we have console", courses)
        } catch (error) {
            console.log("error is", error)
        }
    }
    const handleCourseChange = async (id) => {
        // setcourseVal(e.value)
        console.log("huge perception", courses_1)
        try {
            const response = await fetch(`
             https://api.natsent.com/api/v1/commons/test_builders/get_course_topics?id=${id} `,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        authorization: "eyJhbGciOiJIUzI1NiJ9.eyJ0cnVlX3VzZXJfaWQiOm51bGwsInVzZXJfaWQiOiJiN2UyOGZjOS04YmExLTRjZWUtYWZlYS0yOTFjYTE1MmYyNmQiLCJleHAiOjE3ODU5MTk0MDd9.UI12IbbjeYpt3x6gJ2Z-nX3QRL9SoQLLvx4soiI4Hb8"
                    }
                }
            )
            const data = await response.json();
            console.log("44 ", data.data)
            setCourses_1(data.data)
            console.log("Hello this is getting id", id)
            console.log("d  block", courses_1)
        } catch (error) {
            console.log("error is", error)
        }
    }
    const handleTopics = async (id) => {
        console.log("check topics")

        try {
            const response = await fetch("https://api.natsent.com/api/v1/commons/test_builders/get_all_passages",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        authorization: "eyJhbGciOiJIUzI1NiJ9.eyJ0cnVlX3VzZXJfaWQiOm51bGwsInVzZXJfaWQiOiJiN2UyOGZjOS04YmExLTRjZWUtYWZlYS0yOTFjYTE1MmYyNmQiLCJleHAiOjE3ODU5MTk0MDd9.UI12IbbjeYpt3x6gJ2Z-nX3QRL9SoQLLvx4soiI4Hb8"
                    },
                    body: JSON.stringify({ ids: id })
                }
            )
            const data = await response.json()

            console.log(response, "00990099")
            console.log(data.data, "topic renderd passages ")
            setPassage(data.data)
            console.log(passage)
        } catch (error) {
            console.log(error)
        }
        try {
            const response = await fetch("https://api.natsent.com/api/v1/commons/test_builders/get_all_questions",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        authorization: "eyJhbGciOiJIUzI1NiJ9.eyJ0cnVlX3VzZXJfaWQiOm51bGwsInVzZXJfaWQiOiJiN2UyOGZjOS04YmExLTRjZWUtYWZlYS0yOTFjYTE1MmYyNmQiLCJleHAiOjE3ODU5MTk0MDd9.UI12IbbjeYpt3x6gJ2Z-nX3QRL9SoQLLvx4soiI4Hb8"
                    }, body: JSON.stringify({ ids: id })
                }
            )
            const data = await response.json();

            setTopics(data.data.data)
            // setTopics(data.data.data)

            console.log(topics, "topic renderd questions ")
            console.log(response, "00990099")
        } catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {
        getCoursesData()
        // handleCourseChange()
    }, [])

    return (
        <div className='main-container p-3 '>
            <div className="tb-header p-3 mb-3 rounded-xl bg-white w-full flex item-center justify-between">
                <h3 className='text-2xl font-semibold text-blue-950'>Test Builder</h3>
                <div className=''>
                    <button className='bg-blue-950 text-white px-8 py-2 rounded-lg'>save</button>
                </div>
            </div>
            {/* This is the Body where our dynamic sections added  */}
            <div className="tb-body-main flex gap-2 ">
                <div className="tb-body tb-left">
                    <div className="b-header flex flex-between items-center justify-between ">
                        <ul className='flex items-center bg-white p-2 rounded-xl'>
                            <li>All Section</li>
                        </ul>
                        <ul className='flex'>
                            {addSection.map((sec) => (
                                <li key={sec.id} className='bg-white rounded-lg p-2 relative ml-2'  >
                                    <span className=' text-gray-600 block w-10 text-center'>{sec.id} </span>
                                    <span className="px-1 rounded-full bg-red-600 absolute -top-2 -right-1 cursor-pointer"
                                        onClick={() => removeSection(sec.id)}
                                    >&times;</span>
                                </li>
                            ))}
                        </ul>
                        <div>
                            <button className="py-3 px-2 rounded-xl bg-blue-950 text-white"
                            // onClick={AddSection}
                            >Add</button>
                        </div>
                    </div>
                    <div className="p-3 bg-white rounded-2xl">
                        <form onSubmit={AddSection} >
                            {/* Title field */}
                            <input type="text"
                                placeholder='Title'
                                className='p-2 outline-1 outline-slate-600 border border-gray-500 rounded-md w-full mb-1'
                                value={formData.title}
                                onChange={handleChange}
                                name='title'
                                required
                            />
                            <select name="courseVal"
                                id="courses"
                                value={formData.courseVal}
                                onChange={(e) => {
                                    handleChange(e)
                                    handleCourseChange(e.target.value);
                                }}
                                className='p-2 outline-1 outline-slate-600 border border-gray-500 rounded-md w-full mb-1'
                                required
                            >
                                <option value="">select courses</option>
                                {courses.map((course, id) => (
                                    <option key={id} className='text-black' value={course.course.id
                                    }>{course.course.title
                                        } || {course.course.id}  </option>
                                ))
                                }
                            </select>
                            <div className='flex gap-2' >
                                <select name="publicVal"
                                    id="public"
                                    value={formData.publicVal}
                                    onChange={handleChange}
                                    className='p-2 outline-1 outline-slate-600 border border-gray-500 rounded-md w-[50%] mb-1'
                                >
                                    <option value="public">Public</option>
                                    <option value="private">Private</option>
                                </select>
                                <select name="locked" id="locked"
                                    className='p-2 outline-1 outline-slate-600 border border-gray-500 rounded-md w-[50%] mb-1'
                                    value={formData.locked}
                                    onChange={handleChange}
                                ><option value="locked">Locked</option>
                                    <option value="unlocked">UnLocked</option>
                                </select>
                            </div>
                            <button type='submit'
                                className="py-3 px-2 rounded-xl bg-blue-950 text-white"
                            >Add</button>
                        </form>
                        <div className="bottom">
                            <div className="checkbox flex justify-end gap-3">
                                <label htmlFor="full-length">Full Length Test</label>
                                <input type="checkbox" name="" id="" />
                            </div>
                        </div>
                        <div className="dnd-text text-center">
                            <p className='text-slate-800' ><i> Drag and Drop to re-arrange section below
                            </i>
                            </p>
                        </div>
                        {/* here is the section added  */}
                        {
                            addSection.length > 0 && (
                                <ul className=' border border-gray-200 rounded-xl p-1'>
                                    {addSection.map((sec, id) => (
                                        <li key={id} className='bg-white border border-gray-300 rounded-xl p-2 relative ml-2 mb-1'  >
                                            <span className='text text-[#26a69a]'>{sec.id} </span>

                                            <span className=" rounded-lg bg-red-400 absolute -top-2 -right-1 cursor-pointer"
                                                onClick={() => removeSection(sec.id)}
                                            ></span>
                                        </li>
                                    ))}
                                </ul>
                            )
                        }
                        <div className="bt-text  text-center mt-3 border border-slate-400 rounded-lg p-2">
                            <p> 0 Passages, 0 Questions, 0 Difficulty, 0 EVAD</p>
                        </div>
                    </div>
                    <div className='section-added mt-3 '>
                        {
                            addSection.length > 0 && (
                                <div className='grid grid-cols-2 gap-2' >
                                    {addSection.map((e) => {
                                        const formItem = formAdd.find(item => item.id === e.id) || {};

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
                                                                value={selectedQuestion[e.id] || []} onChange={(ev) => {
                                                                    const selected = ev.value;
                                                                    setSelectedQuestion(prev => ({
                                                                        ...prev,
                                                                        [e.id]: selected
                                                                    }));
                                                                    handleTopics(selected);
                                                                }}
                                                                options={courses_1}
                                                                optionLabel="title"
                                                                optionValue='id'
                                                                placeholder="Select Questions"
                                                                // maxSelectedLabels={3}
                                                                className=" p-3 bg-white w-full border border-gray-400 rounded-lg" />
                                                        </div>
                                                    )}

                                                    <button className="w-full text-white bg-[#26a69a] p-2 rounded-xl">
                                                        Advance Section Formatting
                                                    </button>
                                                </form>
                                            </div>
                                        );
                                    })}

                                </div>
                            )
                        }
                    </div>
                </div>
                <div className='tb-right rounded-lg'>
                    {addSection.length === 0 ?
                        ("No added  topics section here ") : (<div className='p-2 bg-white rounded-lg'>
                            here the data of the topics rendered...
                            <ul>
                                {topics.map((tp) => (
                                    <li className='p-2 text-[#26a69a] border border-gray-200 rounded-md mb-1' key={tp.id}>  {stripHtml(tp.name)} </li>
                                ))}
                            </ul>
                    </div>)}
                </div>
            </div>
        </div>
    )
}

export default TestBuilder
