// Sidenav.js
import React, { useState } from 'react';
import '../styles/Sidenav.css';

export default function Sidenav() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleNav = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="nav-wrapper">
            <button id='nav-icon' className={sidebarOpen ? 'open' : ''} onClick={toggleNav}>
                <span></span>
                <span></span>
            </button>
        </div>
    );
}
