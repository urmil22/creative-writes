import Message from "../components/message"
import { useRouter } from "next/router"
import { useState, useEffect } from "react"
import { auth, db} from "../utils/firebase"
import { toast } from "react-toastify";
import { arrayUnion, doc, getDoc, onSnapshot, Timestamp, updateDoc } from "firebase/firestore";


export default function Details() {
    const router  = useRouter();
    const routeData = router.query;
    const [message, setMessage] = useState("");
    const [allMessage, setAllMessages] = useState([]);

    //submit a message
    const submitMessage = async() => {
        //check if the user is logged
        if(!auth.currentUser) return router.push("/auth/login");

        if(!message){
            toast.error("Don't leave an empty message 😅", {
                position: toast.POSITION.TOP_CENTER,
                autoClose: 1500,
            })
            return;
        }
        const docRef = doc(db, 'posts', routeData.id);
        await updateDoc(docRef, {
            comments: arrayUnion({
                message,
                avatar: auth.currentUser.photoURL,
                username: auth.currentUser.displayName,
                time: Timestamp.now(),
            }),
        });
        //reset
        setMessage("");
    }

    //get comments
    const getComments = async () => {
        const docRef = doc(db, "posts", routeData.id);
        const unsubscribe = onSnapshot(docRef, (snapshot) => {
          setAllMessages(snapshot.data().comments);
        });
        return unsubscribe;
      };

    useEffect(() => {
        if (!router.isReady) return;
       getComments();
    }, [router.isReady]);

    return(
        <div>
            <Message {...routeData}>

            </Message>
            <div className="my-4 ">
                <div className="flex">
                    <input type="text" value={message} 
                    onChange={(e) => setMessage(e.target.value)}
                    className="bg-gray-800 w-full p-2 text-white text-sm"
                     placeholder="Send a message 😀"/>
                     <button onClick={submitMessage}
                     className="bg-cyan-500 text-white py-2 px-4 text-sm">Submit
                     </button>
                </div>
                <div className="py-6">
                   <h2 className="font-bold">Comments</h2>
                   {allMessage?.map((message) => (
                    <div className="bg-white p-4 my-4 border-2" key={message.time}>
                        <div className="flex items-center gap-2 mb-4">
                            <img className="w-10 rounded-full"
                            src={message.avatar} alt=""/>
                            <h2>{message.username}</h2>
                        </div>
                        <h2>{message.message}</h2>
                    </div>
                   ))}
                </div>
            </div>
        </div>
    )
}