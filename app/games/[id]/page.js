'use client'

import Styles from "./Game.module.css";
import { GameNotFound } from "@/app/components/GameNotFound/GameNotFound";
import { useEffect, useState } from "react";
import { endpoints } from "@/app/api/config";
import { Preloader } from "@/app/components/Preloader/Preloader";
import { isResponseOk, getNormalizedGameDataById, checkIfUserVoted, vote } from "../../api/api-utils";
import { useStore } from "@/app/store/app-store";


export default function GamePage(props) {

  const authContext = useStore();
  const [preloaderVisible, setPreloaderVisible] = useState(true);
  const [game, setGame] = useState(null);
  const [isVoted, setIsVoted] = useState(false);

  const handleVote = async () => {
    const jwt = authContext.token; 
    let usersIdArray = game.users.length
    ? game.users.map((user) => user.id)
    : [];
    usersIdArray.push(authContext.user.id);
    const response = await vote(
      `${endpoints.games}/${game.id}`,
      jwt,
      usersIdArray
    );
    if (isResponseOk(response)) {
      setGame(() => {
        return {
        ...game,
        users: [...game.users, authContext.user],
      };
    });
    setIsVoted(true);
  }}

  useEffect(() => {
    async function fetchData() {
      setPreloaderVisible(true);
      const game = await getNormalizedGameDataById(endpoints.games, props.params.id);
      isResponseOk(game) ? setGame(game) : setGame(null);
      setPreloaderVisible(false);
    }

    fetchData();
    }, [])

  useEffect(() => {
    authContext.user && game ? 
      setIsVoted(checkIfUserVoted(game, authContext.user.id)) 
      : setIsVoted(false);
  }, [authContext.user, game]);

  return (
    <main className="main">
      {game ? (
        <>
          <section className={Styles["game"]}>
            <iframe
              className={Styles["game__iframe"]}
              src={game.link}
            ></iframe>
          </section>
          <section className={Styles["about"]}>
            <h2 className={Styles["about__title"]}>{game.title}</h2>
            <div className={Styles["about__content"]}>
              <p className={Styles["about__description"]}>
                {game.description}
              </p>
              <div className={Styles["about__author"]}>
                <p>
                  Автор:
                  <span className={Styles["about__accent"]}>{game.developer}</span>
                </p>
              </div>
            </div>
            <div className={Styles["about__vote"]}>
              <p className={Styles["about__vote-amount"]}>
                За игру уже проголосовали:
                <span className={Styles["about__accent"]}>{game.users.length}</span>
              </p>
              <button 
                className={`button ${Styles["about__vote-button"]}`} 
                disabled={!authContext.isAuth || isVoted}
                onClick={handleVote}
              >
                {isVoted ? 'Голос учтён' : 'Голосовать'}
              </button>
            </div>
          </section>
        </>
      ) : preloaderVisible ? (
          <Preloader />
      ) : (
          <section className={Styles['game']}>
            <GameNotFound/>
          </section>
      )}
    </main>
  );
}