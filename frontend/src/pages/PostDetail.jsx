import React, {useState, useEffect, useRef} from 'react'
import { useParams } from 'react-router-dom'
import { getPost, allPosts, updatePost, allMessagesForPost, addMessage } from '../lib/db'
import { getCurrentUser } from '../lib/auth'

export default function PostDetail(){
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const me = getCurrentUser()
  const boxRef = useRef()

  useEffect(()=>{
    setPost(getPost(id))
    setMessages(allMessagesForPost(id))
  },[id])

  useEffect(()=>{ if(boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight },[messages])

  function send(){
    if(!text.trim()) return
    const m = { id:'m_'+Date.now(), postId:id, senderId:me.id, text: text.trim(), createdAt: Date.now() }
    addMessage(m)
    setMessages(prev=>[...prev,m])
    setText('')
  }

  function approve(){
    if(!post) return
    const updated = {...post, status:'booked'}
    updatePost(updated)
    setPost(updated)
    alert('Marked as booked')
  }

  if(!post) return <div className="card">Post not found</div>

  const isPoster = me.id === post.posterId

  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 360px',gap:16}}>
      <div className="card">
        <h2>{post.title} {post.status==='booked' && <span className="muted">(Booked)</span>}</h2>
        <div className="muted">{post.address} • ${post.price}</div>
        <p style={{marginTop:12}}>{post.description}</p>
        <div style={{marginTop:18}}>
          {isPoster ? (
            <button className="btn" onClick={approve} disabled={post.status==='booked'}>{post.status==='booked'?'Booked':'Mark as booked'}</button>
          ) : (
            <div className="muted">Contact the poster using the chat on the right</div>
          )}
        </div>
      </div>

      <aside className="card">
        <h3>Chat</h3>
        <div className="chat" ref={boxRef}>
          {messages.map(m=> (
            <div key={m.id} className={`message ${m.senderId===me.id? 'me':'them'}`}>{m.text}</div>
          ))}
        </div>
        <div style={{display:'flex',gap:8,marginTop:12}}>
          <input className="input" value={text} onChange={e=>setText(e.target.value)} placeholder="Write a message" />
          <button className="btn" onClick={send}>Send</button>
        </div>
      </aside>
    </div>
  )
}
