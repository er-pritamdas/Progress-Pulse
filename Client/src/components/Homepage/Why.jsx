import React from 'react';

function Why() {
    return (
        <section id="why" className="min-h-screen w-full flex flex-col items-center justify-center px-6 md:px-20 bg-base-200">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">

                {/* Left Side - Images Section */}
                <div className="md:w-1/2 text-center md:text-left">
                    <h2 className="text-5xl font-bold mb-6 text-primary">Why Progress Pulse?</h2>
                    <p className="text-base-content text-lg max-w-3xl mx-auto md:mx-0">
                        Because consistency beats intensity. Progress Pulse helps you maintain small daily wins that eventually build into life-changing results.
                        Plus, it's customizable, lightweight, and designed to suit your journey — whether it's fitness, learning, or career!
                    </p>
                </div>

                {/* Right Side - Content Section */}
                <div className="flex flex-wrap gap-6 justify-center md:w-1/2">
                    <img src="/path/to/image1.png" alt="Image1" className="w-120 h-120 object-cover rounded-lg shadow-xl" />
                </div>


            </div>
        </section>
    );
}

export default Why;
