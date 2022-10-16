import { SpiderBall } from "./spiderBall";
import "./style.css";

const canvas = document.querySelector<HTMLCanvasElement>("canvas#canvas");
const ctx = canvas?.getContext("2d");
const body = document.querySelector<HTMLBodyElement>("body");

if (canvas && ctx && body) {
  const game = new SpiderBall();
  body.addEventListener("keydown", (event) => {
    if (!event.repeat) {
      game.pressedKeys.add(event.code);
      console.log([...game.pressedKeys]);
    }
  });
  body.addEventListener("keyup", (event) => {
    game.pressedKeys.delete(event.code);
    console.log([...game.pressedKeys]);
  });

  canvas.addEventListener("mousedown", (event) => {
    console.log("down", event.button, event.offsetX, event.offsetY);
    game.pressedMouseButtons.add(event.button);
    game.mouseX = event.offsetX;
    game.mouseY = event.offsetY;
    game.startLevelIfNotPlaying();
  });
  canvas.addEventListener("mousemove", (event) => {
    console.log("move", event.offsetX, event.offsetY);
    game.mouseX = event.offsetX;
    game.mouseY = event.offsetY;
  });
  canvas.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  const ctxSet = ctx;

  function step() {
    game.drawAndStep(ctxSet);

    window.requestAnimationFrame(step);
  }
  window.requestAnimationFrame(step);
}