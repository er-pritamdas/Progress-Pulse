import Refresh from "../../../../utils/Icons/Refresh";

function Heading({
  handleAddEntryClick,
  currentPage,
  fetchHabits,
  setShowErrorAlert,
  setAlertErrorMessage,
  setShowSuccessAlert,
  setAlertSuccessMessage,
}) {
  return (
    <div className="flex justify-between items-center flex-wrap gap-4">
      <h1 className="text-2xl font-bold">Habit Tracker Table Entry</h1>

      <div className="join join-vertical lg:join-horizontal">
        <button
          className="btn btn-primary join-item"
          onClick={handleAddEntryClick}
        >
          + Add Entry
        </button>
        <button
          className="btn btn-soft join-item"
          onClick={() => {
            fetchHabits(currentPage);
            setAlertSuccessMessage("Refreshed!");
            setShowSuccessAlert(true);
            setTimeout(() => setShowSuccessAlert(false), 4000);
          }}
        >
          <Refresh /> Refresh
        </button>
      </div>
    </div>
  );
}

export default Heading;
