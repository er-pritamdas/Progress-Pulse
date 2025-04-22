import React, { useState, useEffect } from 'react';
import AddHabitPopUp from '../../../components/Dashboard/Habit/AddHabitPopUp';
import Trash from '../../../utils/Icons/trash';
import Pencil from '../../../utils/Icons/Pencil';
import Save from '../../../utils/Icons/Save';
import Cancel from '../../../utils/Icons/Cancel';
import ErrorAlert from '../../../utils/Alerts/ErrorAlert';
import SuccessAlert from '../../../utils/Alerts/SuccessAlert'


function HabitTableEntry() {

  // Data
  const mockData = [
    { date: '2025-04-21', burned: '100', water: '4', sleep: '5', read: '60', intake: '1850', selfcare: 'BNF', mood: 'Productive', progress: '100' },
    { date: '2025-04-22', burned: '100', water: '4', sleep: '5', read: '60', intake: '1850', selfcare: 'BNF', mood: 'Productive', progress: '100' },
    { date: '2025-04-23', burned: '100', water: '4', sleep: '5', read: '60', intake: '1850', selfcare: 'BNF', mood: 'Productive', progress: '100' },
    { date: '2025-04-24', burned: '100', water: '4', sleep: '5', read: '60', intake: '1850', selfcare: 'BNF', mood: 'Productive', progress: '100' },
    { date: '2025-04-25', burned: '100', water: '4', sleep: '5', read: '60', intake: '1850', selfcare: 'BNF', mood: 'Productive', progress: '100' },
    { date: '2025-04-26', burned: '100', water: '4', sleep: '5', read: '60', intake: '1850', selfcare: 'BNF', mood: 'Productive', progress: '100' },
    { date: '2025-04-27', burned: '100', water: '4', sleep: '5', read: '60', intake: '1850', selfcare: 'BNF', mood: 'Productive', progress: '100' },
  ];

  // variables 
  const sortedData = mockData.sort((a, b) => new Date(b.date) - new Date(a.date));
  const ITEMS_PER_PAGE = 7;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = useState(sortedData);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingItem, setEditingItem] = useState(null);
  const paginatedData = data.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  //Error Alert Variables
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertErrorMessage, setAlertErrorMessage] = useState("");
  // Success Alert Variables
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [alertSuccessMessage, setalertSuccessMessage] = useState("");
  
  
  // -------------------------------------------------------------------- Functions ---------------------------------------------------------------
  
  // Format Date Function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' });
    const year = String(date.getFullYear()).slice(2);
    return `${day}-${month}-${year}`;
  };

  // Key Down Function
  useEffect(() => {
    if (editingItem) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [editingItem]);

  // Progress Color function
  const getProgressColorClass = (percentage) => {
    if (percentage === 100) return 'progress-primary';     // ✅ Full
    if (percentage >= 70) return 'progress-warning';      // 🟡 Almost there
    if (percentage >= 30) return 'progress-error';      // 🟠 Midway
    return 'progress-secondary';                       // 🔴 Low
  };

  // calculate Progress Function
  const calculateProgress = (item) => {
    if (!item) return 0;

    const fields = ['burned', 'water', 'sleep', 'read', 'intake', 'selfcare', 'mood'];
    const filled = fields.filter(key => item[key] && item[key].toString().trim() !== "0");
    const progressPercentage = Math.round((filled.length / fields.length) * 100)
    item['progress'] = progressPercentage
    return progressPercentage;
  };

  // Delection Data Function
  const handleDelete = (date) => {
    const confirmDelete = window.confirm('Are you sure you want to delete?');
    if (confirmDelete) {
      setData(data.filter(item => item.date !== date));
    }
  };

  // Handle Enter Key function
  const handleKeyDown = (e) => {
    if (editingItem && e.key === 'Enter') {
      e.preventDefault(); // Optional: prevents form submission or weird input behaviors
      handleSave();
    }
  };

  // Edit Data Function
  const handleEdit = (item) => {
    setEditingItem({ ...item });
  };

  // Save Data Function
  const handleSave = () => {
    setData(prev =>
      prev.map(item => (item.date === editingItem.date ? editingItem : item))
    );
    setEditingItem(null);
  };

  // On Change function
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingItem(prev => ({ ...prev, [name]: value }));
  };

  // Add Data Function
  const handleAdd = (newItem) => {
    const newData = [newItem, ...data];
    const sortedNewData = newData.sort((a, b) => new Date(b.date) - new Date(a.date))
    setData(sortedNewData)
    setCurrentPage(1);
    setalertSuccessMessage("Habit logged successfully");
    setShowSuccessAlert(true);
    setTimeout(() => setShowSuccessAlert(false), 4000);
  };

  const handleAddEntryClick = () => {
    const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
    const exists = data.some(entry => entry.date === today);

    if (exists) {
      setAlertErrorMessage(`Entry for ${formatDate(today)} already exists!`);
      setShowErrorAlert(true);
      setTimeout(() => setShowErrorAlert(false), 4000);
    } else {
      setIsModalOpen(true);
    }
  };

  // -------------------------------------------------------- Habit Table HTML Data -----------------------------------------------------------
  return (
    <div className="p-1">

      {/* // Alerts Messages */}
      {showErrorAlert && <ErrorAlert message={alertErrorMessage} top={20} />}
      {showSuccessAlert && <SuccessAlert message={alertSuccessMessage} top={20} />}

      {/* Heading and Add Button */}
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Habit Tracker Table Entry</h1>
        <button className="btn btn-primary" onClick={handleAddEntryClick}>+ Add Entry</button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto overflow-y-auto scroll-hidden">
        <table className="bg-base-300 table table-fixed w-full">

          {/* Headings */}
          <thead>
            <tr>
              <th className="w-[120px]">Date</th>
              <th className="w-[80px]">Burned [Kcal]</th>
              <th className="w-[80px]">Water [L]</th>
              <th className="w-[80px]">Sleep [Hrs]</th>
              <th className="w-[90px]">Read [Hrs]</th>
              <th className="w-[90px]">Intake [Kcal]</th>
              <th className="w-[100px]">Self Care</th>
              <th className="w-[100px]">Mood</th>
              <th className="w-[100px]">Progress</th>
              <th className="w-[120px] text-center">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {paginatedData.map(item => (
              editingItem?.date === item.date ? (
                <tr key={item.date}>
                  <td>
                    <div className="dropdown dropdown-bottom">
                      <div tabIndex={0} role="button" className="input input-bordered input-sm w-full max-w-[120px]">
                        {editingItem.date || "Pick a date"}
                      </div>
                      <div className="dropdown-content z-[999] bg-base-100 rounded-box shadow-sm p-2 ">
                        <calendar-date
                          class="cally"
                          onchange={(e) => {
                            handleChange({ target: { name: "date", value: e.target.value } });
                          }}
                        >
                          <svg
                            aria-label="Previous"
                            className="fill-current size-4"
                            slot="previous"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                          >
                            <path d="M15.75 19.5 8.25 12l7.5-7.5"></path>
                          </svg>
                          <svg
                            aria-label="Next"
                            className="fill-current size-4"
                            slot="next"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                          >
                            <path d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
                          </svg>
                          <calendar-month></calendar-month>
                        </calendar-date>
                      </div>
                    </div>
                  </td>
                  <td><input type="number" min="0" max="10000" onKeyDown={handleKeyDown} name="burned" className="btn btn-sm w-full max-w-[80px] hover:cursor-text" value={editingItem.burned} onChange={handleChange} /></td>
                  <td><input type="number" min="0" max="10" step="0.1" onKeyDown={handleKeyDown} name="water" className="btn btn-sm w-full max-w-[80px] hover:cursor-text" value={editingItem.water} onChange={handleChange} /></td>
                  <td><input type="number" min="0" max="10" onKeyDown={handleKeyDown} name="sleep" className="btn btn-sm w-full max-w-[80px] hover:cursor-text" value={editingItem.sleep} onChange={handleChange} /></td>
                  <td><input type="number" min="0" max="24" onKeyDown={handleKeyDown} name="read" className="btn btn-sm w-full max-w-[80px] hover:cursor-text" value={editingItem.read} onChange={handleChange} /></td>
                  <td><input type="number" min="0" max="100000" onKeyDown={handleKeyDown} name="intake" className="btn btn-sm w-full max-w-[80px] hover:cursor-text" value={editingItem.intake} onChange={handleChange} /></td>
                  <td><input type="text" pattern="^[B_]{1}[S_]{1}[F_]{1}$" title="Only B, S, F or _ in respective positions. Example: BSF, B_F, _SF" onKeyDown={handleKeyDown} name="selfcare" className="btn btn-sm w-full max-w-[80px] hover:cursor-text" value={editingItem.selfcare} onChange={handleChange} /></td>
                  <td>
                    <div className="dropdown dropdown-bottom dropdown-center">
                      <div tabIndex={0} role="button" className="btn btn-sm m-1 w-[100px] text-center">
                        {editingItem.mood || 'Select ⬇️'}
                      </div>
                      <ul
                        tabIndex={0}
                        className="dropdown-content menu bg-base-200 rounded-box z-[1] w-30 p-2 shadow-sm"
                      >
                        {['Amazing', 'Good', 'Average', 'Sad', 'Depressed', 'Productive'].map((mood) => (
                          <li key={mood}>
                            <a
                              onClick={() => handleChange({ target: { name: 'mood', value: mood } })}
                              className={editingItem.mood === mood ? 'font-bold text-primary' : ''}
                            >
                              {mood}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </td>
                  <td><progress className={`progress w-20 ${getProgressColorClass(calculateProgress(editingItem))}`} value={calculateProgress(editingItem)} max="100"></progress></td>
                  <td className="text-center w-[120px]">
                    <div className="flex justify-center gap-2">
                      <button className="btn btn-square btn-success btn-sm" onClick={handleSave}><Save /></button>
                      <button className="btn btn-square btn-warning btn-sm" onClick={() => setEditingItem(null)}><Cancel /></button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={item.date}>
                  <td className="text-sm">{formatDate(item.date)}</td>
                  <td className="text-sm truncate">{item.burned} Kcal</td>
                  <td className="text-sm truncate">{item.water} Ltr</td>
                  <td className="text-sm truncate">{item.sleep} Hrs</td>
                  <td className="text-sm truncate">{item.read} Hrs</td>
                  <td className="text-sm truncate">{item.intake} Kcal</td>
                  <td className="text-sm truncate">{item.selfcare}</td>
                  <td className="text-sm truncate">{item.mood}</td>
                  <td><progress className={`progress w-20 ${getProgressColorClass(calculateProgress(item))}`} value={calculateProgress(item)} max="100"></progress></td>
                  <td className="text-center w-[120px]">
                    <div className="flex justify-center gap-2">
                      <button className="btn btn-square btn-info btn-sm" onClick={() => handleEdit(item)}><Pencil /></button>
                      <button className="btn btn-square btn-error btn-sm" onClick={() => handleDelete(item.date)}><Trash /></button>
                    </div>
                  </td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-end gap-2">

        {/* Previous Button */}
        <button
          className="btn btn-sm"
          onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
        >
          Prev
        </button>

        <span className="flex items-center px-2">Page {currentPage} of {totalPages}</span>

        {/* Next Button */}
        <button
          className="btn btn-sm"
          onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
      <AddHabitPopUp
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAdd}
        progress={calculateProgress}
        progresscolor={getProgressColorClass}
      />
    </div>
  );
}

export default HabitTableEntry;
