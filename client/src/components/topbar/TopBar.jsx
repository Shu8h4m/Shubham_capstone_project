import "./topbar.css";
import IconButton from '@mui/material/IconButton';
import { Search, Person, Chat, Notifications, Logout } from '@mui/icons-material';
import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../../utils/axiosInstance";

const TopBar = () => {
  const { user, dispatch } = useContext(AuthContext);
  const PF = import.meta.env.VITE_PUBLIC_FOLDER;
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const handleLogout = async () => {
    dispatch({ type: "LOGOUT" });
    try {
      await axiosInstance.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    }
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleSearchInputChange = async (event) => {
    const query = event.target.value;
    setSearchQuery(query);

    if (query.trim()) {
      try {
        const response = await axiosInstance.get("/users/search", {
          params: { q: query },
        });
        setSearchResults(response.data);
      } catch (error) {
        console.error("Search error:", error);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchResultClick = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <div className="topbarContainer">
      <div className="topbarLeft">
        <Link to="/" style={{ textDecoration: "none" }}>
          <span className="logo">BHOYAR_SOCIAL</span>
        </Link>
      </div>
      <div className="topbarCenter">
        <div className="searchbar">
          <Search className="searchIcon" />
          <input
            type="text"
            placeholder="Search for friend, post or video"
            className="searchInput"
            value={searchQuery}
            onChange={handleSearchInputChange}
          />
        </div>
        {searchResults.length > 0 && (
          <div className="searchbarResult">
            <ul>
              {searchResults.map((user) => (
                <li key={user._id}>
                  <Link 
                    to={`/profile/${user.username}`} 
                    className="searchResultItem"
                    onClick={handleSearchResultClick}
                  >
                    {user.username}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="topbarRight">
        <div className="topbarLinks">
          <Link to="/" style={{ textDecoration: "none", color: "white" }}>
            <span className="topbarLink">Homepage</span>
          </Link>
        </div>
        <div className="topbarIcons">
          <div className="topbarIconItem">
            <Person />
            <span className="topbarIconBadge">1</span>
          </div>
          <div className="topbarIconItem">
            <Chat />
            <span className="topbarIconBadge">2</span>
          </div>
          <div className="topbarIconItem">
            <Notifications />
            <span className="topbarIconBadge">1</span>
          </div>
        </div>
        <Link to={`/profile/${user.username}`}>
          <img src={user.profilePicture ? PF + user.profilePicture : PF + "person/noAvatar.png"} alt="" className="topbarImg" />
        </Link>
        <IconButton title="LOGOUT" onClick={handleLogout}>
          <Logout style={{ color: "white" }} />
        </IconButton>
      </div>
    </div>
  );
};

export default TopBar;
