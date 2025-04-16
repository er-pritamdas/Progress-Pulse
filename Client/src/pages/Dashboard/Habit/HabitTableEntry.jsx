import React, { useState, useEffect } from 'react';
import Trash from '../../../utils/Icons/trash';
import Pencil from '../../../utils/Icons/Pencil';
import Save from '../../../utils/Icons/Save';
import Cancel from '../../../utils/Icons/Cancel';




const mockData = [
  { id: 1, date: '2025-04-01', days: 'Day 1', burned: '100', water: '4', sleep: '5', read: '60', intake: '1850', selfCare: 'BNF', mood: 'Productive' },
  { id: 2, date: '2025-04-02', days: 'Day 2', burned: '100', water: '4', sleep: '5', read: '60', intake: '1850', selfCare: 'BNF', mood: 'Productive' },
  { id: 3, date: '2025-04-03', days: 'Day 3', burned: '100', water: '4', sleep: '5', read: '60', intake: '1850', selfCare: 'BNF', mood: 'Productive' },
  { id: 4, date: '2025-04-03', days: 'Day 3', burned: '100', water: '4', sleep: '5', read: '60', intake: '1850', selfCare: 'BNF', mood: 'Productive' },
  { id: 5, date: '2025-04-03', days: 'Day 3', burned: '100', water: '4', sleep: '5', read: '60', intake: '1850', selfCare: 'BNF', mood: 'Productive' },
  { id: 6, date: '2025-04-03', days: 'Day 3', burned: '100', water: '4', sleep: '5', read: '60', intake: '1850', selfCare: 'BNF', mood: 'Productive' },
  { id: 7, date: '2025-04-03', days: 'Day 3', burned: '100', water: '4', sleep: '5', read: '60', intake: '1850', selfCare: 'BNF', mood: 'Productive' },
];

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('default', { month: 'short' });
  const year = String(date.getFullYear()).slice(2);
  return `${day}-${month}-${year}`;
};

const sortedData = mockData.sort((a, b) => b.id - a.id);

const ITEMS_PER_PAGE = 7;

function HabitTableEntry() {
  const [data, setData] = useState(sortedData);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    if (editingItem) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [editingItem]);


  const paginatedData = data.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

  const handleDelete = (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete?');
    if (confirmDelete) {
      setData(data.filter(item => item.id !== id));
    }
  };

  const handleKeyDown = (e) => {
    if (editingItem && e.key === 'Enter') {
      e.preventDefault(); // Optional: prevents form submission or weird input behaviors
      handleSave();
    }
  };

  const handleEdit = (item) => {
    setEditingItem({ ...item });
  };

  const handleSave = () => {
    setData(prev =>
      prev.map(item => (item.id === editingItem.id ? editingItem : item))
    );
    setEditingItem(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingItem(prev => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    const nextDayNumber = data.length + 1;
    const today = new Date().toISOString().split('T')[0];
    const newItem = {
      id: Date.now(),
      date: today,
      days: `Day ${nextDayNumber}`,
      burned: '300',
      water: '3',
      sleep: '7',
      read: '120',
      intake: '1500',
      selfCare: 'BNF',
      mood: 'Good'
    };
    setData([newItem, ...data]);
    setCurrentPage(1);
  };

  return (
    <div className="p-1">
      {/* Heading and Add Button */}
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Habit Tracker Table Entry</h1>
        <button className="btn btn-primary" onClick={handleAdd}>+ Add Entry</button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto overflow-y-auto scroll-hidden">
        <table className="table table-fixed w-full">
          <thead>
            <tr>
              <th className="w-[120px]">Date</th>
              <th className="w-[80px]">Burned [Kcal]</th>
              <th className="w-[80px]">Water [L]</th>
              <th className="w-[80px]">Sleep [Hrs]</th>
              <th className="w-[90px]">Read [Pages]</th>
              <th className="w-[90px]">Intake [Kcal]</th>
              <th className="w-[100px]">Self Care</th>
              <th className="w-[100px]">Mood</th>
              <th className="w-[120px] text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map(item => (
              editingItem?.id === item.id ? (
                <tr key={item.id}>
                  <td>
                    <div className="dropdown dropdown-bottom">
                      <div tabIndex={0} role="button" className="input input-bordered input-sm w-full max-w-[120px]">
                        {editingItem.date || "Pick a date"}
                      </div>
                      <div className="dropdown-content z-[999] bg-base-300 rounded-box shadow-sm p-2 ">
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


                  <td><input onKeyDown={handleKeyDown} type="text" name="burned" className="btn btn-sm w-full max-w-[80px] hover:cursor-text" value={editingItem.burned} onChange={handleChange} /></td>
                  <td><input onKeyDown={handleKeyDown} type="text" name="water" className="btn btn-sm w-full max-w-[80px] hover:cursor-text" value={editingItem.water} onChange={handleChange} /></td>
                  <td><input onKeyDown={handleKeyDown} type="text" name="sleep" className="btn btn-sm w-full max-w-[80px] hover:cursor-text" value={editingItem.sleep} onChange={handleChange} /></td>
                  <td><input onKeyDown={handleKeyDown} type="text" name="read" className="btn btn-sm w-full max-w-[80px] hover:cursor-text" value={editingItem.read} onChange={handleChange} /></td>
                  <td><input onKeyDown={handleKeyDown} type="text" name="intake" className="btn btn-sm w-full max-w-[80px] hover:cursor-text" value={editingItem.intake} onChange={handleChange} /></td>
                  <td><input onKeyDown={handleKeyDown} type="text" name="selfCare" className="btn btn-sm w-full max-w-[80px] hover:cursor-text" value={editingItem.selfCare} onChange={handleChange} /></td>
                  <td>
                    <div className="dropdown dropdown-bottom dropdown-center">
                      <div tabIndex={0} role="button" className="btn btn-sm m-1 w-[100px] text-center">
                        {editingItem.mood || 'Select ⬇️'}
                      </div>
                      <ul
                        tabIndex={0}
                        className="dropdown-content menu bg-base-300 rounded-box z-[1] w-30 p-2 shadow-sm"
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

                  <td className="text-center w-[120px]">
                    <div className="flex justify-center gap-2">
                      <button className="btn btn-success btn-sm" onClick={handleSave}><Save /></button>
                      <button className="btn btn-warning btn-sm" onClick={() => setEditingItem(null)}><Cancel /></button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={item.id}>
                  <td className="text-sm">{formatDate(item.date)}</td>
                  <td className="text-sm truncate">{item.burned}</td>
                  <td className="text-sm truncate">{item.water}</td>
                  <td className="text-sm truncate">{item.sleep}</td>
                  <td className="text-sm truncate">{item.read}</td>
                  <td className="text-sm truncate">{item.intake}</td>
                  <td className="text-sm truncate">{item.selfCare}</td>
                  <td className="text-sm truncate">{item.mood}</td>
                  <td className="text-center w-[120px]">
                    <div className="flex justify-center gap-2">
                      <button className="btn btn-info btn-sm" onClick={() => handleEdit(item)}><Pencil /></button>
                      <button className="btn btn-error btn-sm" onClick={() => handleDelete(item.id)}><Trash /></button>
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
        <button
          className="btn btn-sm"
          onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        <span className="flex items-center px-2">Page {currentPage} of {totalPages}</span>
        <button
          className="btn btn-sm"
          onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default HabitTableEntry;
