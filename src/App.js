import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAVLFCVNhljA-1sRphEjsLm3z6wqDoZw3k",
  authDomain: "backend-4850d.firebaseapp.com",
  databaseURL: "https://backend-4850d-default-rtdb.firebaseio.com",
  projectId: "backend-4850d",
  storageBucket: "backend-4850d.firebasestorage.app",
  messagingSenderId: "907030796191",
  appId: "1:907030796191:web:e021b537f882e104650faa",
  measurementId: "G-CM9BTNHGRD"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

function App() {
  const [valve, setValve] = useState("WAITING");
  const [firebaseConnected, setFirebaseConnected] = useState(true);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // ✅ Team Members (now used properly)
  const teamMembers = [
    { name: "SHAIK WASEEM", pin: "23170-CM-048", leader: true },
    { name: "MULINTI GOLLA RAHUL", pin: "23022-CM-035" },
    { name: "KURUVA SHIVA", pin: "23172-CM-033" },
    { name: "ULTHI SATISH", pin: "23170-CM-052" },
    { name: "CHILLABANDA SHASHI KUMAR", pin: "23170-CM-009" },
    { name: "VADDE RAKESH", pin: "23170-CM-055" },
    { name: "BOYA CHIRANJEEVI", pin: "23170-CM-006" },
    { name: "BESTA VENKATESH", pin: "23172-CM-007" },
    { name: "V PURUSHOTHAM", pin: "23170-CM-054" },
    { name: "GANTA SANJAYKUMAR", pin: "23170-CM-018" },
    { name: "KURUBA VENKATESH", pin: "23170-CM-030" },
    { name: "SHAIK MOHAMMAD SOHAIL", pin: "23170-CM-046" }
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    const dataRef = ref(db, 'garden/');
    onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setValve(data.valve || "OFF");
        setFirebaseConnected(true);
      }
    }, (error) => {
      setFirebaseConnected(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .catch((err) => alert("Login Failed: " + err.message));
  };

  const handleLogout = () => signOut(auth);

  // Reverse logic fix
  const setValveStatus = (status) => {
    if (user) {
      set(ref(db, "garden/manual_control"), status);
    } else {
      alert("Login required");
    }
  };

  return (
    <div style={styles.container}>
      {/* HEADER WITH MENU */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h2 style={styles.title}>Waseem's Smart Irrigation</h2>
            <p style={{ fontSize: '10px', color: '#aaa', margin: '5px 0 0 0' }}>
              Smart Valve Control System
            </p>
          </div>
          {/* THREE-DOTS MENU BUTTON */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              style={styles.menuBtn}
            >
              ⋮
            </button>
            
            {/* DROPDOWN MENU */}
            {showMenu && (
              <div style={styles.dropdownMenu}>
                <button 
                  style={styles.menuItem}
                  onClick={() => {
                    setShowMembers(true);
                    setShowMenu(false);
                  }}
                >
                  👥 View Team
                </button>
                {!user && (
                  <button 
                    style={styles.menuItem}
                    onClick={() => {
                      setShowLoginModal(true);
                      setShowMenu(false);
                    }}
                  >
                    🔐 Admin Login
                  </button>
                )}
                {user && (
                  <button 
                    style={styles.menuItem}
                    onClick={() => {
                      handleLogout();
                      setShowMenu(false);
                    }}
                  >
                    🚪 Logout ({user.email})
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main style={styles.main}>
        {/* Valve Status - Always Visible */}
        <div style={styles.card}>
          <p style={styles.label}>Valve Status</p>
          <h2 style={{
            color: valve === 'OFF' ? '#2ecc71' :
                   valve === 'ON' ? '#e74c3c' : '#3498db'
          }}>
            {valve}
          </h2>
        </div>

        {/* Admin Control Panel - Only for Logged In Users */}
        {user && (
          <div style={styles.controlCard}>
            <p style={styles.label}>Control Center ({user.email})</p>

            <div style={{ marginBottom: '15px', padding: '10px', background: '#ecf0f1', borderRadius: '8px' }}>
              <p style={{ margin: '0', fontSize: '12px', color: firebaseConnected ? '#27ae60' : '#e74c3c' }}>
                {firebaseConnected ? '✓ Firebase Connected' : '✗ Firebase Disconnected'}
              </p>
            </div>

            <h3 style={{
              color: valve === 'ON' ? '#2ecc71' : '#e74c3c'
            }}>
              Valve: {valve}
            </h3>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', margin: '20px 0' }}>
              <button style={styles.onBtn} onClick={() => setValveStatus("OFF")}>ON</button>
              <button style={styles.offBtn} onClick={() => setValveStatus("ON")}>OFF</button>
              <button style={styles.autoBtn} onClick={() => setValveStatus("AUTO")}>AUTO</button>
            </div>
          </div>
        )}
      </main>

      {/* ADMIN LOGIN MODAL */}
      {showLoginModal && (
        <div style={styles.modalOverlay} onClick={() => setShowLoginModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>🔐 Admin Login</h3>
            <form onSubmit={(e) => {
              handleLogin(e);
              setShowLoginModal(false);
            }}>
              <input 
                type="email" 
                placeholder="Email" 
                style={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
              <input 
                type="password" 
                placeholder="Password" 
                style={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
              <button type="submit" style={styles.loginBtn}>
                LOGIN
              </button>
              <button 
                type="button"
                style={{...styles.loginBtn, background: '#95a5a6', marginTop: '10px'}}
                onClick={() => setShowLoginModal(false)}
              >
                CANCEL
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ✅ TEAM MEMBERS MODAL */}
      {showMembers && (
        <div style={styles.modalOverlay} onClick={() => setShowMembers(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>Team Members</h3>

            {teamMembers.map((m, i) => (
              <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid #ddd' }}>
                <strong>{m.name}</strong><br />
                <small>{m.pin} {m.leader ? "(Leader)" : ""}</small>
              </div>
            ))}

            <button style={styles.loginBtn} onClick={() => setShowMembers(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { background: '#f0f2f5', minHeight: '100vh', fontFamily: 'sans-serif' },
  header: { background: '#2f3640', padding: '25px', textAlign: 'center', color: '#fff' },
  headerContent: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '500px', margin: '0 auto' },
  title: { margin: 0 },
  menuBtn: { 
    background: 'transparent', 
    border: 'none', 
    color: '#fff', 
    fontSize: '24px', 
    cursor: 'pointer',
    padding: '5px 10px'
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: '8px',
    minWidth: '180px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 100,
    marginTop: '5px'
  },
  menuItem: {
    width: '100%',
    padding: '12px 15px',
    border: 'none',
    background: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#2f3640',
    borderBottom: '1px solid #ecf0f1'
  },
  main: { padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  card: { background: '#fff', padding: '25px', borderRadius: '15px', marginBottom: '20px', width: '90%', maxWidth: '350px', textAlign: 'center' },
  controlCard: { background: '#fff', padding: '25px', borderRadius: '15px', marginBottom: '20px', width: '90%', maxWidth: '350px', textAlign: 'center' },
  label: { fontSize: '12px', color: '#888' },
  moistureText: { fontSize: '60px', margin: '10px 0' },
  barOuter: { height: '10px', background: '#eee', borderRadius: '10px' },
  barInner: { height: '100%', background: '#3498db' },
  input: { width: '100%', padding: '10px', margin: '5px 0', boxSizing: 'border-box' },
  onBtn: { background: '#2ecc71', color: '#fff', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  offBtn: { background: '#e74c3c', color: '#fff', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  autoBtn: { background: '#3498db', color: '#fff', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  loginBtn: { background: '#2f3640', color: '#fff', padding: '10px', width: '100%', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  logoutBtn: { background: 'transparent', color: '#e74c3c', border: '1px solid #e74c3c', padding: '8px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { background: '#fff', padding: '20px', borderRadius: '10px', width: '90%', maxWidth: '350px' }
};

export default App;