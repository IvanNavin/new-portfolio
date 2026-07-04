import { io } from "socket.io-client";
import "./index.scss";
import ClientGame from "./client/ClientGame";
import { getTime, escapeHtml } from "./common/util";
import world from "./configs/world.json";
import sprites from "./configs/sprites";
import gameObjects from "./configs/gameObjects.json";

window.addEventListener("load", async () => {
  const socket = io(window.location.origin);
  const startGame = document.querySelector(".start-game");
  const nameForm = document.getElementById("nameForm");
  const warning = nameForm.querySelector(".warning");

  const chatWrap = document.querySelector(".chat-wrap");
  const chatForm = document.getElementById("form");
  const messageBox = chatWrap.querySelector(".message");
  const dpad = document.querySelector(".dpad");

  let isFirstConnection = true;
  let currentUserId = "";

  startGame.style.display = "flex";

  // Keep the newest message in view. Only auto-scroll when the user is already
  // near the bottom, so reading history isn't yanked away by incoming messages.
  const appendMessage = (html) => {
    const nearBottom =
      messageBox.scrollHeight - messageBox.scrollTop - messageBox.clientHeight <
      60;
    messageBox.insertAdjacentHTML("beforeend", html);
    if (nearBottom) messageBox.scrollTop = messageBox.scrollHeight;
  };

  const showWarning = (text) => {
    warning.textContent = text;
    warning.style.opacity = "1";
  };
  const hideWarning = () => {
    warning.style.opacity = "0";
  };

  // Touch/mouse D-pad: hold a button to move, release to stop. We drive the same
  // keysPressed set the keyboard uses, so no extra logic in the game loop.
  const bindDpad = () => {
    const input =
      ClientGame.game && ClientGame.game.engine && ClientGame.game.engine.input;
    if (!input || !dpad) return;

    const press = (code) => input.keysPressed.add(code);
    const release = (code) => input.keysPressed.delete(code);

    dpad.querySelectorAll("[data-key]").forEach((btn) => {
      const code = btn.dataset.key;
      const down = (e) => {
        e.preventDefault();
        press(code);
      };
      const up = (e) => {
        e.preventDefault();
        release(code);
      };
      btn.addEventListener("pointerdown", down);
      btn.addEventListener("pointerup", up);
      btn.addEventListener("pointerleave", up);
      btn.addEventListener("pointercancel", up);
    });

    dpad.classList.add("is-active");
  };

  const submitName = (event) => {
    event.preventDefault();
    const name = nameForm.name.value.trim();

    if (!name.length) {
      showWarning("Enter a name to start.");
      return;
    }

    if (name.length > 12) {
      showWarning("That name is too long — keep it under 12 characters.");
      return;
    }

    hideWarning();

    // Pass the existing socket to the game API to avoid duplicate connections
    ClientGame.init({
      tagID: "world",
      playerName: name,
      world,
      sprites,
      gameObjects,
      apiCfg: {
        socket, // Reuse existing socket!
      },
    });

    socket.emit("start", name);
    bindDpad();

    chatWrap.style.display = "block";
    nameForm.removeEventListener("submit", submitName);
    startGame.remove();
  };

  const submitMessage = (event) => {
    event.preventDefault();
    const input = chatForm.message;

    if (input.value.trim()) {
      socket.emit("chat message", input.value);
      input.value = "";
    }
  };

  nameForm.addEventListener("submit", submitName);
  nameForm.name.addEventListener("input", hideWarning);
  chatForm.addEventListener("submit", submitMessage);

  socket.on("chat online", ({ online }) => {
    chatWrap.dataset.online = online;
  });

  socket.on("chat connection", ({ time, msg, id }) => {
    if (isFirstConnection) {
      currentUserId = id;
      isFirstConnection = false;
    }

    appendMessage(
      `<p><strong>${getTime(time)}</strong> ${escapeHtml(msg)}</p>`,
    );
  });

  socket.on("chat disconnect", ({ time, msg }) => {
    appendMessage(
      `<p><strong>${getTime(time)}</strong> ${escapeHtml(msg)}</p>`,
    );
  });

  socket.on("chat message", ({ name, time, msg, id }) => {
    const isCurrentUser = currentUserId === id;

    appendMessage(
      `<p class="msg-box ${isCurrentUser ? "isCurrentUser" : ""}">
              <span class="name">${escapeHtml(name)}</span>
              <span class="msg" data-time="${getTime(time)}">${escapeHtml(msg)}</span>
            </p>`,
    );
  });
});
