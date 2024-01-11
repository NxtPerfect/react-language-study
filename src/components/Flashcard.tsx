import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import {
  NavigateFunction,
  Params,
  useNavigate,
  useParams,
} from "react-router-dom";
import { Word } from "../App";
import Nav from "./Nav";

function Flashcard() {
  const [words, setWords] = useState<Array<Word>>([]);
  const [randomIndexes, setRandomIndexes] = useState<Array<number>>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [show, setShow] = useState<boolean>(false);
  const [changedWords, setChangedWords] = useState<boolean>(false);
  const params: Params = useParams();
  const language: string | undefined = params.language;
  const level: string | undefined = params.level;
  const navigate: NavigateFunction = useNavigate();

  /** Access api
   * and get words
   */
  useEffect(() => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ user_id: Cookies.get("user_id") }),
    };
    fetch(`http://localhost:6942/api/${language}&${level}`, requestOptions) // change language & level accoring to params
      .then((res) => res.json())
      .then((data) => {
        setWords(data);
        setChangedWords(true);
      })
      .catch((err) => {
        console.log(err);
        setChangedWords(true);
      });
  }, []);

  /** Populate array with indexes of words
   * randomize them
   * then pick from them, to pick random word from "words"
   * Somehow now it's undefined, and won't make it work like that
   */

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const indexes = Array.from(Array(words.length).keys());
    for (let index = 0; index < words.length; index++) {
      setRandomIndexes(indexes);
    }
    setRandomIndexes((curr) => curr.sort(() => Math.random() - 0.5));
    randomIndexes.sort(() => Math.random() - 0.5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changedWords]);

  /** When all words were learnt, save progress
   * and show appropriate html
   */
  useEffect(() => {
    if (randomIndexes.length === 0 && changedWords) {
      const progressData: Array<object> = [];
      for (const word of words) {
        progressData.push({
          user_id: Cookies.get("user_id"),
          word_id: word.word_id,
          language: language,
          level: level,
        });
      }
      const requestOptions = {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ progressData }),
      };
      fetch("http://localhost:6942/api/save_progress", requestOptions).then(
        () => {
          console.log("All words lernt");
          navigate("/");
        },
      );
    }
  }, [randomIndexes]);

  function incrementIndex() {
    if (currentIndex + 1 >= randomIndexes.length) {
      setCurrentIndex(0);
      return;
    }
    setCurrentIndex((curr) => curr + 1);
  }

  function guessedCorrect() {
    if (
      words[randomIndexes[currentIndex]].guessed === true &&
      words[randomIndexes[currentIndex]].guessed !== undefined
    ) {
      setRandomIndexes((curr) =>
        curr.filter((index) => index !== randomIndexes[currentIndex]),
      );
      setShow(false);
      return;
    }
    setWords((words) => {
      return words.map((word, index) => {
        if (index === randomIndexes[currentIndex])
          return { ...word, guessed: true };
        return word;
      });
    });
    setShow(false);
    incrementIndex();
  }

  function guessedWrong() {
    if (words[randomIndexes[currentIndex]].guessed === true) {
      setWords((words) => {
        return words.map((word, index) => {
          if (index === randomIndexes[currentIndex])
            return { ...word, guessed: false };
          return word;
        });
      });
    }
    setShow(false);
    incrementIndex();
  }

  if (words.length === 0) {
    return (
      <>
        <Nav />
        Loading words...
      </>
    );
  }

  if (randomIndexes.length === 0) {
    return (
      <>
        <Nav />
        All words learnt!!!
      </>
    );
  }

  if (show === true) {
    return (
      <>
        <Nav />
        Flashcard
        {language}
        {level}
        <div>
          <div key={words[randomIndexes[currentIndex]].word_id}>
            {words[randomIndexes[currentIndex]].sideA}{" "}
            {words[randomIndexes[currentIndex]].sideB}
          </div>
          <button type="button" onClick={guessedCorrect}>
            Correct
          </button>
          <button type="button" onClick={guessedWrong}>
            Wrong
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Nav />
      Flashcard
      {language}
      {level}
      <div>
        <div key={words[randomIndexes[currentIndex]].word_id}>
          {words[randomIndexes[currentIndex]].sideA}
        </div>
        <button
          type="button"
          onClick={() => {
            setShow(true);
          }}
        >
          Haha
        </button>
      </div>
    </>
  );
}
export default Flashcard;
