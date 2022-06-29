import React, {useState, useEffect} from "react";
import { useNavigate, Link } from "react-router-dom";
import {getAuth, updateProfile} from "firebase/auth"
import {updateDoc,doc, collection, getDocs, query, where, orderBy,deleteDoc} from "firebase/firestore";
import { db } from "../firebase.config";
import { toast } from "react-toastify";
import arrowRight from "../assets/svg/keyboardArrowRightIcon.svg"
import homeIcon from "../assets/svg/homeIcon.svg"
import Spinner from "../components/Spinner";
import ListingItems from "../components/ListingItems";

const Profile = () => {
  const auth = getAuth()
  const [loading, setLoading] = useState(true)
  const [listings, setListings] = useState(null)
  const [changeDetails,setChangeDetails] = useState(false)
  const navigate = useNavigate()
  const [formData,setFormData] = useState({
    name : auth.currentUser.displayName,
    email : auth.currentUser.email
  })

  const {name,email} = formData

  useEffect(() => {
    const fetchUserListings = async () =>{
      const listingsRef = collection(db,'listing')

      const q = query(listingsRef,where('userRef', '==', auth.currentUser.uid, orderBy('timestamp', 'desc')))

      const querySnap = await getDocs(q)

      let listings = []

      querySnap.forEach((doc) => {
        return listings.push({
          id : doc.id,
          data : doc.data()
        })
      })

      setListings(listings)
      setLoading(false)

    }


    fetchUserListings()
  },[auth.currentUser.uid])

  const onDelete = async (listingId) =>{
    if(window.confirm("Are you sure you want to delete")) {
      await deleteDoc(doc(db,'listing',listingId))

      const updatedList = listings.filter((listing) => 
        listing.id !== listingId)

      setListings(updatedList)
      toast.success("Successfully deleted listing")
    }
  }

  const onLogout = () =>{
    auth.signOut()
    navigate('/')
  }

  const onSubmit = async () =>{
    try{
      if(auth.currentUser.displayName !== name){
        //Update display name ini firebase
        await updateProfile(auth.currentUser, {
          displayName : name
        })

        //update in firestore

        const userRef = doc(db,'users',auth.currentUser.uid)
        await updateDoc(userRef,{
          name
        })
      } 
    }catch(error){
      toast.error('Could not update details')
    }
  }

  const onChange = (e) =>{
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id] : e.target.value
    }))
  }

  const onEdit = (listingId) => navigate(`/edit-listing/${listingId}`)


  if(loading){
    return <Spinner />
  }
  
  return <div className="profile">
    <header className="profileHeader">
      <p className="pageHeader">My Profile</p>
      <button type="button" className="logOut" onClick={onLogout}>Logout</button>
    </header>


    <main>
      <div className="profileDetails">
        <p className="profileDetailsText">
          Personal Details
        </p>
        <p className="changePersonalDetails" 
          onClick={()=>{changeDetails && onSubmit()
                        setChangeDetails((prev) => !prev)}}>
          {changeDetails ? 'done' : 'change'}
        </p>
      </div>

      <div className="profileCard">
        <form>
          <input type="text" id="name" className={!changeDetails ? 'profileName' : 'profileNameActive'} disabled={!changeDetails} value={name} onChange={onChange} />
          <input type="email" id="email" className='profileEmail' disabled value={email} onChange={onChange} />
        </form>
      </div>

      <Link to='/create-listing' className="createListing">
        <img src={homeIcon} alt="home" />
        <p>Sell or rent your home</p>
        <img src={arrowRight} alt="arrow right" />
      </Link>

      {!loading && listings?.length > 0 && (
        <>
          <p className="listingText">Your Listings</p>
          <ul className="listingsList">
            {
              listings.map((listing) => (
                <ListingItems key={listing.id} listing={listing.data} id={listing.id} onDelete={() => onDelete(listing.id)} onEdit={() => {onEdit(listing.id)}} />
              ))
            }
          </ul>
        </>
      )}
    </main>
  </div>;
};

export default Profile;
