import { SpiderBall } from "./spiderBall";
import "./style.css";

const canvas = document.querySelector<HTMLCanvasElement>("canvas#canvas");
const body = document.querySelector<HTMLBodyElement>("body");

if (canvas && body) {
  const game = new SpiderBall(canvas);
  body.addEventListener("keydown", (event) => {
    if (!event.repeat) {
      game.pressedKeys.add(event.code);
    }
  });
  body.addEventListener("keyup", (event) => {
    game.pressedKeys.delete(event.code);
  });

  canvas.addEventListener("mousedown", (event) => {
    game.pressedMouseButtons.add(event.button);
    game.mouseX = event.offsetX;
    game.mouseY = event.offsetY;
    game.startLevelIfNotPlaying();
  });
  canvas.addEventListener("mousemove", (event) => {
    game.mouseX = event.offsetX;
    game.mouseY = event.offsetY;
  });
  canvas.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  const levelInput = document.querySelector<HTMLInputElement>("input#levelInput");
  const loadButton = document.querySelector<HTMLButtonElement>("button#load");
  loadButton?.addEventListener("click", () => {
    const levelString = levelInput?.value;
    if (levelString) {
      game.setNextLevelString(levelString.trim());
    }
  });

  function step() {
    game.stepAndRender();

    window.requestAnimationFrame(step);
  }
  window.requestAnimationFrame(step);
}
