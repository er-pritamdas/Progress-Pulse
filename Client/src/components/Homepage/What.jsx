import React from 'react';

function What() {
    return (
        <section
            id="what"
            className="min-h-screen w-full flex flex-col items-center justify-center px-6 md:px-20 bg-base-100 pt-20 mb-20">

            {/* Intro Section */}
            <div className="text-center mb-12">
                <h2 className="text-5xl font-bold mb-6 text-primary">What is Progress Pulse?</h2>
                <p className="text-base-content text-lg max-w-3xl mx-auto mb-8">
                    Progress Pulse is your personal dashboard to track habits, manage goals, and monitor growth. It gives you real insights about your daily progress and helps you stay consistent and motivated.
                </p>
            </div>

            {/* Images Section */}
            <div className="w-full">
                {/* Picture 1 */}
                <div className="flex flex-col items-center mb-12">
                    <h3 className=" divider text-2xl font-bold mb-6 text-primary">Track Your Habits</h3>
                    <figure class="diff aspect-20/9" tabindex="0">
                        <div class="diff-item-1" role="img" tabindex="0">
                            <img alt="daisy" src="/Dashboard.png" />
                        </div>
                        <div class="diff-item-2" role="img">
                            <img
                                alt="daisy"
                                src="/Dashboard-Dark.png" />
                        </div>
                        <div class="diff-resizer"></div>
                    </figure>
                </div>

                {/* Picture 2 */}
                <div className="flex flex-col items-center mb-12">
                    <h3 className=" divider text-2xl font-bold mb-6 text-primary">Track Your Investment</h3>

                    <figure class="diff aspect-20/9" tabindex="0">
                        <div class="diff-item-1" role="img" tabindex="0">
                            <img alt="daisy" src="/Dashboard-Dark.png" />
                        </div>
                        <div class="diff-item-2" role="img">
                            <img
                                alt="daisy"
                                src="/Dashboard.png" />
                        </div>
                        <div class="diff-resizer"></div>
                    </figure>
                </div>

                {/* Picture 3 */}
                <div className="flex flex-col items-center mb-12">
                    <h3 className=" divider text-2xl font-bold mb-6 text-primary">Track Your Expenses</h3>

                    <figure class="diff aspect-20/9" tabindex="0">
                        <div class="diff-item-1" role="img" tabindex="0">
                            <img alt="daisy" src="/Dashboard.png" />
                        </div>
                        <div class="diff-item-2" role="img">
                            <img
                                alt="daisy"
                                src="/Dashboard-Dark.png" />
                        </div>
                        <div class="diff-resizer"></div>
                    </figure>
                </div>
            </div>
        </section>
    );
}

export default What;

