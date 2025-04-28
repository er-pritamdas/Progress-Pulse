import React from 'react';

function How() {
  return (
    <section id="how" className="min-h-screen w-full flex flex-col items-center justify-center px-6 md:px-20 bg-base-100">
      <div className="text-center">
        <h2 className="text-5xl font-bold mb-6 text-primary">How it Works?</h2>
        <p className="text-base-content text-lg max-w-3xl mx-auto mb-8">
          Simply log your habits, investments, and expenses through an easy-to-use table with full CRUD operations.
          Your data instantly updates interactive dashboards and detailed tables, helping you visualize and manage your journey effortlessly.
        </p>

        <div className="flex flex-col md:flex-row flex-wrap items-center justify-center gap-8">
          {/* Card 1 */}
          <div className="card card-border bg-base-300 w-96 shadow-md">
            <figure>
              <img
                src="/Dashboard.png"
                alt="Enter Data"
                className="w-full h-48 object-cover"
              />
            </figure>
            <div className="card-body">
              <h2 className="card-title">
                Enter Your Data
                <div className="badge badge-soft badge-success">Step 1</div>
              </h2>
              <p>Add, edit, or delete your daily entries for habits, investments, and expenses.</p>
              <div className="card-actions justify-end">
                <div className="badge badge-outline badge-info font-bold">Habits</div>
                <div className="badge badge-outline badge-success font-bold">Finance</div>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="card card-border bg-base-300 w-96 shadow-md">
            <figure>
              <img
                src="/Dashboard.png"
                alt="Auto Update"
                className="w-full h-48 object-cover"
              />
            </figure>
            <div className="card-body">
              <h2 className="card-title">
                Automatic Updates
                <div className="badge badge-soft badge-success">Step 2</div>
              </h2>
              <p>Your dashboards and table views update instantly as you manage your entries.</p>
              <div className="card-actions justify-end">
                <div className="badge badge-outline badge-info font-bold">Live</div>
                <div className="badge badge-outline badge-success font-bold">Smart</div>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="card card-border bg-base-300 w-96 shadow-md">
            <figure>
              <img
                src="/Dashboard.png"
                alt="Visualize Growth"
                className="w-full h-48 object-cover"
              />
            </figure>
            <div className="card-body">
              <h2 className="card-title">
                Visualize Your Growth
                <div className="badge badge-soft badge-success">Step 3</div>
              </h2>
              <p>Analyze your habits, investments, and expenses with clean, powerful visuals.</p>
              <div className="card-actions justify-end">
                <div className="badge badge-outline badge-info font-bold">Dashboard</div>
                <div className="badge badge-outline badge-info font-bold">Insights</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default How;
