import React, { useState } from 'react';
import ActiveLastBreadcrumb from '../../../components/Dashboard/ActiveLastBreadcrumb';

const mockData = [
  { id: 1, name: 'Read 10 pages', status: 'Pending' },
  { id: 2, name: 'Workout', status: 'Done' },
  { id: 3, name: 'Meditate', status: 'In Progress' },
];

const ITEMS_PER_PAGE = 5;

function HabitTableEntry() {
  const [data, setData] = useState(mockData);
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
    const newItem = {
      id: Date.now(),
      name: 'New Habit',
      status: 'Pending'
    };
    setData([newItem, ...data]);
    setCurrentPage(1);
  };

  return (
    <>
      <div className="p-4">
        
        {/* Heading and add Button */}
        <div className="flex justify-between mb-4">
          <h1 className="text-2xl font-bold">Habit Tracker Table Entry</h1>
          <button className="btn btn-primary" onClick={handleAdd}>+ Add Habit</button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">

            {/* Table Header */}
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {paginatedData.map(item => (
                editingItem?.id === item.id ? (
                  <tr key={item.id}>
                    <td>
                      <input
                        type="text"
                        name="name"
                        className="input input-bordered w-full"
                        value={editingItem.name}
                        onChange={handleChange}
                      />
                    </td>
                    <td>
                      <select
                        name="status"
                        className="select select-bordered w-full"
                        value={editingItem.status}
                        onChange={handleChange}
                      >
                        <option>Pending</option>
                        <option>In Progress</option>
                        <option>Done</option>
                      </select>
                    </td>
                    <td className="text-right">
                      <button className="btn btn-success btn-sm mr-2" onClick={handleSave}>Save</button>
                      <button className="btn btn-warning btn-sm" onClick={() => setEditingItem(null)}>Cancel</button>
                    </td>
                  </tr>
                ) : (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.status}</td>
                    <td className="text-right">
                      <button className="btn btn-sm btn-info mr-2" onClick={() => handleEdit(item)}>Edit</button>
                      <button className="btn btn-sm btn-error" onClick={() => handleDelete(item.id)}>Delete</button>
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
    </>
  );
}

export default HabitTableEntry;
