import Share from "../share/Share"
import "./feed.css"
import Post from "../post/Post.jsx"
import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../../context/AuthContext.jsx";
import {axiosInstance} from "../../utils/axiosInstance.jsx"




export default function Feed({ username }) {
  const [posts, setPosts] = useState([]);
  const {user} = useContext(AuthContext)
  useEffect(() =>{

    const fetchPosts = async () =>{
      const res = username ? await axiosInstance.get("/posts/profile/" + username) : await axiosInstance.get("posts/timeline/"+ user._id);
      setPosts(res.data.sort((p1,p2) =>{
        return new Date(p2.createdAt) - new Date(p1.createdAt);
      }))
    }
   fetchPosts();
  },[username,user._id])


  return (
    <div className="feed">
      <div className="feedWrapper">
        {(!username || username === user.username) && <Share/>}
        {posts.map((p) => (
          <Post key={p._id} post = {p}/>
        ))} 
       
        
      </div>
    </div>
  )
}
