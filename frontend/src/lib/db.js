const POSTS_KEY = 'flatmate_posts'
const MSGS_KEY = 'flatmate_messages'

function read(key){
  try{ return JSON.parse(localStorage.getItem(key) || '[]') }catch(e){return[]}
}

function write(key,val){ localStorage.setItem(key, JSON.stringify(val)) }

export function allPosts(){ return read(POSTS_KEY) }

export function getPost(id){ return allPosts().find(p=>p.id===id) }

export function createPost(post){
  const posts = allPosts()
  posts.unshift(post)
  write(POSTS_KEY, posts)
}

export function updatePost(updated){
  const posts = allPosts().map(p=>p.id===updated.id?updated:p)
  write(POSTS_KEY, posts)
}

export function allMessagesForPost(postId){
  const msgs = read(MSGS_KEY)
  return msgs.filter(m=>m.postId===postId)
}

export function addMessage(msg){
  const msgs = read(MSGS_KEY)
  msgs.push(msg)
  write(MSGS_KEY, msgs)
}
