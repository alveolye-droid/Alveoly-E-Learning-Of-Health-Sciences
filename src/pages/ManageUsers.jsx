import React, { useState, useEffect } from "react";
import { MdDelete, MdEdit } from "react-icons/md";
import axios from "axios";
import "./ManageUsers.css";

/* =============================
   🔹 API BASE (SINGLE SOURCE)
============================= */
const API_BASE_URL =
  import.meta.env.VITE_APP_API_BASE_URL || "http://localhost:5000/api";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "student",
    isActive: true,
    isApproved: true,
  });

  /* =============================
     🔐 AUTH HEADER
  ============================= */
  const token = localStorage.getItem("authToken");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  /* =============================
     FETCH USERS
  ============================= */
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/auth/admin/users`,
        { headers }
      );
      setUsers(data.users || []);
    } catch (err) {
      console.error("❌ Failed to fetch users:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* =============================
     DELETE USER
  ============================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await axios.delete(
        `${API_BASE_URL}/auth/admin/users/${id}`,
        { headers }
      );
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error("❌ Delete failed:", err.response?.data || err);
    }
  };

  /* =============================
     EDIT USER
  ============================= */
  const handleEdit = (user) => {
    setEditingUser(user._id);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      isApproved: user.isApproved,
    });
  };

  const handleCancel = () => setEditingUser(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /* =============================
     UPDATE USER
  ============================= */
  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.put(
        `${API_BASE_URL}/auth/admin/users/${editingUser}`,
        formData,
        { headers }
      );

      setUsers((prev) =>
        prev.map((u) => (u._id === editingUser ? data.user : u))
      );
      setEditingUser(null);
    } catch (err) {
      console.error("❌ Update failed:", err.response?.data || err);
    }
  };

  return (
    <div className="manage-users-container">
      <h2>Manage Users</h2>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Active</th>
              <th>Approved</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan="6">No users found.</td>
              </tr>
            )}

            {users.map((user) => (
              <tr key={user._id}>
                {editingUser === user._id ? (
                  <>
                    <td>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </td>

                    <td>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </td>

                    <td>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                      >
                        <option value="admin">Admin</option>
                        <option value="lecturer">Lecturer</option>
                        <option value="student">Student</option>
                      </select>
                    </td>

                    <td>
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                      />
                    </td>

                    <td>
                      <input
                        type="checkbox"
                        name="isApproved"
                        checked={formData.isApproved}
                        onChange={handleChange}
                      />
                    </td>

                    <td className="action-buttons">
                      <button className="save-btn" onClick={handleUpdate}>
                        Save
                      </button>
                      <button className="cancel-btn" onClick={handleCancel}>
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.isActive ? "✅" : "❌"}</td>
                    <td>{user.isApproved ? "✅" : "❌"}</td>
                    <td className="action-buttons">
                      <MdEdit
                        className="edit-icon"
                        onClick={() => handleEdit(user)}
                      />
                      <MdDelete
                        className="delete-icon"
                        onClick={() => handleDelete(user._id)}
                      />
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManageUsers;
