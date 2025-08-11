import { useState } from 'react';

function Test() {
    const [openSections, setOpenSections] = useState({}); // State to track open sections

    const toggleSection = (sectionId) => {
        setOpenSections(prevState => ({
            ...prevState,
            [sectionId]: !prevState[sectionId]
        }));
    };

    return (
        <div>
            {/* Parent Section */}
            <h2 onClick={() => toggleSection('parentSection')} style={{ cursor: 'pointer' }}>
                Parent Section {openSections['parentSection'] ? '▲' : '▼'}
            </h2>
            {openSections['parentSection'] && (
                <div className="parent-content">
                    <p>Content of the parent section.</p>

                    {/* Nested Section 1 */}
                    <h3 onClick={() => toggleSection('nestedSection1')} style={{ cursor: 'pointer' }}>
                        Nested Section 1 {openSections['nestedSection1'] ? '▲' : '▼'}
                    </h3>
                    {openSections['nestedSection1'] && (
                        <div className="nested-content">
                            <p>Content of nested section 1.</p>
                        </div>
                    )}
                    {/* Nested Section 1 */}
                    <h3 onClick={() => toggleSection('nestedSection3')} style={{ cursor: 'pointer' }}>
                        Nested Section 1 {openSections['nestedSection3'] ? '▲' : '▼'}
                    </h3>
                    {openSections['nestedSection3'] && (
                        <div className="nested-content">
                            <p>Content of nested section 1.</p>
                        </div>
                    )}
                    {/* Nested Section 2 */}
                    <h3 onClick={() => toggleSection('nestedSection2')} style={{ cursor: 'pointer' }}>
                        Nested Section 2 {openSections['nestedSection2'] ? '▲' : '▼'}
                    </h3>
                    {openSections['nestedSection2'] && (
                        <div className="nested-content">
                            <p>Content of nested section 2.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Test;