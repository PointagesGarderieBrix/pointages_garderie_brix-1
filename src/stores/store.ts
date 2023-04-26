import { defineStore } from 'pinia'
import { initializeApp } from 'firebase/app';
import { User, getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, getDocs, collection, addDoc, deleteDoc, DocumentData, DocumentReference, where, query, and, updateDoc, getDoc } from 'firebase/firestore/lite';
import { computed, ref } from 'vue';
import { Kid } from '../interfaces';
const useStore = defineStore('store', () => {

  // Import the functions you need from the SDKs you need
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyBt1vv1mCQF5FNOpgAYM0zvONQZTDqJvyw",
    authDomain: "pointages-garderie-brix.firebaseapp.com",
    projectId: "pointages-garderie-brix",
    storageBucket: "pointages-garderie-brix.appspot.com",
    messagingSenderId: "957916000320",
    appId: "1:957916000320:web:ee270b45ff4de8adac2fa5"
  }

  // Initialize Firebase
  const app = initializeApp(firebaseConfig)
  const db = getFirestore(app)
  const auth = getAuth(app)
  const user = ref<User | null>(null)
  auth.onAuthStateChanged((userCredential) => {
    user.value = userCredential
  })
  const logInProgress = ref(false)
  const signIn = async (password: string) => {
    logInProgress.value = true
    try {
      await signInWithEmailAndPassword(auth, 'pointages.garderie.brix@gmail.com', password)
    } finally {
      logInProgress.value = true
    }
  }
  // ! KIDS
  const kids = computed(() => kidsData.value.sort((a, b) => {
    return a.data().Nom.localeCompare(b.data().Nom)
  }))
  const kidsData = ref<DocumentData[]>([])
  const kidsCollection = collection(db, 'Enfants')
  const getKids = async () => {
    kidsData.value = (await getDocs(kidsCollection)).docs
  }
  getKids()
  const addKid = async (lastName: string, firstName: string) => {
    const newKid: Kid = {
      Nom: lastName,
      Prénom: firstName
    }
    await addDoc(kidsCollection, newKid)
    getKids()
  }
  const deleteKid = async (kidRef: DocumentReference) => {
    await deleteDoc(kidRef)
    getKids()
  }

  // ! POINTAGES
  const pointagesCollection = collection(db, 'Pointages')
  const getPointages = async (start: Date, end: Date) => {
    const pointagesQuery = query(pointagesCollection,
      and(where('Jour', '>=', start),
        where('Jour', '<=', end))
    )
    const pointages = (await getDocs(pointagesQuery)).docs
    if (kids.value.length === 0) {
      await getKids()
    }
    for (const pointage of pointages) {
      if (!kids.value.find(kid => kid.id === pointage.data().Enfant)) {
        await deleteDoc(pointage.ref)
      }
    }
    return pointages
  }
  const addPointage = async (kid: string, start: number, end: number | null, day: Date, comment: string) => {
    const newPointage = {
      Enfant: kid,
      Arrivée: start,
      Jour: day,
      Commentaire: comment
    }
    if (end) {
      Object.assign(newPointage, { Départ: end })
    }
    await addDoc(pointagesCollection, newPointage)
  }
  const deletePointage = async (ref: DocumentReference) => {
    await deleteDoc(ref)
  }
  const updatePointage = async (pointageRef: DocumentReference, newPointage: Record<string, any>) => {
    await updateDoc(pointageRef, newPointage)
    return await getDoc(pointageRef)
  }
  return {
    app,
    signIn,
    kids,
    getKids,
    addKid,
    deleteKid,
    getPointages,
    addPointage,
    deletePointage,
    user,
    auth,
    updatePointage
  }
})
export default useStore