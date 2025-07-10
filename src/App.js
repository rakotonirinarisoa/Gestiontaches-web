import React, { useEffect, useState } from "react";
import axios from "axios";

//const API_BASE_URL = "http://localhost:5000/api/tasks"; // ⚠️ adapte si besoin
const API_BASE_URL = "https://localhost:7286/api/Tasks";

const CREATED_BY_USER_ID = 1;
const CHANGED_BY_USER_ID = 1;

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [message, setMessage] = useState("");

  // Charger les tâches à l'ouverture
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(API_BASE_URL);
      setTasks(res.data);
    } catch (err) {
      setMessage("Erreur lors du chargement des tâches.");
    }
  };

  // Créer une tâche
  const createTask = async () => {
    if (!newTitle.trim()) return;

    try {
      const res = await axios.post(API_BASE_URL, {
        title: newTitle,
        description: null,
        assignedToUserId: null,
        createdByUserId: CREATED_BY_USER_ID,
      });

      setTasks([...tasks, res.data]);
      setNewTitle("");
      setMessage("Tâche créée !");
    } catch (err) {
      setMessage("Erreur lors de la création de la tâche.");
    }
  };

  // Avancer le statut
  const advanceStatus = async (task) => {
    let newStatus = null;
    if (task.status === "ToDo") newStatus = "InProgress";
    else if (task.status === "InProgress") newStatus = "Done";

    if (!newStatus) return;

    try {
      await axios.put(`${API_BASE_URL}/${task.id}/status`, {
        newStatus,
        changedByUserId: CHANGED_BY_USER_ID,
      });

      const updatedTasks = tasks.map(t =>
        t.id === task.id ? { ...t, status: newStatus } : t
      );

      setTasks(updatedTasks);
      setMessage("Statut mis à jour !");
    } catch (err) {
      setMessage("Erreur lors du changement de statut.");
    }
  };

  // Regrouper les tâches par statut
  const groupedTasks = {
    ToDo: tasks.filter(t => t.status === "ToDo"),
    InProgress: tasks.filter(t => t.status === "InProgress"),
    Done: tasks.filter(t => t.status === "Done"),
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Tableau de Tâches</h1>

      {message && <p style={{ color: "green" }}>{message}</p>}

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Titre de la tâche"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button onClick={createTask} style={{ marginLeft: "10px" }}>
          Ajouter
        </button>
      </div>

      <div style={{ display: "flex", gap: "20px" }}>
        {["ToDo", "InProgress", "Done"].map(status => (
          <div key={status} style={{ flex: 1 }}>
            <h3>{status}</h3>
            {groupedTasks[status].map(task => (
              <div key={task.id} style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "10px",
                marginBottom: "10px",
                background: "#f9f9f9"
              }}>
                <div><strong>{task.title}</strong></div>
                {(status === "ToDo" || status === "InProgress") && (
                  <button
                    onClick={() => advanceStatus(task)}
                    style={{ marginTop: "8px" }}
                  >
                    {status === "ToDo" ? "Start" : "Complete"}
                  </button>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

