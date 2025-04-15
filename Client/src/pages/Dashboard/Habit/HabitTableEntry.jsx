import React, { useState } from 'react';
import Trash from '../../../utils/Icons/trash';
import Pencil from '../../../utils/Icons/Pencil';
import Save from '../../../utils/Icons/Save';
import Cancel from '../../../utils/Icons/Cancel';

const mockData = [
  { id: 1, date: '2025-04-01', days: 'Day 1', burned: '100', water: '4', sleep: '5', read: '60', intake: '1850', selfCare: 'BNF', mood: 'Productive' },
  { id: 2, date: '2025-04-02', days: 'Day 2', burned: '100', water: '4', sleep: '5', read: '60', intake: '1850', selfCare: 'BNF', mood: 'Productive' },
  { id: 3, date: '2025-04-03', days: 'Day 3', burned: '100', water: '4', sleep: '5', read: '60', intake: '1850', selfCare: 'BNF', mood: 'Productive' },
];

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('default', { month: 'short' });
  const year = String(date.getFullYear()).slice(2);
  return `${day}-${month}-${year}`;
};

const sortedData = mockData.sort((a, b) => b.id - a.id).map(item => ({
  ...item,
  date: formatDate(item.date)
}));

const ITEMS_PER_PAGE = 5;

function HabitTableEntry() {
  const [data, setData] = useState(sortedData);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingItem, setEditingItem] = useState(null);

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

  const handleEdit = (item) => {
    setEditingItem(item);
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
    const newItem = {
      id: Date.now(),
      date: formatDate(Date.now()),
      days: `Day ${nextDayNumber}`,
      burned: '',
      water: '',
      sleep: '',
      read: '',
      intake: '',
      selfCare: '',
      mood: ''
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
      <div className="overflow-x-auto">
        <table className="table table-fixed w-full">
          <thead>
            <tr>
              <th className="w-[100px]">Date</th>
              <th className="w-[80px]">Burned [Kcal]</th>
              <th className="w-[80px]">Water [L]</th>
              <th className="w-[80px]">Sleep [Hrs]</th>
              <th className="w-[90px]">Read [Pages]</th>
              <th className="w-[90px]">Intake [Kcal]</th>
              <th className="w-[100px]">Self Care</th>
              <th className="w-[80px]">Mood</th>
              <th className="w-[120px] text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map(item => (
              editingItem?.id === item.id ? (
                <tr key={item.id}>
                  <td className="whitespace-nowrap text-sm w-[100px]">{item.date}</td>
                  <td><input type="text" name="burned" className="input input-bordered input-sm w-full max-w-[80px]" value={editingItem.burned} onChange={handleChange} /></td>
                  <td><input type="text" name="water" className="input input-bordered input-sm w-full max-w-[80px]" value={editingItem.water} onChange={handleChange} /></td>
                  <td><input type="text" name="sleep" className="input input-bordered input-sm w-full max-w-[80px]" value={editingItem.sleep} onChange={handleChange} /></td>
                  <td><input type="text" name="read" className="input input-bordered input-sm w-full max-w-[90px]" value={editingItem.read} onChange={handleChange} /></td>
                  <td><input type="text" name="intake" className="input input-bordered input-sm w-full max-w-[90px]" value={editingItem.intake} onChange={handleChange} /></td>
                  <td><input type="text" name="selfCare" className="input input-bordered input-sm w-full max-w-[100px]" value={editingItem.selfCare} onChange={handleChange} /></td>
                  <td>
                    <select
                      name="mood"
                      value={editingItem.mood}
                      onChange={handleChange}
                      className="select select-sm w-[110px] text-center "
                    >
                      <option className="text-center" value="">--</option>
                      <option className="text-center" value="Amazing">Amazing</option>
                      <option className="text-center" value="Good">Good</option>
                      <option className="text-center" value="Average">Average</option>
                      <option className="text-center" value="Sad">Sad</option>
                      <option className="text-center" value="Depressed">Depressed</option>
                      <option className="text-center" value="Productive">Productive</option>
                    </select>
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
                  <td className="whitespace-nowrap text-sm w-[100px]">{item.date}</td>
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
