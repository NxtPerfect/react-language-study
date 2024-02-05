import {
  faArrowLeft,
  faArrowTurnDown,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";

function LanguageSection({
  index,
  language,
  level,
  countTotal,
  countLearnt
}: { index: number; language: string; level: Array<string>, countTotal: Array<string>, countLearnt: Array<string> }) {
  const [fold, setFold] = useState<boolean>(false);
  return (
    <>
      <div
        className="language_section"
        style={fold ? { height: "4rem" } : {}}
        key={index}
      >
        <div className="language_section_top">
          <h1>{language}</h1>
          <button type="button" onClick={() => setFold((curr) => !curr)}>
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">{!fold ? <path d="M6 9l6 6 6-6"/> : <path d="M15 18l-6-6 6-6"/>}</svg>
          </button>
        </div>
        <div className="language_levels_wrapper">
          {!fold
            ? level.map((levelLevel: string, levelIndex: number) => (
              <div className="language_level">
                <h3> Level: {levelLevel.toUpperCase()}</h3>
                <p>Progress: {countLearnt}/{countTotal[levelIndex]}</p>
                <div>
                  Progress bar
                </div>
                <Link
                  className="link"
                  key={levelIndex}
                  to={Cookies.get("email") ? `/flashcard/${language}/${levelLevel}` : '/login'}
                  style={{ textDecoration: "none" }}
                >
                  {Cookies.get("email") ? <button type="button">Learn now</button> : <button type="button">Log in to learn</button>}
                </Link>
              </div>
            ))
            : "(...)"}
        </div>
      </div>
    </>
  );
}

export default LanguageSection;
