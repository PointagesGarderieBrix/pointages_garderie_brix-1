import { defineStore } from 'pinia'
import { initializeApp } from 'firebase/app';
import { User, getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, getDocs, collection, addDoc, deleteDoc, DocumentData, DocumentReference, where, query, and, updateDoc, getDoc, QueryDocumentSnapshot } from 'firebase/firestore/lite';
import { computed, ref } from 'vue';
import { Kid, Pointage } from '../interfaces';
import dayjs from 'dayjs';
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
  const getData = (document: QueryDocumentSnapshot<DocumentData>) => {
    const data = document.data() as Pointage
    const kid: Kid = kids.value.find(kid => kid.id === data.Enfant)!.data() as Kid
    const durée = (dayjs(data.Départ).hour() - dayjs(data.Arrivée).hour()) + ((dayjs(data.Départ).minute() - dayjs(data.Arrivée).minute()) / 60)
    const duréeRounded = Math.ceil(durée * 2) / 2
    const jour = dayjs(data.Jour.seconds * 1000).format('dddd - D/MM/YYYY')
    const AMorPM = dayjs(data.Arrivée).hour() < 12 ? 'Matin' : 'Après-midi'
    const arrivée = dayjs(data.Arrivée).format('HH:mm')
    const départ = dayjs(data.Départ).format('HH:mm')
    const comment = data.Commentaire ?? ''
    const name = `${kid.Nom} ${kid.Prénom}`
    return {
      name,
      jour,
      kid,
      durée,
      AMorPM,
      arrivée,
      départ,
      comment,
      duréeRounded
    }
  }
  return {
    app,
    getData,
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