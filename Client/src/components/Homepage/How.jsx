import React from 'react';

function How() {
  return (
    <section id="how" className="min-h-screen w-full flex flex-col items-center justify-center px-6 md:px-20 bg-base-100">
      <div className="text-center">
        <h2 className="text-5xl font-bold mb-6 text-primary">How it Works?</h2>
        <p className="text-base-content text-lg max-w-3xl mx-auto mb-8">
          Start by setting up your daily goals, track your progress each day, and visualize your success with detailed analytics.
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <div className="card w-72 bg-base-200 shadow-xl">
            <figure>
              <img src="/images/set-goals.jpg" alt="Set Goals" className="w-full h-48 object-cover rounded-t-lg" />
            </figure>
            <div className="card-body">
              <h3 className="card-title text-primary">Set Goals</h3>
              <p>Create custom habits and goals to track your journey.</p>
            </div>
          </div>
          <div className="card w-72 bg-base-200 shadow-xl">
            <figure>
              <img src="/images/track-daily.jpg" alt="Track Daily" className="w-full h-48 object-cover rounded-t-lg" />
            </figure>
            <div className="card-body">
              <h3 className="card-title text-primary">Track Daily</h3>
              <p>Mark your achievements daily to maintain momentum.</p>
            </div>
          </div>
          <div className="card w-72 bg-base-200 shadow-xl">
            <figure>
              <img src="/images/analyze-progress.jpg" alt="Analyze Progress" className="w-full h-48 object-cover rounded-t-lg" />
            </figure>
            <div className="card-body">
              <h3 className="card-title text-primary">Analyze Progress</h3>
              <p>View powerful insights about your consistency and growth.</p>
            </div>
          </div>
          <div className="card w-72 bg-base-200 shadow-xl">
            <figure>
              <img src="/images/analyze-progress.jpg" alt="Analyze Progress" className="w-full h-48 object-cover rounded-t-lg" />
            </figure>
            <div className="card-body">
              <h3 className="card-title text-primary">Analyze Progress</h3>
              <p>View powerful insights about your consistency and growth.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default How;
