import React, {useState} from 'react'
import { useNavigate } from 'react-router-dom'
import { createPost } from '../lib/db'
import { getCurrentUser } from '../lib/auth'

export default function CreatePost(){
  const nav = useNavigate()
  const me = getCurrentUser()
  const [title,setTitle]=useState('')
  const [address,setAddress]=useState('')
  const [price,setPrice]=useState('')
  const [description,setDescription]=useState('')

  function submit(e){
    e.preventDefault()
    const p = { id:'p_'+Date.now(), title, address, price, description, posterId: me.id, status:'open', createdAt:Date.now() }
    createPost(p)
    nav('/')
  }

  return (
    <div className="card" style={{maxWidth:720}}>
      <h2>Create Listing</h2>
      <form onSubmit={submit}>
        <div className="form-row"><label>Title</label><input className="input" value={title} onChange={e=>setTitle(e.target.value)} required/></div>
        <div className="form-row"><label>Address</label><input className="input" value={address} onChange={e=>setAddress(e.target.value)} required/></div>
        <div className="form-row"><label>Price</label><input className="input" value={price} onChange={e=>setPrice(e.target.value)} required/></div>
        <div className="form-row"><label>Description</label><textarea className="input" value={description} onChange={e=>setDescription(e.target.value)} rows={6} required/></div>
        <div style={{display:'flex',gap:8}}>
          <button className="btn" type="submit">Publish</button>
        </div>
      </form>
    </div>
  )
}
