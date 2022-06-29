import React,{useState, useEffect} from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { getDoc, doc} from "firebase/firestore"
import { db } from "../firebase.config";
import {toast} from "react-toastify"

const Contact = () => {
  const [message, setMessage] = useState('')
  const [landlord, setLandlord] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()

  const params = useParams()

  const onChange = (e) =>[
    setMessage(e.target.value)
  ]

  useEffect(()=>{
    const getLandlord = async () => {
        const docRef = doc(db,'users', params.landlordId)
        const docSnap = await getDoc(docRef)

        if(docSnap.exists()) {
            console.log(docSnap.data())
            setLandlord(docSnap.data())
        }else{
            toast.error('Could not get landlord data')
        }
    }
    

    getLandlord()
  }, [params.landlordId])

  return <div className="pageContainer">
        <header>
            <p className="pageHeader">
                Contact Landlord
            </p>
        </header>

        {landlord !== null && (
            <main>
                <div className="contactLandlor">
                    <p className="landlordName">
                        Contact {landlord?.name}
                    </p>
                </div>


                <form className="messageForm">
                    <div className="messageDiv">
                        <label htmlFor="message" className="messagelabel">Message</label>
                        <textarea name="message" id="message" className="textarea" value={message} onChange={onChange}></textarea>
                    </div>

                    <a href={`mailto:${landlord.email}?Subject=${searchParams.get('listingName')}&body=${message}`}>
                        <button type="button" className="primaryButton">Send Message</button>
                    </a>
                </form>
            </main>
        )}
    </div>;
};

export default Contact;
