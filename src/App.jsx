import {useState, useEffect} from 'react';
import './game.css';

export default function App() {
  return (
    <>
    <div>
      <h1>Test your memory with this game</h1>
      <p>Get points by clicking on an image but don't click on any more than once!</p>
    </div>
    <GameBody />
    </>
  )
}



async function fetchImages() {

  const response = await fetch("https://pokeapi.co/api/v2/pokemon/?limit=12", {
      mode: 'cors'
    })
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      return response.results;
    })
  return await response;
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

        const response = await fetchImages();
        Promise.all(response.map(async(pokemon) => {
          return await fetch(pokemon.url, {mode: "cors"})
          .then((res) => {
            return res.json();
          })
          .then((res) => res.sprites.front_default)
          .then (img => {
            return {
            img: img,
            id: pokemon.id,
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
      <div>
        <span>Current Streak: {userScore}</span>
        <span>Best Score: {bestScore}</span>
      </div>
      <Main 
      onGameOver={handleGameOver}
      onUserClick={handleScoreIncrease}
      initialCards={cards}
      />
    </>
  )
}


function Main({initialCards}) {
  const [cardsList, setCardsList] = useState(initialCards);

  function handleUserClick() {
    setCardsList(randomizeList(cardsList));
    console.log("clicked");
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
    <div onClick={onUserClick}>
      <img src={imgUrl} alt={img}/>
      <span id={cardName}>{cardName}</span>
    </div>
  )
}


function randomizeList(list) {
  let length = 0;
  const result = [...list];

  while(length < list.length/2) {
    let index = (length*31+length) % list.length;

    const temp = result[length];
    result[length] = result[index];
    result[index] = temp;
    length++; 
  }

  return result;
}