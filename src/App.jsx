import { useState, useEffect } from 'react'
import { db } from './firebase'
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, onSnapshot, serverTimestamp, query, orderBy
} from 'firebase/firestore'
import './App.css'

const CORRECT_PASSWORD = import.meta.env.VITE_APP_PASSWORD
const EMPTY_FORM = { ism: '', familiya: '', jshir: '', avtoRaqam: '', texPasport: '' }

function Login({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (password === CORRECT_PASSWORD) {
      sessionStorage.setItem('auth', 'true')
      onLogin()
    } else {
      setError('Parol noto\'g\'ri')
      setPassword('')
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <h2>Haydovchilar</h2>
        <p className="subtitle">Tizimga kirish uchun parolni kiriting</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="login-field">
            <label>Parol</label>
            <input
              type="password"
              placeholder="••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
            />
          </div>
          {error && <p className="xato">{error}</p>}
          <button type="submit" className="login-btn">Kirish</button>
        </form>
      </div>
    </div>
  )
}

function App() {
  const [loggedIn, setLoggedIn] = useState(() => sessionStorage.getItem('auth') === 'true')
  const [form, setForm] = useState(EMPTY_FORM)
  const [royxat, setRoyxat] = useState([])
  const [qidiruv, setQidiruv] = useState('')
  const [tahrirId, setTahrirId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!loggedIn) return
    const q = query(collection(db, 'haydovchilar'), orderBy('createdAt', 'asc'))
    const unsub = onSnapshot(q, (snapshot) => {
      setRoyxat(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return () => unsub()
  }, [loggedIn])

  if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)} />

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.ism || !form.familiya || !form.jshir || !form.avtoRaqam || !form.texPasport) return
    const formData = { ...form }
    setForm(EMPTY_FORM)
    setTahrirId(null)
    if (tahrirId) {
      await updateDoc(doc(db, 'haydovchilar', tahrirId), formData)
    } else {
      await addDoc(collection(db, 'haydovchilar'), { ...formData, createdAt: serverTimestamp() })
    }
  }

  const handleTahrirlash = (item) => {
    setForm({ ism: item.ism, familiya: item.familiya, jshir: item.jshir, avtoRaqam: item.avtoRaqam, texPasport: item.texPasport })
    setTahrirId(item.id)
  }

  const handleBekor = () => { setForm(EMPTY_FORM); setTahrirId(null) }

  const handleOchirish = async (id) => {
    await deleteDoc(doc(db, 'haydovchilar', id))
    if (tahrirId === id) handleBekor()
  }

  const handleChiqish = () => {
    sessionStorage.removeItem('auth')
    setLoggedIn(false)
  }

  const filteredRoyxat = royxat.filter(item =>
    `${item.ism} ${item.familiya} ${item.jshir} ${item.avtoRaqam} ${item.texPasport}`
      .toLowerCase().includes(qidiruv.toLowerCase())
  )

  return (
    <div className="container">
      <div className="header-row">
        <h1>Haydovchilar Royxati</h1>
        <button className="chiqish" onClick={handleChiqish}>Chiqish</button>
      </div>

      <form className="form" onSubmit={handleSubmit}>
        <input name="ism" placeholder="Haydovchi ismi" value={form.ism} onChange={handleChange} />
        <input name="familiya" placeholder="Haydovchi familiyasi" value={form.familiya} onChange={handleChange} />
        <input name="jshir" placeholder="Haydovchi JSHIR" value={form.jshir} onChange={handleChange} maxLength={14} />
        <input name="avtoRaqam" placeholder="Avto raqami" value={form.avtoRaqam} onChange={handleChange} />
        <input name="texPasport" placeholder="Tex pasport raqami" value={form.texPasport} onChange={handleChange} />
        <div className="form-buttons">
          <button type="submit">{tahrirId ? 'Saqlash' : 'Qoshish'}</button>
          {tahrirId && <button type="button" className="bekor" onClick={handleBekor}>Bekor qilish</button>}
        </div>
      </form>

      <input className="qidiruv" placeholder="Qidiruv..." value={qidiruv} onChange={(e) => setQidiruv(e.target.value)} />

      {loading ? (
        <p className="bosh">Yuklanmoqda...</p>
      ) : filteredRoyxat.length === 0 ? (
        <p className="bosh">Royxat bosh</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>#</th><th>Ism</th><th>Familiya</th><th>JSHIR</th><th>Avto raqam</th><th>Tex pasport</th><th>Amal</th>
            </tr>
          </thead>
          <tbody>
            {filteredRoyxat.map((item, index) => (
              <tr key={item.id} className={tahrirId === item.id ? 'tahrir-qator' : ''}>
                <td data-label="#">{index + 1}</td>
                <td data-label="Ism">{item.ism}</td>
                <td data-label="Familiya">{item.familiya}</td>
                <td data-label="JSHIR">{item.jshir}</td>
                <td data-label="Avto raqam">{item.avtoRaqam}</td>
                <td data-label="Tex pasport">{item.texPasport}</td>
                <td className="amallar">
                  <button className="tahrirlash" onClick={() => handleTahrirlash(item)}>Tahrirlash</button>
                  <button className="ochirish" onClick={() => handleOchirish(item.id)}>Ochirish</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default App
