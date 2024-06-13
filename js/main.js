const cards = document.getElementById('cards');
const btn =  document.getElementById('goback');
const h2 = document.querySelector('h2');
let Sw = null;
let cardData = [];
let hash;

document.addEventListener('DOMContentLoaded', async() => {
  registerSW();
  getData();

  window.addEventListener('hashchange', handleHashChange);
  btn.addEventListener('click', goBack)
  cards.addEventListener('click', handleCardClicks)
});

  function getData() {
    fetch('https://random-data-api.com/api/v2/users?size=20')
    .then((res)=> {
      console.log(res);
      if(!res.ok) {
        throw new Error('Error In fetching Data');
        }
        return res.json();
        })
        .then((data)=>{
          console.log(data);
          showCards(data);
          sendData(cardData);
})
.catch((err)=> console.log(err));
}


  async function registerSW() {
    console.log('running');
    if('serviceWorker' in navigator){
      navigator.serviceWorker.register('./sw.js')
      .then((registration)=>{
        Sw = registration.installing || registration.waiting || registration.active;
        console.log('service worker installed', Sw);
        })
        .catch((err)=> console.error('Service Worker registration failed: ', err));
        

        navigator.serviceWorker.addEventListener('controllerChange', async() =>{
          Sw = navigator.serviceWorker.controller;
        })

        navigator.serviceWorker.addEventListener('message', receiveMessageFromSW)
        
        } else {
          console.log('service worker is not working');
          }
   }
          
   function goBack(){
    console.log('working');
    showCards(cardData);
    if(navigator.serviceWorker.controller){
      navigator.serviceWorker.controller.postMessage({type: 'goBack', cacheData: cardData})
    }
  }
  
  async function showCards(data) {
    cards.innerHTML = '';
    window.location.hash = "#"
    cardData = []; 
    let df = new DocumentFragment();
    data.forEach((items)=>{
      const {uid, username, avatar, 
        social_insurance_number} = items;

      let card = document.createElement("li");
      card.classList.add('card');
      card.setAttribute('data-ref', uid);
      card.style.setProperty("--background-img", `url(${avatar})`);

    let user = document.createElement("p");
    user.textContent = username;

    let sin=document.createElement("p");
    sin.textContent= social_insurance_number;

    cardData.push({ uid: uid, username: username, avatar: avatar, social_insurance_number: social_insurance_number})

    card.append(user);
    card.append(sin);
    df.append(card);
    })
    cards.append(df);
  }

  function handleCardClicks(ev) {
    if(ev.target.closest('.card')){
      console.log('clicking on card')
      let card = ev.target.closest('.card').getAttribute('data-ref')
      window.location.hash = `#${card}`;
      setRandomColor();
    }
  }
  
  function sendData(data) {
  if (navigator.serviceWorker.controller) {
    Sw.postMessage({type: 'Cache-data', payload: data });
  } else {
    console.log('No active Service Worker to send message to.');
  }
}





function handleHashChange() {
   hash = window.location.hash.substring(1);
  if (hash === '' || hash === '#') {
    cards.querySelectorAll('.card').forEach(card => card.style.display = 'unset');
    } else {
      cards.querySelectorAll('.card').forEach(card => {
        let specificCard = card.getAttribute('data-ref');
        if( specificCard  === hash) {
          card.style.display = 'block';          
          } 
          else {
            card.style.display = 'none';
      }
    });
  }
  sendMessageToSW(hash);
}

      // setRandomColor()
    function getRandomColor(){
    let letters = '0123456789ABCDEF';
    let color = '#';
      for(let i=0; i < 6; i++){
        color += letters[Math.floor(Math.random()*16)]; 
      }
        return color;
      }
      
      function setRandomColor(){
        if(navigator.serviceWorker.controller){
          Sw.postMessage({ type: 'changeColor', color: getRandomColor()})
        }
      }

    function sendMessageToSW(uid) {
      if(navigator.serviceWorker.controller){
        Sw.postMessage({ Func: 'changeUser', uid: uid})
      }
    }

function receiveMessageFromSW(ev) {              
    const data = ev.data;
    // console.log(data);
    console.log("coming from  sw");
  if(data.func === 'changeUser'){
    const {uid} = data;
    window.location.hash = `#${uid}`;
    
  } else if(data.type === 'goBack'){
    const {cacheData} = data;
    console.log(cacheData);
     showCards(cacheData);
  }
  else if(data.type === 'changeColor'){
    console.log(data);
    h2.style.color =data.color;
  }
}

