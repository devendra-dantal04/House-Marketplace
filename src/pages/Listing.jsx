import React,{useState, useEffect} from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getDoc, doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebase.config";
import Spinner from "../components/Spinner";
import shareIcon from "../assets/svg/shareIcon.svg"
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";


// import required modules
import { EffectFade, Pagination } from "swiper";



const Listing = () => {
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sharedLinkCopied, setSharedLinkCopied] = useState(false)

  const navigate = useNavigate()
  const params = useParams()
  const auth = getAuth() 

  useEffect(() => {
    const fetchListing = async () =>{
        const docRef = doc(db,'listing',params.listingId)
        const docSnap = await getDoc(docRef)

        if(docSnap.exists()){
            setListing(docSnap.data())
            setLoading(false)
        }
    }


    fetchListing()
  },[navigate, params.listingId])


  if(loading){
    return <Spinner />
  }

  return (
    <main>

        

      <Swiper
        slidesPerView={1}
        loop={true}
        effect={"fade"}
        navigation={true}
        pagination={{
          clickable: true,
        }}
        modules={[EffectFade, Pagination]}
        className="mySwiper"
      >

        {listing.imgUrls.map((url,index) => (
          
          <SwiperSlide key={index}>
             <div style={{background : `url(${url}) center no-repeat`, backgroundSize:'cover'}} className="swiperSlideDiv"></div>
          {/* <img src={`${url}`} alt="" /> */}
          </SwiperSlide>
        ))}
      </Swiper>


        <div className="shareIconDiv" onClick={()=>{
            navigator.clipboard.writeText(window.location.href)
            setSharedLinkCopied(true)
            setTimeout(()=>{
                setSharedLinkCopied(false)
            },2000)
        }}>
            <img src={shareIcon} alt="" />
        </div>

        {sharedLinkCopied && <p className="linkCopied">Link Copied</p>}

        <div className="listingDetails">
            <p className="listingName">{listing.name} - ${listing.offer ? listing.discountedPrice : listing.regularPrice}</p>
            <p className="listingLocation">{listing.location}</p>
            <p className="listingType">For {listing.type === 'rent' ? "Rent" : "Sale"}</p>
            {listing.offer && (
                <p className="discountPrice">
                    ${listing.regularPrice - listing.discountedPrice} discount
                </p>
            )}

            <ul className="listingDetailsList">
                <li>
                    {listing.bedroom > 1 ? `${listing.bedrooms} Bedrooms` : "1 Bedroom"}
                </li>
                <li>
                    {listing.bedroom > 1 ? `${listing.bathrooms} Bathrooms` : "1 Bathroom"}
                </li>
                <li>
                    {listing.parking && "Parking Spot"}
                </li>
                <li>
                    {listing.furnished && "Furnished"}
                </li>

                <p className="listingLocationTitle">Location</p>

                <div className="leafletContainer">
                    <MapContainer style={{height : '100%', width : '100%'}} center={[listing.geolocation.lat, listing.geolocation.lng]} zoom={13} scrollWheelZoom={false}>
                        <TileLayer attribution='' url="https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png"/>
                        {/* attribution = &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors */}
                        <Marker position={[listing.geolocation.lat, listing.geolocation.lng]}>
                            <Popup>{listing.location}</Popup>
                        </Marker>
                    </MapContainer>
                </div>

                {auth.currentUser?.uid !== listing.userRef && (
                    <Link to={`/contact/${listing.userRef}?listingName=${listing.name}`} className="primaryButton">Contact Landlord</Link>
                )}
            </ul>
        </div>
    </main>
  );
};

export default Listing;
