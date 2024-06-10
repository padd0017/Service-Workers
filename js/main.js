const cards = document.getElementById('cards');
const btn =  document.getElementById('goback');
let Sw = null;
let cardData = [];


let hash;

document.addEventListener('DOMContentLoaded', async() => {
  registerSW();
  getData();


  window.addEventListener('hashchange', handleHashChange);
// btn.addEventListener('click', goBack)
  if(window.location.hash) {
    handleHashChange();
  }

  cards.addEventListener('click', handleCardClicks)
  //register the service worker and add message event listener
  //listen for navigation popstate event
  //get the data for the page
  //add click listener to #cards
  });
  





  function getData() {
    fetch('https://random-data-api.com/api/v2/users?size=20')
    .then((res)=> {
      if(!res.ok) {
        throw new Error('Error In fetching Data');
        }
        return res.json();
        })
        .then((data)=>{
          showCards(data);
          sendData(cardData);
     
})
.catch((err)=> console.log(err));
}


  async function registerSW() {
    console.log('running');
    if('serviceWorker' in navigator){
      navigator.serviceWorker.register('../sw.js')
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
          

  
  async function showCards(data) {
    cards.innerHTML = '';
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

   cardData.push({
      uid: uid,
      username: username,
      avatar: avatar,
      social_insurance_number: social_insurance_number
    })

    // console.log(cardData)
    card.append(user);
    card.append(sin);
    df.append(card);
    })
   
    cards.append(df);
  }


  function handleCardClicks(ev) {
    if(ev.target.closest('.card')){
      let card = ev.target.closest('.card').getAttribute('data-ref')
      console.log(card);
      window.location.hash = `#${card}`;
     
      
    }
  }
  
  function sendData(data) {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'Cache-data',
      payload: data
    });
  } else {
    console.log('No active Service Worker to send message to.');
  }
}





function handleHashChange() {
   hash = window.location.hash.substring(1);
  console.log(hash)
  if (hash === '' && hash === '#') {
    cards.querySelectorAll('.card').forEach(card => card.style.display = 'block');
    } else {
      cards.querySelectorAll('.card').forEach(card => {
        let specificCard = card.getAttribute('data-ref');
        console.log(specificCard);
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

      function makeOneCard(data) {
        console.log('hehe');
      }

    function sendMessageToSW(uid) {
      if(navigator.serviceWorker.controller){
        navigator.serviceWorker.controller.postMessage({ Func: 'changeUser', uid: uid})
      }
    }

function receiveMessageFromSW(ev) {              
    const data = ev.data;
    console.log(data);
    console.log("coming from  sw");
  if(data.func === 'changeUser'){
    const {uid} = data;
    window.location.hash = `#${uid}`;
    
  }
}