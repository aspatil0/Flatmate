import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Landing(){
  const nav = useNavigate()

  return (
    <div className="landing-root">
      <div className="landing-hero">
        <div className="hero-inner animate-hero">
          <h1>Find Your Perfect Flatmate</h1>
          <p className="subtitle">Trusted community — 4000+ active users daily</p>
          
          <div className="search-container">
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search for locality, roommate, or building..." 
              readOnly
            />
            <button className="search-button" onClick={() => nav('/login')}>
              Search
            </button>
          </div>

          <div style={{marginTop: 30, display: 'flex', justifyContent: 'center', gap: 15, zIndex: 10, position: 'relative'}}>
            <button className="btn" onClick={()=>nav('/register')}>Sign up now</button>
            <button className="outline" onClick={()=>nav('/login')}>Member Login</button>
          </div>

          <div className="badge-no-broker">
            ? No Brokerage • 100% Genuine
          </div>
        </div>
      </div>

      <section className="features-section container">
        <h2 className="section-title">Everything you need, all in one place</h2>
        <div className="grid">
          <div className="card animate-hero delay-1">
            <div style={{fontSize: 32, marginBottom: 15}}>??</div>
            <h3>Verified Profiles</h3>
            <p className="muted">Each user profile is created with a unique ID to ensure safety and trust in the community.</p>
          </div>
          <div className="card animate-hero delay-1">
            <div style={{fontSize: 32, marginBottom: 15}}>??</div>
            <h3>Direct Messenger</h3>
            <p className="muted">Found a match? Use our built-in messenger to chat and finalize the deal instantly.</p>
          </div>
          <div className="card animate-hero delay-2">
            <div style={{fontSize: 32, marginBottom: 15}}>??</div>
            <h3>Instant Booking</h3>
            <p className="muted">As soon as the deal is done, the poster marks it as booked and the listing closes automatically.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
