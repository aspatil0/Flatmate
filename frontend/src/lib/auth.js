const USERS_KEY = 'flatmate_users'
const CURR_KEY = 'flatmate_current'

function readUsers(){
  try{ return JSON.parse(localStorage.getItem(USERS_KEY) || '[]') }catch(e){return[]}
}

export function saveUser(user){
  const users = readUsers()
  users.push(user)
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function findUserByEmail(email){
  return readUsers().find(u=>u.email===email)
}

export function setCurrentUser(user){
  localStorage.setItem(CURR_KEY, JSON.stringify(user))
}

export function getCurrentUser(){
  try{ return JSON.parse(localStorage.getItem(CURR_KEY) || 'null') }catch(e){return null}
}

export function logout(){
  localStorage.removeItem(CURR_KEY)
}

export function makeUser({name,email,password}){
  return { id: 'u_'+Date.now()+Math.floor(Math.random()*9999), name, email, password }
}
