import {useState, useEffect} from 'react';
import './game.css';

export default function App() {
  return (
    <>
    <div className="left-header">
      <h1>Test your memory with this game</h1>
      <p>Get points by clicking on an image but don't click on any more than once!</p>
    </div>
    <GameBody />
    </>
  )
}



async function fetchUrls() {

  const response = await fetch("https://pokeapi.co/api/v2/pokemon/?limit=36", {
      mode: 'cors'
    })
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      return response.results;
    })
  let index = 0;
  const list = await response.filter((ele) => {
    index +=1;
    if(index % 3 === 0) return ele;
  })
  return await list;
}



function GameBody() {
  const [userScore, setUserScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [cards, setCards] = useState([]);

  function handleGameOver() {
    if(userScore > bestScore) setBestScore(userScore);
    setUserScore(0);
  }
  function handleScoreIncrease() {
    setUserScore(userScore + 1);
  }

  useEffect(() =>  {
    let ignore = false;

    if(!ignore) {

      async function loadData() {

        const response = await fetchUrls();
        let key = -1;

        Promise.all(response.map(async(pokemon) => {
          return await fetch(pokemon.url, {mode: "cors"})
          .then((res) => {
            return res.json();
          })
          .then((res) => res.sprites.front_default)
          .then (img => {
            key += 1;
            return {
            img: img,
            id: key,
            name: pokemon.name
          }
          })

        })).then((res) => {
          setCards(res);
        })
      }

      loadData();
    }

    return () => ignore = true;

  }, [])

  return (
    <>
      <div className='score-card right-header'>
        <div>Current Streak: {userScore}</div>
        <div>Best Score: {bestScore}</div>
      </div>
      <Main 
      onGameOver={handleGameOver}
      onUserClick={handleScoreIncrease}
      initialCards={cards}
      key={cards.length}
      />
    </>
  )
}


function Main({initialCards, onUserClick, onGameOver}) {

  if(initialCards.length ==0) {
    return (
      <div>Loading.....</div>
    )
  }
  const [cardsList, setCardsList] = useState(initialCards);
  const [userSelctedList, setUserSelectedList] = useState([]);
  function handleUserClick(e) {
    
    const check = userSelctedList.find((ele) => ele === e.target.getAttribute('alt') )

    if(!!check) {
      onGameOver();
      return;
    }

    onUserClick();
    setCardsList(randomizeList(cardsList));
    setUserSelectedList([...userSelctedList, e.target.getAttribute('alt')]);
  }

  return (
    <main>
      { cardsList.length > 0 ? 
        cardsList.map((card) => {
          return <PlayerCard 
          cardName={card.name}
          key={card.id}
          imgUrl={card.img}
          onUserClick={handleUserClick}
          />
        }) : 
        <div>Loading......</div>
      }
    </main>
  )
}

function PlayerCard({cardName, onUserClick, imgUrl}) {
  return (
    <div onClick={onUserClick} className="cards">
      <img src={imgUrl} alt={cardName}/>
      <span id={cardName}>{cardName}</span>
    </div>
  )
}


function randomizeList(list) {
  let length = 0;
  const result = [...list];

  while(length < list.length) {
    let index = (length*31+length) % list.length;

    const temp = result[length];
    result[length] = result[index];
    result[index] = temp;
    length++; 
  }

  return result;
}