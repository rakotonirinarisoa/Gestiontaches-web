import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = "https://localhost:7286/api/Tasks";

const CREATED_BY_USER_ID = 1;
const CHANGED_BY_USER_ID = 1;

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [message, setMessage] = useState("");

  // Mapping int -> string (labels de statut)
  const StatusLabels = {
    0: "ToDo",
    1: "InProgress",
    2: "Done",
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    console.log("Tâches reçues:", tasks);
  }, [tasks]);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(API_BASE_URL);
      setTasks(res.data);
    } catch (err) {
      setMessage("Erreur lors du chargement des tâches.");
    }
  };

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

  // Avancer le statut en mode entier
  const advanceStatus = async (task) => {
    let newStatus = null;
    if (task.status === 0) newStatus = 1; // ToDo -> InProgress
    else if (task.status === 1) newStatus = 2; // InProgress -> Done

    if (newStatus === null) return;

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

  // Regrouper les tâches par status numérique
  const groupedTasks = {
    ToDo: [],
    InProgress: [],
    Done: [],
    Unknown: [],
  };

  tasks.forEach(task => {
    switch (task.status) {
      case 0:
        groupedTasks.ToDo.push(task);
        break;
      case 1:
        groupedTasks.InProgress.push(task);
        break;
      case 2:
        groupedTasks.Done.push(task);
        break;
      default:
        groupedTasks.Unknown.push(task);
    }
  });

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
        {["ToDo", "InProgress", "Done", "Unknown"].map(status => (
          <div key={status} style={{ flex: 1 }}>
            <h3>{status}</h3>
            {groupedTasks[status].length === 0 && <p>Aucune tâche</p>}
            {groupedTasks[status].map(task => (
              <div
                key={task.id}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "10px",
                  marginBottom: "10px",
                  background: "#f9f9f9",
                }}
              >
                <div>
                  <strong>{task.title}</strong>
                </div>
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
