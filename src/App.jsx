import { useState, useEffect } from 'react'
import { db } from './firebase'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore'
import './App.css'

const EMPTY_FORM = { ism: '', familiya: '', avtoRaqam: '', guvohnoma: '' }

function App() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [royxat, setRoyxat] = useState([])
  const [qidiruv, setQidiruv] = useState('')
  const [tahrirId, setTahrirId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'haydovchilar'), orderBy('createdAt', 'asc'))
    const unsub = onSnapshot(q, (snapshot) => {
      setRoyxat(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.ism || !form.familiya || !form.avtoRaqam || !form.guvohnoma) return

    const formData = { ...form }
    setForm(EMPTY_FORM)
    setTahrirId(null)

    if (tahrirId) {
      await updateDoc(doc(db, 'haydovchilar', tahrirId), {
        ism: formData.ism,
        familiya: formData.familiya,
        avtoRaqam: formData.avtoRaqam,
        guvohnoma: formData.guvohnoma
      })
    } else {
      await addDoc(collection(db, 'haydovchilar'), {
        ...formData,
        createdAt: serverTimestamp()
      })
    }
  }

  const handleTahrirlash = (item) => {
    setForm({ ism: item.ism, familiya: item.familiya, avtoRaqam: item.avtoRaqam, guvohnoma: item.guvohnoma })
    setTahrirId(item.id)
  }

  const handleBekor = () => {
    setForm(EMPTY_FORM)
    setTahrirId(null)
  }

  const handleOchirish = async (id) => {
    await deleteDoc(doc(db, 'haydovchilar', id))
    if (tahrirId === id) handleBekor()
  }

  const filteredRoyxat = royxat.filter(item =>
    `${item.ism} ${item.familiya} ${item.avtoRaqam} ${item.guvohnoma}`
      .toLowerCase()
      .includes(qidiruv.toLowerCase())
  )

  return (
    <div className="container">
      <h1>Haydovchilar Royxati</h1>

      <form className="form" onSubmit={handleSubmit}>
        <input name="ism" placeholder="Ism" value={form.ism} onChange={handleChange} />
        <input name="familiya" placeholder="Familiya" value={form.familiya} onChange={handleChange} />
        <input name="avtoRaqam" placeholder="Avto raqam" value={form.avtoRaqam} onChange={handleChange} />
        <input name="guvohnoma" placeholder="Haydovchi guvohnomasi" value={form.guvohnoma} onChange={handleChange} />
        <div className="form-buttons">
          <button type="submit">{tahrirId ? 'Saqlash' : 'Qoshish'}</button>
          {tahrirId && <button type="button" className="bekor" onClick={handleBekor}>Bekor qilish</button>}
        </div>
      </form>

      <input
        className="qidiruv"
        placeholder="Qidiruv..."
        value={qidiruv}
        onChange={(e) => setQidiruv(e.target.value)}
      />

      {loading ? (
        <p className="bosh">Yuklanmoqda...</p>
      ) : filteredRoyxat.length === 0 ? (
        <p className="bosh">Royxat bosh</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Ism</th>
              <th>Familiya</th>
              <th>Avto raqam</th>
              <th>Guvohnoma</th>
              <th>Amal</th>
            </tr>
          </thead>
          <tbody>
            {filteredRoyxat.map((item, index) => (
              <tr key={item.id} className={tahrirId === item.id ? 'tahrir-qator' : ''}>
                <td>{index + 1}</td>
                <td>{item.ism}</td>
                <td>{item.familiya}</td>
                <td>{item.avtoRaqam}</td>
                <td>{item.guvohnoma}</td>
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
